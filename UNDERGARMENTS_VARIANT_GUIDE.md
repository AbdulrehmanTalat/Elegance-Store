# Undergarments Variant System Guide

## Overview

The system fully supports undergarments with:
- **Multiple Colors** per product
- **Multiple Images** per color (upload multiple at once)
- **Band Sizes** (e.g., 34, 36, 38)
- **Cup Sizes** (e.g., 75B, 75C, 80B, 80C)
- **Individual Pricing** per variant
- **Individual Stock** per variant

## How to Add an Undergarment Product

### Step 1: Create the Product

1. Go to **Admin Panel** (`/admin`)
2. Click **"Add Product"**
3. Fill in:
   - **Name**: e.g., "Women Bra and Panties Underwear Set"
   - **Description**: Product description
   - **Base Price**: Leave empty (variants will have their own prices)
   - **Product Image**: Optional - upload a default/thumbnail image
   - **Category**: Select "Undergarments"
   - **Active**: Check this box
4. Click **"Create"**

### Step 2: Add Colors and Variants

1. After creating the product, click the **Palette icon** (🎨) next to the product
2. This opens the **"Manage Product Variants"** modal

#### Adding Colors:

1. Click **"Add New Color"** button
2. Enter **Color Name**: e.g., "Rose Madder", "Black", "White"
3. **Upload Images** for this color:
   - Click **"Upload Image"** button
   - You can select **multiple images at once** (hold Ctrl/Cmd to select multiple files)
   - Each image will upload and appear as a thumbnail
   - You can upload more images by clicking "Upload Image" again
   - Remove images by hovering and clicking the X button
4. Repeat for all colors

#### Adding Size Variants:

1. In the **"Size Variants"** section, select a color from the dropdown
2. Click **"Add Variant"** for that color
3. Fill in the variant details:
   - **Band Size**: e.g., "34", "36", "38"
   - **Cup Size**: e.g., "75B", "75C", "80B", "80C"
   - **Price**: e.g., "6.40" (in PKR)
   - **Stock**: e.g., "10"
   - **SKU**: Optional - product SKU code
4. Click **"Add Variant"** again to add more size combinations for the same color
5. Repeat for all colors

### Example Setup:

**Product**: Women Bra and Panties Underwear Set

**Color 1: Rose Madder**
- Images: [image1.jpg, image2.jpg, image3.jpg]
- Variants:
  - Band: 34, Cup: 75B, Price: Rs 6.40, Stock: 11
  - Band: 34, Cup: 75C, Price: Rs 6.40, Stock: 9
  - Band: 36, Cup: 80B, Price: Rs 6.40, Stock: 15

**Color 2: Black**
- Images: [image1.jpg, image2.jpg]
- Variants:
  - Band: 34, Cup: 75B, Price: Rs 6.40, Stock: 20
  - Band: 36, Cup: 80B, Price: Rs 6.40, Stock: 18

## Features

### Multiple Image Upload
- Click "Upload Image" and select multiple files at once
- Each image uploads individually with progress indicator
- Images appear as thumbnails below the upload button
- Remove any image by hovering and clicking the X button

### Variant Management
- Each color can have multiple size combinations
- Each variant has its own price and stock
- Stock is tracked per variant, not per product
- Prices can vary by variant if needed

### User Experience
- Users select color → band size → cup size → quantity
- Images update dynamically when color changes
- Each size shows its own price and stock availability
- Low stock warnings (< 10 items)

## Important Notes

1. **Base Price**: Leave empty for variant-based products
2. **Product Image**: Optional - used as fallback/thumbnail
3. **Color Images**: Required - at least one image per color
4. **Variants**: At least one variant required per color
5. **Stock**: Managed per variant, not per product
6. **Currency**: All prices are in PKR (Rs)

## Troubleshooting

### "Invalid input" Error
- Make sure all required fields are filled
- Check that image uploads completed successfully
- Ensure at least one variant is added for each color

### Images Not Uploading
- Check file size (max 5MB per image)
- Ensure file format is JPG, PNG, or WebP
- Check browser console for error messages

### Variants Not Saving
- Ensure each color has at least one variant
- Check that band size, cup size, price, and stock are filled
- Verify you clicked "Save Variants" button

