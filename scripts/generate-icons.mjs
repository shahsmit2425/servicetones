// Regenerate native app icons and launch artwork from the ServiceTones mark.
import sharp from "sharp";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
const mark = await readFile("public/favicon.svg");
await sharp(mark)
  .resize(1024, 1024)
  .flatten({ background: "#155eef" })
  .png()
  .toFile("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png");
const res = "android/app/src/main/res";
for (const [density, size] of Object.entries({
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
})) {
  for (const name of ["ic_launcher", "ic_launcher_round"])
    await sharp(mark)
      .resize(size, size)
      .png()
      .toFile(`${res}/mipmap-${density}/${name}.png`);
  const foreground = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><path d="M34 51 54 35l20 16v25H59V59H49v17H34Z" fill="none" stroke="white" stroke-width="5" stroke-linejoin="round"/></svg>',
  );
  await sharp(foreground)
    .resize(Math.round(size * 2.25))
    .png()
    .toFile(`${res}/mipmap-${density}/ic_launcher_foreground.png`);
}
await writeFile(
  `${res}/values/ic_launcher_background.xml`,
  '<?xml version="1.0" encoding="utf-8"?><resources><color name="ic_launcher_background">#155eef</color></resources>',
);
const launch = await sharp(mark).resize(180, 180).toBuffer();
for (const file of [
  "splash-2732x2732.png",
  "splash-2732x2732-1.png",
  "splash-2732x2732-2.png",
])
  await sharp({
    create: { width: 2732, height: 2732, channels: 3, background: "#f8fafc" },
  })
    .composite([{ input: launch, gravity: "centre" }])
    .png()
    .toFile(`ios/App/App/Assets.xcassets/Splash.imageset/${file}`);
for (const dir of await readdir(res))
  if (dir.startsWith("drawable")) {
    const file = path.join(res, dir, "splash.png");
    try {
      const { width, height } = await sharp(file).metadata();
      const badge = await sharp(mark)
        .resize(Math.max(48, Math.floor(Math.min(width, height) * 0.17)))
        .toBuffer();
      const output = await sharp({
        create: { width, height, channels: 3, background: "#f8fafc" },
      })
        .composite([{ input: badge, gravity: "centre" }])
        .png()
        .toBuffer();
      await writeFile(file, output);
    } catch (e) {
      if (e.code !== "ENOENT" && !String(e).includes("Input file is missing"))
        throw e;
    }
  }
console.log("Native icons and splash assets updated.");
