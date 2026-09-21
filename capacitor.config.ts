import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.servicetones.app",
  appName: "ServiceTones",
  webDir: "dist",
  server: { androidScheme: "https" },
  ios: { contentInset: "automatic" },
  android: { backgroundColor: "#f7f9fc" },
};
export default config;
