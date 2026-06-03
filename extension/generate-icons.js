import sharp from 'sharp';
import path from 'path';

const sizes = [16, 32, 48, 128];
const inputFile = path.join(process.cwd(), 'public', 'icon.svg');

async function generate() {
  for (const size of sizes) {
    const outputFile = path.join(process.cwd(), 'public', `icon-${size}.png`);
    await sharp(inputFile)
      .resize(size, size)
      .png()
      .toFile(outputFile);
    console.log(`Generated ${outputFile}`);
  }
}

generate().catch(console.error);
