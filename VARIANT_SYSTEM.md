# Product Variant System Guide

## Overview

The e-commerce store now supports product variants with:
- **Multiple Colors** per product
- **Multiple Images** per color
- **Size Variants** (Band Size + Cup Size) per color
- **Individual Pricing** per variant
- **Individual Stock** per variant

## Database Schema

### New Models

1. **ProductColor**: Stores color information and images
   - `name`: Color name (e.g., "Rose Madder", "Black")
   - `images`: Array of image URLs for this color

2. **ProductVariant**: Stores size combinations with pricing
   - `bandSize`: Band size (e.g., "34", "36", "38")
   - `cupSize`: Cup size (e.g., "75B", "75C", "80B")
   - `price`: Price for this specific variant
   - `stock`: Stock quantity for this variant

### Updated Models

- **Product**: Now has optional `basePrice` and `image` (for products without variants)
- **CartItem**: Now supports `variantId` for variant-based products
- **OrderItem**: Stores variant information (colorName, bandSize, cupSize)

## Admin Features

### Adding Variants to a Product

1. **Create/Edit Product**:
   - Go to Admin Panel (`/admin`)
   - Click "Add Product" or edit an existing product
   - Fill in basic info (name, description, category)
   - Base Price and Image are optional (only needed for non-variant products)

2. **Manage Variants**:
   - Click the **Palette icon** (🎨) next to any product
   - **Add Colors**:
     - Click "Add Color"
     - Enter color name (e.g., "Rose Madder")
     - Add image URLs (one per line or click "Add" after each URL)
     - Multiple images per color are supported
   
   - **Add Size Variants**:
     - Select a color from dropdown
     - Fill in:
       - Band Size (e.g., "34", "36", "38")
       - Cup Size (e.g., "75B", "75C", "80B", "80C")
       - Price (e.g., "6.40")
       - Stock quantity
     - Repeat for all size combinations

3. **Example Setup**:
   ```
   Color: Rose Madder
   - Images: [image1.jpg, image2.jpg]
   - Variants:
     * Band: 34, Cup: 75B, Price: $6.40, Stock: 10
     * Band: 34, Cup: 75C, Price: $6.40, Stock: 8
     * Band: 36, Cup: 80B, Price: $6.40, Stock: 12
   
   Color: Black
   - Images: [black1.jpg, black2.jpg]
   - Variants:
     * Band: 34, Cup: 75B, Price: $6.40, Stock: 15
     * Band: 36, Cup: 80B, Price: $6.40, Stock: 20
   ```

## User Features

### Product Selection Flow

1. **Color Selection**:
   - User sees color thumbnails
   - Clicking a color updates the main product image gallery
   - Selected color is highlighted

2. **Band Size Selection**:
   - After selecting color, band sizes appear
   - Available sizes depend on selected color
   - Click to select band size

3. **Cup Size Selection**:
   - After selecting band size, cup sizes appear
   - Each cup size shows:
     - Size label (e.g., "75B")
     - Price
     - Stock availability
     - Quantity selector (+/- buttons)

4. **Quantity Selection**:
   - User can select quantity for each cup size
   - Stock limits are enforced
   - Low stock warnings (< 10 items)

5. **Add to Cart**:
   - Button shows total quantity selected
   - Adds all selected variants to cart
   - Each variant is a separate cart item

## API Endpoints

### Variant Management
- `GET /api/products/[id]/variants` - Get all colors and variants for a product
- `POST /api/products/[id]/variants` - Save/update variants (admin only)

### Cart & Orders
- Cart API now supports `variantId` parameter
- Order API stores variant information in order items
- Stock is managed per variant, not per product

## Example Workflow

### Admin: Creating a Product with Variants

1. Create product: "Women Bra and Panties Set"
2. Click Palette icon → Manage Variants
3. Add Color: "Rose Madder"
   - Add images: [url1, url2, url3]
4. Add Variants for Rose Madder:
   - 34 / 75B / $6.40 / Stock: 11
   - 34 / 75C / $6.40 / Stock: 9
   - 36 / 80B / $6.40 / Stock: 15
5. Add Color: "Black"
   - Add images: [url1, url2]
6. Add Variants for Black:
   - 34 / 75B / $6.40 / Stock: 20
   - 36 / 80B / $6.40 / Stock: 18
7. Save

### User: Purchasing

1. View product page
2. Select color: "Rose Madder" (images update)
3. Select band size: "34"
4. Select cup sizes and quantities:
   - 75B: Quantity 2
   - 75C: Quantity 1
5. Click "Add 3 items to Cart"
6. Proceed to checkout

## Important Notes

- Products can have **variants OR base price**, not both
- If a product has variants, the variant selector is shown
- If no variants, the simple product actions are shown
- Stock is tracked per variant
- Prices can vary by variant
- Images update dynamically when color changes
- Order history shows variant details (color, band, cup)

## Migration Notes

- Existing products without variants will still work
- Old products with `price` and `stock` fields are backward compatible
- New products should use the variant system for size-based products

