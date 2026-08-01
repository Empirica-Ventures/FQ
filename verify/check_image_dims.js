// Sanity-checks content/images.json against the real files on disk.
//
// Note on what width/height actually mean here: several of these images
// render through `object-fit: cover` inside a CSS-sized box (the founder
// portraits, every hero background), so the <img width/height> attributes
// are a browser layout-reservation hint, not a claim that the file's real
// pixel dimensions equal those numbers — a 480x617 portrait correctly
// declares width="132" height="132" because that's the circle it's
// cropped into. Asserting literal equality would fail on today's already-
// correct site. What can actually go wrong from a CMS upload is a
// wrong/broken path, or a replacement image whose real aspect ratio is so
// different from what the crop was designed for that it reads as
// obviously wrong (a portrait dropped into a landscape hero slot) — so
// this checks file existence (hard fail) and flags a large aspect-ratio
// swing (warning, not a fail; a human should look, not a robot decide).
//
// Uses sharp, a devDependency — this script runs in CI/local dev only,
// never as part of `node build.js` itself (sharp isn't installed in the
// Vercel production build; see vercel.json's installCommand).
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/images.json'), 'utf-8')).items;
const ASPECT_WARN_THRESHOLD = 0.2; // 20% relative difference in width/height ratio

(async () => {
  let failed = false;
  for (const [key, img] of Object.entries(images)) {
    const filePath = path.join(ROOT, img.src.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      console.error(`FAIL ${key}: file not found at ${img.src}`);
      failed = true;
      continue;
    }
    const meta = await sharp(filePath).metadata();
    const declaredRatio = img.width / img.height;
    const actualRatio = meta.width / meta.height;
    const delta = Math.abs(actualRatio - declaredRatio) / declaredRatio;
    if (delta > ASPECT_WARN_THRESHOLD) {
      console.warn(
        `WARN ${key}: declared box is ${img.width}x${img.height} (ratio ${declaredRatio.toFixed(2)}), ` +
        `actual file (${img.src}) is ${meta.width}x${meta.height} (ratio ${actualRatio.toFixed(2)}) ` +
        `-- ${(delta * 100).toFixed(0)}% off. Confirm the crop still looks right.`
      );
    }
  }
  if (failed) {
    console.error('\nOne or more images are missing.');
    process.exit(1);
  }
  console.log(`OK: all ${Object.keys(images).length} declared images exist.`);
})();
