const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'dxrk8firz',
  api_key: '187636894344229',
  api_secret: '5QlIY_Wle1gD-uPEe-CwXRi-pg0',
});

async function run() {
  try {
    const result = await cloudinary.uploader.upload('public/logo.png', {
      public_id: 'elegance_store_logo',
      folder: 'ecommerce'
    });
    console.log('Uploaded to Cloudinary:', result.secure_url);

    let content = fs.readFileSync('lib/email.ts', 'utf8');
    // Replace ${EMAIL_IMAGE_BASE_URL}/logo.png with the Cloudinary URL
    content = content.replace(/\$\{EMAIL_IMAGE_BASE_URL\}\/logo\.png/g, result.secure_url);
    
    fs.writeFileSync('lib/email.ts', content);
    console.log('Updated lib/email.ts with Cloudinary URL.');
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
