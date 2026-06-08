const sharp = require('./node_modules/@xenova/transformers/node_modules/sharp');

async function makeThumbnail() {
  await sharp('./public/logo.png')
    .flatten({ background: { r: 10, g: 10, b: 10, alpha: 1 } }) // very dark grey/black
    .toFile('./public/ph-thumbnail.png');
  console.log('Created ph-thumbnail.png with black background!');
}

makeThumbnail().catch(console.error);
