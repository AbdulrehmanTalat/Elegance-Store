const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const blogPosts = [
    {
        title: 'How to Choose the Perfect Bra Size: Complete Guide',
        slug: 'how-to-choose-perfect-bra-size',
        excerpt: 'Finding the right bra size can transform your comfort and confidence. Learn the exact measurements and tips to find your perfect fit.',
        content: `Finding the perfect bra size is crucial for comfort, support, and confidence. Many women wear the wrong size without realizing it. In this comprehensive guide, we'll walk you through measuring yourself accurately and finding the perfect fit.

## Why Bra Size Matters

Wearing the correct bra size provides:
- Better posture and back support
- Enhanced comfort throughout the day
- Improved silhouette and confidence
- Longer-lasting lingerie

## How to Measure

### Step 1: Band Size
Measure around your ribcage, just under your bust. Round to the nearest even number. This is your band size (e.g., 32, 34, 36).

### Step 2: Cup Size
Measure around the fullest part of your bust. Subtract your band size from this measurement. Each inch difference represents a cup size (A=1", B=2", C=3", etc.).

### Step 3: Check the Fit
Your bra should:
- Sit parallel to the ground
- Not ride up in the back
- Have cups that fully contain your breasts
- Feel snug but not too tight

## Common Fit Issues

**Cups Overflow**: Try a larger cup size
**Band Rides Up**: Try a smaller band size
**Straps Dig In**: Your band might be too loose

## Shopping Tips

1. Always try before you buy
2. Sizes vary by brand - don't assume
3. Get professionally fitted once a year
4. Replace bras every 6-12 months

Visit our collection of expertly designed bras to find your perfect fit today!`,
        category: 'Style Guide',
        keywords: ['bra size', 'lingerie fit', 'bra fitting', 'how to measure bra size', 'perfect bra'],
        metaTitle: 'How to Choose the Perfect Bra Size in 2024 | Complete Guide',
        metaDescription: 'Find your perfect bra size with our complete guide. Learn professional measuring techniques and fit tips for ultimate comfort and support.',
    },
    {
        title: 'Lingerie Care Guide: Make Your Pieces Last Longer',
        slug: 'lingerie-care-guide',
        excerpt: 'Proper care can extend the life of your lingerie significantly. Discover expert tips for washing, drying, and storing your delicate pieces.',
        content: `Quality lingerie is an investment, and with proper care, your favorite pieces can last for years. Follow these expert tips to keep your lingerie looking beautiful and feeling comfortable.

## Washing Guidelines

### Hand Washing (Recommended)
1. Use lukewarm water (never hot!)
2. Add a small amount of delicate detergent
3. Gently agitate for 30-60 seconds
4. Rinse thoroughly with cool water
5. Never wring or twist

### Machine Washing
If you must use a machine:
- Use a mesh laundry bag
- Select delicate/gentle cycle
- Use cold water only
- Choose mild detergent
- Remove immediately when done

## Drying Tips

**Never use a dryer!** Heat damages elastic and fabric.

Instead:
- Gently squeeze out excess water
- Lay flat on a clean towel
- Reshape cups while damp
- Air dry away from direct sunlight
- Never hang bras by straps

## Storage Solutions

### Bras
- Stack cups inside each other
- Never fold in half (damages underwire)
- Use drawer dividers
- Store in a cool, dry place

### Panties
- Fold gently
- Organize by type or color
- Use organizer boxes

### Delicate Pieces
- Store in breathable bags
- Keep away from rough fabrics
- Avoid overcrowding

## Fabric-Specific Care

**Silk**: Hand wash only, air dry flat
**Lace**: Extremely gentle handling required
**Satin**: Cool iron if needed (inside out)
**Cotton**: More durable, can handle gentle machine wash

## When to Replace

Replace lingerie when you notice:
- Stretched elastic
- Faded colors
- Loose stitching
- Underwire poking through
- Loss of shape

## Pro Tips

1. Rotate your bras (don't wear the same one daily)
2. Hand wash immediately after wearing (sweat damages fabric)
3. Use specialty lingerie detergent
4. Keep bras away from velcro (snags lace)
5. Travel with lingerie bags

Invest in quality pieces from our collection and follow these care tips to enjoy them for years!`,
        category: 'Care Tips',
        keywords: ['lingerie care', 'how to wash lingerie', 'bra care', 'delicate fabric care', 'lingerie maintenance'],
        metaTitle: 'Ultimate Lingerie Care Guide | Expert Washing & Storage Tips',
        metaDescription: 'Keep your lingerie beautiful for years with our expert care guide. Learn proper washing, drying, and storage techniques for delicate fabrics.',
    },
    {
        title: '2024 Jewelry Trends in Pakistan: Statement Pieces',
        slug: '2024-jewelry-trends-pakistan',
        excerpt: 'Discover the hottest jewelry trends for 2024 in Pakistan. From traditional to contemporary, find your perfect statement piece.',
        content: `The jewelry landscape in Pakistan is evolving beautifully, blending traditional craftsmanship with modern aesthetics. Here are the top trends dominating 2024.

## Trending Styles

### 1. Layered Necklaces
Multiple delicate chains worn together create a sophisticated, modern look. Mix:
- Different lengths
- Varied textures (beads, chains, pendants)
- Gold and silver tones

### 2. Statement Earrings
Bold, oversized earrings are back:
- Chunky hoops
- Geometric designs
- Chandelier styles
- Tassel earrings

### 3. Traditional Meets Modern
Contemporary updates to classic Pakistani jewelry:
- Minimalist jhumkas
- Sleek tikkas
- Modern haath phool
- Simplified rani haar

### 4. Sustainable Jewelry
Eco-conscious choices gaining popularity:
- Recycled metals
- Ethical gemstones
- Locally sourced materials
- Handcrafted artisan pieces

## Color Trends

**Rose Gold**: Warm, romantic, universally flattering
**Mixed Metals**: Don't be afraid to mix gold and silver
**Colorful Stones**: Emeralds, rubies, and sapphires making a comeback

## Styling Tips

### Casual Day Look
- Simple stud earrings
- Delicate chain necklace
- Minimal rings

### Office Appropriate
- Small hoops or studs
- Thin chain bracelet
- Classic watch

### Evening Glamour
- Statement earrings
- Layered necklaces
- Cocktail ring

### Wedding Season
- Traditional jhumkas
- Layered necklace sets
- Mathapatti or tikka
- Bangles or kadas

## Investment Pieces

Worth splurging on:
1. Quality gold chain (timeless)
2. Diamond studs (versatile)
3. Pearl necklace (classic)
4. Statement ring (personal)

## Care & Maintenance

Keep jewelry sparkling:
- Store in soft pouches
- Clean regularly with appropriate methods
- Remove before swimming/showering
- Get professional cleaning annually

## Shopping Guide

When buying jewelry:
- Check metal purity
- Examine craftsmanship
- Consider versatility
- Ensure proper certification (for precious metals)
- Buy from reputable sellers

Explore our curated jewelry collection featuring the latest trends and timeless classics!`,
        category: 'Trends',
        keywords: ['jewelry trends 2024', 'pakistan jewelry', 'statement jewelry', 'jewelry fashion', 'traditional jewelry'],
        metaTitle: '2024 Jewelry Trends in Pakistan | Latest Statement Pieces',
        metaDescription: 'Stay ahead of fashion with 2024\'s hottest jewelry trends in Pakistan. Discover statement pieces, styling tips, and investment-worthy designs.',
    },
    {
        title: 'Makeup Tips for Pakistani Skin Tones: Complete Guide',
        slug: 'makeup-tips-pakistani-skin-tones',
        excerpt: 'Find the perfect makeup shades and techniques for Pakistani skin tones. Expert tips for flawless, natural-looking makeup.',
        content: `Pakistani women have beautiful, diverse skin tones ranging from fair to deep. This guide helps you choose the right products and techniques for your unique complexion.

## Understanding Undertones

Before choosing makeup, identify your undertone:

**Warm**: Yellow, peachy, golden hues
**Cool**: Pink, red, bluish hues
**Neutral**: Mix of warm and cool

### Quick Test
Look at your wrist veins:
- Green veins = Warm undertone
- Blue/purple veins = Cool undertone
- Both = Neutral undertone

## Foundation Matching

### For Warm Undertones
Choose foundations with:
- Yellow or golden base
- Peachy tones
- Avoid pink-based foundations

### For Cool Undertones
Look for:
- Pink or rosy base
- Neutral shades
- Avoid overly yellow foundations

### For Neutral Undertones
You're lucky! Most shades work, but:
- Beige-based foundations are ideal
- Can use both warm and cool tones

## Best Lip Colors

### Fair to Medium Skin
- Nude pinks
- Coral shades
- Light mauves
- Berry tones

### Medium to Deep Skin
- Rich berries
- Deep nudes
- Wine shades
- Bold reds

### Universal Shades
- Classic red (with right undertone)
- Rosy pink
- Nude (matching skin tone)

## Eye Makeup Tips

### Eyeshadow Palettes
**Fair Skin**: Soft browns, champagne, dusty rose
**Medium Skin**: Warm bronzes, terracotta, plum
**Deep Skin**: Rich golds, deep purples, vibrant colors

### Eyeliner
- Black for dramatic looks (works for all)
- Brown for softer, everyday looks
- Colored liners for fun pops

## Blush & Bronzer

### Choosing Blush
- Fair: Soft pinks, peachy tones
- Medium: Mauve, rose, coral
- Deep: Berry, plum, terracotta

### Bronzer Tips
- Go 1-2 shades darker than skin
- Apply on cheekbones, temples, jawline
- Blend well for natural look

## Common Mistakes to Avoid

1. **Wrong foundation shade**: Always test in natural light
2. **Ashy makeup**: Choose products with golden undertones for warm skin
3. **Too matte**: Add highlighter for glow
4. **Harsh contouring**: Keep it natural
5. **Ignoring undertones**: This affects all color choices

## Everyday Makeup Routine

### 5-Minute Look
1. BB cream or light foundation
2. Concealer under eyes
3. Natural blush
4. Mascara
5. Nude lip

### 15-Minute Full Face
1. Primer
2. Foundation
3. Concealer
4. Powder
5. Bronzer & blush
6. Eyebrow filling
7. Eyeshadow (neutral)
8. Eyeliner
9. Mascara
10. Lip color

## Product Recommendations

### Must-Have Basics
- Good foundation match
- Quality concealer
- Neutral eyeshadow palette
- Black mascara
- Nude lipstick
- Blush (flattering shade)

### For Special Occasions
- Highlighter
- False lashes
- Bold lipstick
- Shimmer eyeshadow

## Skincare First

Remember: Great makeup starts with great skin
- Cleanse daily
- Moisturize
- Use sunscreen (even if you have dark skin)
- Exfoliate weekly
- Remove makeup before bed

Shop our curated makeup collection featuring shades perfect for Pakistani skin tones!`,
        category: 'Beauty Tips',
        keywords: ['makeup tips pakistan', 'pakistani skin tone makeup', 'foundation for pakistani skin', 'asian makeup tips', 'beauty guide'],
        metaTitle: 'Makeup Tips for Pakistani Skin Tones | Expert Beauty Guide 2024',
        metaDescription: 'Master makeup for Pakistani skin tones with our expert guide. Find perfect foundation matches, lip colors, and techniques for flawless looks.',
    },
]

async function createBlogPosts() {
    try {
        // Find an admin user to be the author
        let admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
        })

        if (!admin) {
            console.log('No admin user found. Creating a default admin user...')
            admin = await prisma.user.create({
                data: {
                    email: 'admin@elegancestore.com',
                    name: 'Elegance Store Admin',
                    role: 'ADMIN',
                    emailVerified: true,
                },
            })
        }

        console.log(`Using admin user: ${admin.email}`)

        // Create blog posts
        for (const postData of blogPosts) {
            const existing = await prisma.blogPost.findUnique({
                where: { slug: postData.slug },
            })

            if (existing) {
                console.log(`Blog post "${postData.title}" already exists, skipping...`)
                continue
            }

            const post = await prisma.blogPost.create({
                data: {
                    ...postData,
                    authorId: admin.id,
                    status: 'PUBLISHED',
                    publishedAt: new Date(),
                },
            })

            console.log(`✓ Created blog post: "${post.title}"`)
        }

        console.log('\n✨ Blog seeding completed successfully!')
    } catch (error) {
        console.error('Error seeding blog posts:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

createBlogPosts()
