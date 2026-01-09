# Widget SaaS – Local Development

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** (or another package manager if you prefer)
- A running **PostgreSQL** database (for Prisma)

## 1. Clone the repository

```bash
git clone <your-repo-url>
cd widget-saas
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file in the project root (you can use `.env.example` as a reference if you maintain one) and set at least:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"
NEXTAUTH_SECRET="9mDXw4YLnC9VQhtDFB0YPzNSLWYvGWzN"
```

Adjust the connection string to point to your local or remote Postgres instance.

If you use authentication or other third‑party services, also add the corresponding keys/secrets here.

## 4. Run Prisma migrations

Apply the database schema to your database:

```bash
npx prisma migrate dev
npx prisma db seed
```

This will create or update your local database according to `prisma/schema.prisma`.

## 5. Run the development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# widget-saas
# widget-saas
