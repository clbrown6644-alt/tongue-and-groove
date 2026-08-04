// Generates the PWA icon set into public/icons/ (run: npm run icons)
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "node:fs";

const BLUE = "#012169", CREAM = "#FFFDF6", AMBER = "#E9B44C";

// pad = fraction of the canvas kept clear around the mark (maskable needs ~0.2)
function svg(size, pad, rounded) {
  const r = rounded ? size * 0.22 : 0;
  const fs = size * (1 - pad * 2) * 0.42;
  const y = size / 2 + fs * 0.34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${BLUE}"/>
  <text x="50%" y="${y}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="${fs}">
    <tspan fill="${CREAM}">T</tspan><tspan fill="${AMBER}">&amp;</tspan><tspan fill="${CREAM}">G</tspan>
  </text>
</svg>`;
}

function render(name, size, pad, rounded) {
  const png = new Resvg(svg(size, pad, rounded), {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: true },
  }).render().asPng();
  writeFileSync(`public/icons/${name}`, png);
  console.log(`wrote public/icons/${name} (${png.length} bytes)`);
}

mkdirSync("public/icons", { recursive: true });
render("icon-192.png", 192, 0.08, true);
render("icon-512.png", 512, 0.08, true);
render("icon-512-maskable.png", 512, 0.2, false); // full-bleed, safe zone for mask
render("apple-touch-icon.png", 180, 0.08, false); // iOS rounds corners itself
