# Gmail SMTP Setup Guide

This guide will help you configure your Gmail account to send emails from your ecommerce store.

## Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with your Gmail account
3. Under "Signing in to Google", find **2-Step Verification**
4. Click **Get Started** and follow the prompts to enable 2FA
5. You'll need to verify your phone number

## Step 2: Generate an App Password

**Important:** You cannot use your regular Gmail password. You MUST use an App Password.

1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", find **App passwords**
   - If you don't see this option, make sure 2-Step Verification is enabled first
3. Click **App passwords**
4. You may need to sign in again
5. Select **Mail** as the app
6. Select **Other (Custom name)** as the device
7. Enter a name like "Ecommerce Store" or "My Store"
8. Click **Generate**
9. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ **You can only see this password once!** Save it immediately.

## Step 3: Update Your .env File

Add these environment variables to your `.env` file in the root of your project:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
```

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=myemail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM=myemail@gmail.com
```

**Note:** Remove spaces from the App Password when adding it to `.env`:
- App Password shows: `abcd efgh ijkl mnop`
- Use in .env: `abcdefghijklmnop`

## Step 4: Test Your Configuration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try signing up a new user - you should receive an OTP email

3. Check your server logs for any email errors

## Troubleshooting

### "Invalid login" or "Authentication failed"
- ✅ Make sure you're using an **App Password**, not your regular Gmail password
- ✅ Remove spaces from the App Password in `.env`
- ✅ Verify 2-Step Verification is enabled
- ✅ Check that `SMTP_USER` matches your Gmail address exactly

### "Less secure app access" error
- This shouldn't happen with App Passwords, but if it does:
  1. Go to [Less secure app access](https://myaccount.google.com/lesssecureapps) (may not be available for all accounts)
  2. Enable it temporarily
  3. Use App Password instead (recommended)

### Emails going to spam
- This is normal for new email senders
- Gmail may mark your emails as spam initially
- Consider using a dedicated email service (SendGrid, Mailgun) for production

### "Connection timeout" error
- Check your internet connection
- Verify firewall isn't blocking port 587
- Try using port 465 with `secure: true` (requires code change)

## For Production (Vercel)

When deploying to Vercel, add these same environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `your-email@gmail.com`
   - `SMTP_PASSWORD` = `your-app-password` (no spaces)
   - `SMTP_FROM` = `your-email@gmail.com`
4. Select **All environments** (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application

## Alternative: Using Gmail with OAuth2 (Advanced)

For better security and higher sending limits, you can use OAuth2 instead of App Passwords. This requires additional setup but is recommended for production use.

## Security Notes

- ⚠️ Never commit your `.env` file to Git
- ⚠️ App Passwords are safer than regular passwords
- ⚠️ Each App Password is unique - you can revoke it anytime
- ⚠️ Gmail has daily sending limits (500 emails/day for free accounts)

## Gmail Sending Limits

- **Free Gmail accounts**: 500 emails per day
- **Google Workspace**: 2,000 emails per day
- For higher limits, consider using a dedicated email service

## Need Help?

If you're still having issues:
1. Check the server console for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple email sending script
4. Consider using a dedicated email service for production

