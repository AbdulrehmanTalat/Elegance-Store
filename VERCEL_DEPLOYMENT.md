# Vercel Deployment Guide

## Quick Setup with Vercel CLI (Recommended)

The easiest way to sync your local `.env` file to Vercel is using the Vercel CLI:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project** (if not already linked):
   ```bash
   vercel link
   ```

4. **Pull environment variables from Vercel** (to see what's already set):
   ```bash
   vercel env pull .env.production
   ```

5. **Push your local `.env` to Vercel**:
   ```bash
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   # ... repeat for each variable
   ```

   Or use this one-liner to add all variables from your `.env` file:
   ```bash
   # For Windows PowerShell:
   Get-Content .env | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { vercel env add $matches[1] production $matches[2] } }
   
   # For Linux/Mac:
   cat .env | grep -v '^#' | grep -v '^$' | while IFS='=' read -r key value; do echo "$value" | vercel env add "$key" production; done
   ```

6. **Redeploy** after adding variables:
   ```bash
   vercel --prod
   ```

## Required Environment Variables

You need to set the following environment variables in your Vercel project settings:

### 1. Database Configuration
```
DATABASE_URL=your_neon_postgresql_connection_string
```
- Get this from your Neon dashboard
- Format: `postgresql://user:password@host:port/database?sslmode=require`

### 2. NextAuth Configuration
```
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=https://elegance-store-self.vercel.app
```
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Set `NEXTAUTH_URL` to your Vercel deployment URL

### 3. Email Configuration (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```
- For Gmail, you need to use an App Password (not your regular password)
- Enable 2-factor authentication and generate an App Password

### 4. Stripe Configuration (Optional - for payments)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
- Get these from your Stripe Dashboard

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Go to **Environment Variables**
4. Add each variable:
   - **Key**: The variable name (e.g., `DATABASE_URL`)
   - **Value**: The variable value
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application after adding variables

## Important Notes

- After adding environment variables, you **must redeploy** for changes to take effect
- The `DATABASE_URL` must be accessible from Vercel's servers
- Make sure your Neon database allows connections from Vercel's IP addresses
- The `NEXTAUTH_URL` should match your actual Vercel deployment URL

## Troubleshooting

### Products Not Showing
- Check if `DATABASE_URL` is set correctly
- Verify the database connection is working
- Check Vercel build logs for database connection errors

### 500 Error on `/api/auth/error`
- Verify `NEXTAUTH_SECRET` is set
- Check that `NEXTAUTH_URL` matches your deployment URL
- Ensure `DATABASE_URL` is correct and accessible

### Email Not Working
- Verify all SMTP variables are set
- For Gmail, ensure you're using an App Password
- Check Vercel function logs for email sending errors

## Quick Setup Checklist

- [ ] `DATABASE_URL` set in Vercel
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] `NEXTAUTH_URL` set to your Vercel URL
- [ ] SMTP variables configured
- [ ] Stripe variables configured (if using payments)
- [ ] Application redeployed after setting variables

