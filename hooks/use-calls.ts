import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { api } from "@/lib/api";
import { toast } from "sonner";
type Signal = {
  type: string;
  callId: string;
  conversationId: string;
  video?: boolean;
  name?: string;
  data?: unknown;
};
type Call = {
  callId: string;
  conversationId: string;
  video: boolean;
  name: string;
  status: "incoming" | "ringing" | "connecting" | "connected";
};
export function useCalls(socket: Socket | null) {
  const [call, setCall] = useState<Call | null>(null),
    [local, setLocal] = useState<MediaStream | null>(null),
    [remote, setRemote] = useState<MediaStream | null>(null),
    [muted, setMuted] = useState(false),
    [camera, setCamera] = useState(true);
  const active = useRef<Call | null>(null),
    pc = useRef<RTCPeerConnection | null>(null),
    stream = useRef<MediaStream | null>(null),
    candidates = useRef<RTCIceCandidateInit[]>([]),
    generation = useRef(0);
  const update = (c: Call | null) => {
    active.current = c;
    setCall(c);
  };
  const clean = () => {
    generation.current++;
    pc.current?.close();
    pc.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    candidates.current = [];
    setLocal(null);
    setRemote(null);
    setMuted(false);
    setCamera(true);
    update(null);
  };
  const send = (s: Signal) =>
    new Promise<void>((resolve, reject) => {
      if (!socket?.connected)
        return reject(new Error("Chat is disconnected. Please reconnect."));
      socket
        .timeout(8000)
        .emit("signal", s, (err: Error | null, result: { error?: string }) =>
          err
            ? reject(new Error("Call timed out."))
            : result?.error
              ? reject(new Error(result.error))
              : resolve(),
        );
    });
  const prepare = async (c: Call) => {
    const stamp = generation.current;
    const iceServers = await api<RTCIceServer[]>("/ice");
    if (!navigator.mediaDevices?.getUserMedia)
      throw new Error(
        "Camera and microphone need HTTPS or a supported device.",
      );
    const media = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: c.video,
    });
    if (generation.current !== stamp || active.current?.callId !== c.callId) {
      media.getTracks().forEach((t) => t.stop());
      throw new Error("Call ended.");
    }
    stream.current = media;
    setLocal(media);
    const peer = new RTCPeerConnection({ iceServers });
    pc.current = peer;
    media.getTracks().forEach((t) => peer.addTrack(t, media));
    peer.ontrack = (e) => setRemote(e.streams[0]);
    peer.onicecandidate = (e) => {
      if (e.candidate)
        void send({ ...c, type: "ice", data: e.candidate.toJSON() }).catch(
          () => {},
        );
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected" && active.current)
        update({ ...active.current, status: "connected" });
      if (peer.connectionState === "failed") {
        toast.error("Call connection failed. Please try again.");
        void send({ ...c, type: "end" }).catch(() => {});
        clean();
      }
    };
    return peer;
  };
  useEffect(() => {
    if (!socket) return;
    const receive = async (s: Signal) => {
      try {
        if (s.type === "invite") {
          if (active.current) {
            await send({ ...s, type: "reject" });
            return;
          }
          update({
            callId: s.callId,
            conversationId: s.conversationId,
            video: !!s.video,
            name: s.name || "Your contact",
            status: "incoming",
          });
          return;
        }
        const c = active.current;
        if (!c || c.callId !== s.callId) return;
        if (s.type === "reject" || s.type === "end") {
          toast.info(s.type === "reject" ? "Call declined." : "Call ended.");
          clean();
          return;
        }
        if (s.type === "accept") {
          update({ ...c, status: "connecting" });
          const peer = await prepare(c);
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          await send({ ...c, type: "offer", data: offer });
        }
        if (s.type === "offer") {
          const peer = pc.current;
          if (!peer) return;
          await peer.setRemoteDescription(s.data as RTCSessionDescriptionInit);
          for (const candidate of candidates.current)
            await peer.addIceCandidate(candidate);
          candidates.current = [];
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          await send({ ...c, type: "answer", data: answer });
        }
        if (s.type === "answer" && pc.current) {
          await pc.current.setRemoteDescription(
            s.data as RTCSessionDescriptionInit,
          );
          for (const candidate of candidates.current)
            await pc.current.addIceCandidate(candidate);
          candidates.current = [];
        }
        if (s.type === "ice") {
          if (pc.current?.remoteDescription)
            await pc.current.addIceCandidate(s.data as RTCIceCandidateInit);
          else candidates.current.push(s.data as RTCIceCandidateInit);
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Unable to connect call.");
        if (active.current)
          void send({ ...active.current, type: "end" }).catch(() => {});
        clean();
      }
    };
    socket.on("signal", receive);
    socket.on("disconnect", clean);
    return () => {
      socket.off("signal", receive);
      socket.off("disconnect", clean);
      clean();
    };
    // Socket lifetime owns this call session. Mutable call data is held in refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);
  return {
    call,
    local,
    remote,
    muted,
    camera,
    start: async (conversationId: string, name: string, video: boolean) => {
      if (active.current) return;
      const c: Call = {
        callId: crypto.randomUUID(),
        conversationId,
        name,
        video,
        status: "ringing",
      };
      update(c);
      try {
        await send({ ...c, type: "invite" });
      } catch (e) {
        toast.error((e as Error).message);
        clean();
      }
    },
    accept: async () => {
      const c = active.current;
      if (!c) return;
      update({ ...c, status: "connecting" });
      try {
        await prepare(c);
        await send({ ...c, type: "accept" });
      } catch (e) {
        toast.error((e as Error).message);
        void send({ ...c, type: "reject" }).catch(() => {});
        clean();
      }
    },
    end: () => {
      const c = active.current;
      if (c)
        void send({
          ...c,
          type: c.status === "incoming" ? "reject" : "end",
        }).catch(() => {});
      clean();
    },
    toggleMute: () => {
      stream.current?.getAudioTracks().forEach((t) => (t.enabled = muted));
      setMuted(!muted);
    },
    toggleCamera: () => {
      stream.current?.getVideoTracks().forEach((t) => (t.enabled = !camera));
      setCamera(!camera);
    },
  };
}
