import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const ogPath = path.join(publicDir, "og.png");

await sharp(ogPath)
  .resize(1200, 630, { fit: "cover" })
  .png({ compressionLevel: 9, palette: true })
  .toFile(path.join(publicDir, "og-optimized.png"));

const iconSvg = (size) => Buffer.from(`
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#77263b"/>
    <circle cx="${Math.round(size * 0.72)}" cy="${Math.round(size * 0.28)}" r="${Math.round(size * 0.13)}" fill="#d5a754" opacity=".95"/>
    <path d="M0 ${Math.round(size * .68)} L${Math.round(size * .28)} ${Math.round(size * .5)} L${Math.round(size * .5)} ${Math.round(size * .65)} L${Math.round(size * .76)} ${Math.round(size * .45)} L${size} ${Math.round(size * .62)} V${size} H0Z" fill="#354341"/>
    <text x="${Math.round(size * .15)}" y="${Math.round(size * .66)}" font-family="Georgia, serif" font-size="${Math.round(size * .54)}" font-weight="700" fill="#fffdf8">F</text>
  </svg>`);

for (const size of [192, 512]) {
  await sharp(iconSvg(size)).png({ compressionLevel: 9 }).toFile(path.join(publicDir, `icon-${size}.png`));
}
