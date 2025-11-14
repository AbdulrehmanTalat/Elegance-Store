# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Set Up Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in all required values:
   - **DATABASE_URL**: Get from your Neon PostgreSQL dashboard
   - **NEXTAUTH_SECRET**: Run `openssl rand -base64 32` to generate
   - **NEXTAUTH_URL**: `http://localhost:3000` for development
   - **Stripe Keys**: Get from https://dashboard.stripe.com/test/apikeys
   - **SMTP Settings**: Use Gmail or another email service

## Step 3: Set Up Database
```bash
npx prisma generate
npx prisma db push
```

## Step 4: Create Admin User
1. Start the dev server: `npm run dev`
2. Sign up at http://localhost:3000/auth/signup
3. Update the user role in your database:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

## Step 5: Set Up Stripe Webhook (for production)
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy webhook secret to `.env`

For local development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Step 6: Test the Application
1. Visit http://localhost:3000
2. Sign up/Sign in
3. Browse products
4. Add items to cart
5. Test checkout (use Stripe test card: 4242 4242 4242 4242)

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check if your Neon database allows connections from your IP
- Ensure SSL mode is set correctly

### Email Not Sending
- For Gmail, use an App Password (not your regular password)
- Enable "Less secure app access" or use OAuth2
- Check SMTP settings match your email provider

### Stripe Payment Issues
- Ensure you're using test keys in development
- Check webhook endpoint is correctly configured
- Verify STRIPE_WEBHOOK_SECRET matches your webhook

### Image Loading Issues
- Product images should be valid URLs
- Use HTTPS URLs for production
- Check image domains in `next.config.js`

