import type { CapacitorConfig } from "@capacitor/cli";
import environments from "./config/environments.json";
const target = Object.values(environments).find(
  (e) => e.environment === (process.env.APP_ENV || "development"),
)!;
const config: CapacitorConfig = {
  appId: target.appId,
  appName: target.appName,
  webDir: "dist/client",
  server: { androidScheme: "https" },
  ios: { contentInset: "automatic" },
  android: { backgroundColor: "#f7f9fc" },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ["google.com", "apple.com"],
    },
  },
};
export default config;
