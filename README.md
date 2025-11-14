# Elegance Store - E-commerce Website

A modern, full-featured e-commerce website built with Next.js 14 for selling ladies undergarments, jewelry, and makeup.

## Features

- 🛍️ **Product Catalog**: Browse products by category (Undergarments, Jewelry, Makeup)
- 🛒 **Shopping Cart**: Add items to cart and manage quantities
- 💳 **Payment Integration**: Online payment via Stripe and Cash on Delivery (COD)
- 📧 **Email Notifications**: Order confirmation and status update emails
- 👤 **User Authentication**: Secure sign up and sign in
- 🔐 **Admin Panel**: Manage products, stock, and orders
- 📱 **Responsive Design**: Modern UI that works on all devices
- 🔒 **Secure**: Input validation, CSRF protection, and secure headers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: Stripe
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: Zustand
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database
- Stripe account (for payments)
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. Navigate to the project directory:
```bash
cd ecommerce-store
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
- Stripe keys from your Stripe dashboard
- SMTP credentials for email notifications

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Create an admin user (optional):
You can create an admin user directly in the database or through a script. To create one via the database:
- Sign up normally through the website
- Update the user's role to `ADMIN` in the database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stripe Webhook Setup

For online payments to work properly, you need to set up a Stripe webhook:

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in your `.env`

For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Project Structure

```
ecommerce-store/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout page
│   ├── orders/            # Order pages
│   ├── products/          # Product pages
│   └── profile/            # User profile page
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Prisma schema
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Key Features Explained

### Shopping Cart
- Client-side cart management using Zustand
- Persistent cart (can be synced with database)
- Real-time quantity updates

### Payment Processing
- **Online Payment**: Stripe Checkout integration
- **Cash on Delivery**: Order created immediately, payment on delivery
- Webhook handling for payment confirmation

### Admin Panel
- Product management (CRUD operations)
- Stock management
- Order management and status updates
- Access restricted to ADMIN role users

### Email Notifications
- Order confirmation emails
- Order status update emails
- Configurable via SMTP settings

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Input validation with Zod
- SQL injection prevention (Prisma)
- CSRF protection (NextAuth)
- Role-based access control

## Deployment

1. Build the application:
```bash
npm run build
```

2. Set environment variables in your hosting platform
3. Run database migrations:
```bash
npx prisma migrate deploy
```

4. Start the production server:
```bash
npm start
```

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the repository.

