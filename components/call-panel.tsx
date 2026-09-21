import { useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCalls } from "@/hooks/use-calls";
export function CallPanel({ calls }: { calls: ReturnType<typeof useCalls> }) {
  const local = useRef<HTMLVideoElement>(null),
    remote = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (local.current) local.current.srcObject = calls.local;
  }, [calls.local, calls.call]);
  useEffect(() => {
    if (remote.current) remote.current.srcObject = calls.remote;
  }, [calls.remote, calls.call]);
  return (
    <Dialog open={!!calls.call}>
      <DialogContent
        className="call-panel"
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle>{calls.call?.name}</DialogTitle>
        <DialogDescription>
          {calls.call?.status === "incoming"
            ? `Incoming ${calls.call.video ? "video" : "audio"} call`
            : calls.call?.status === "connected"
              ? "Connected"
              : calls.call?.status === "ringing"
                ? "Calling…"
                : "Connecting…"}
        </DialogDescription>
        <div className="call-video">
          <video
            ref={remote}
            autoPlay
            playsInline
            className={calls.call?.video ? "remote-video" : "audio-only"}
          />
          {!calls.remote && (
            <div className="call-placeholder">
              <Phone size={46} />
            </div>
          )}
          <video
            ref={local}
            autoPlay
            playsInline
            muted
            className={calls.call?.video ? "local-video" : "audio-only"}
          />
        </div>
        <div className="call-controls">
          {calls.call?.status === "incoming" ? (
            <button className="primary" onClick={() => void calls.accept()}>
              <Phone size={20} /> Accept
            </button>
          ) : (
            <>
              <button
                className="outline"
                onClick={calls.toggleMute}
                aria-label={
                  calls.muted ? "Unmute microphone" : "Mute microphone"
                }
              >
                {calls.muted ? <MicOff /> : <Mic />}
              </button>
              {calls.call?.video && (
                <button
                  className="outline"
                  onClick={calls.toggleCamera}
                  aria-label={
                    calls.camera ? "Turn camera off" : "Turn camera on"
                  }
                >
                  {calls.camera ? <Video /> : <VideoOff />}
                </button>
              )}
            </>
          )}
          <button className="danger" onClick={calls.end}>
            <PhoneOff size={20} />
            {calls.call?.status === "incoming" ? "Decline" : "End call"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
