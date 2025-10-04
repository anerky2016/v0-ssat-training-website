const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

const svgBuffer = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#grad)"/>
  <text x="256" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="320" font-weight="700" fill="white" text-anchor="middle">M</text>
</svg>
`;

const publicDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
  console.log('Generating favicons...');

  // Generate PNG files
  for (const { size, name } of sizes) {
    const outputPath = path.join(publicDir, name);
    await sharp(Buffer.from(svgBuffer))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${name}`);
  }

  // Generate main favicon.png (32x32)
  await sharp(Buffer.from(svgBuffer))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Generated favicon.png');

  // Generate ICO file (using 32x32)
  const icoBuffer = await sharp(Buffer.from(svgBuffer))
    .resize(32, 32)
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Generated favicon.ico');

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
