# Email Images Directory

Place your email promotional images in this folder.

## Required Images

### For OTP Email:
- **banner-otp.png** - Header banner image (600x200px recommended)
  - Should show elegant lingerie/bra collection
  - Used in welcome/verification emails

### For Order Confirmation Email:
- **banner-order.jpg** (or .png) - Header banner image (600x200px recommended)
  - Should show elegant lingerie/bra collection
  - Used in order confirmation emails

### For Product Showcase (All Emails):
- **lingerie.png** - Lingerie collection image (300x300px recommended)
- **bras.jpg** - Bra collection image (300x300px recommended)
- **jewelry.jpg** - Jewelry collection image (300x300px recommended)

## Image Guidelines

1. **Format**: JPG or PNG
2. **Size**: 
   - Banners: 600x200px (width x height)
   - Product images: 300x300px (square)
3. **File Size**: Keep under 200KB per image for faster email loading
4. **Quality**: Use high-quality images that represent your store well
5. **Content**: Images should be elegant, professional, and appropriate for your brand

## How to Add Images

1. Copy your images to this folder (`public/email-images/`)
2. Name them exactly as listed above:
   - `banner-otp.jpg`
   - `banner-order.jpg`
   - `lingerie.jpg`
   - `bras.jpg`
   - `jewelry.jpg`
3. Restart your development server
4. Test by sending a test email

## Notes

- Images will be served from: `http://localhost:3000/email-images/` (development)
- In production, update `NEXTAUTH_URL` in your `.env` to your actual domain
- If an image is missing, a gray background will show instead
- Make sure images are optimized for web to ensure fast email loading

