import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join, parse } from 'node:path';

const SRC = 'photos';
const OUT = 'src/assets/photos';
const WIDTHS = [800, 1400, 2000];

const SKIP = ['invitation_front.png', 'invitation_back.png'];

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter(
  (f) => /\.(jpe?g|png)$/i.test(f) && !SKIP.includes(f)
);

for (const file of files) {
  const { name } = parse(file);
  for (const w of WIDTHS) {
    await sharp(join(SRC, file))
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(join(OUT, `${name}-${w}.webp`));
  }
  console.log(`optimized ${file}`);
}
console.log('done');
