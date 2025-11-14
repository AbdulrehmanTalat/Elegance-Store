# Database Setup Instructions

## Option 1: Using Prisma (Recommended - Requires Node.js 18+)

If you have Node.js 18 or higher installed:

```bash
cd C:\Users\abdur\ecommerce-store
npm install
npx prisma generate
npx prisma db push
```

## Option 2: Manual SQL Setup (If Node.js is too old)

Since your Node.js version (v12.15.0) is too old, you can set up the database manually:

### Steps:

1. **Go to your Neon Database Console**
   - Visit https://console.neon.tech
   - Open your database project
   - Click on "SQL Editor"

2. **Run the SQL Migration**
   - Copy the contents of `prisma/migrations/init.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify Tables Created**
   You should see these tables created:
   - User
   - Account
   - Session
   - VerificationToken
   - Product
   - CartItem
   - Order
   - OrderItem

## Option 3: Upgrade Node.js (Best Solution)

For the best experience, upgrade to Node.js 18 or higher:

1. Download Node.js 18+ from https://nodejs.org/
2. Install it
3. Then run:
   ```bash
   cd C:\Users\abdur\ecommerce-store
   npm install
   npx prisma generate
   npx prisma db push
   ```

## After Database Setup

Once the database is set up, you can:

1. **Generate Prisma Client** (if using Node.js 18+):
   ```bash
   npx prisma generate
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Create an admin user**:
   - Sign up through the website
   - Then run this SQL in your Neon console:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

## Connection String

Your database connection string is already saved in `.env`:
```
postgresql://neondb_owner:npg_f1lyDKUsvh3P@ep-floral-hill-ahixs6sf-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

