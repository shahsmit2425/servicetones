import { validateDeployment, env } from "../src/server/config.js";
try {
  validateDeployment();
  console.log(
    "Configuration validated for " + env.APP_ENV + ". Values are not printed.",
  );
} catch (e) {
  console.error((e as Error).message);
  process.exitCode = 1;
}
