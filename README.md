# Varahi Traders – Inventory & Sales

A simple app to manage shop inventory, daily sales, and profit for a store selling painting, hardware, plumbing, and electrical materials.

## What you can do

- **Dashboard** – See stock value, today’s sales, today’s profit, low-stock items.
- **Products** – Add and manage products (name, category, brand, purchased from, cost/selling price, quantity, unit, min stock).
- **Sales** – Record sales (select products, quantity, price); stock is reduced and profit is calculated.

## Running on Mac, Windows, phone & tablet

- **Mac / Windows** – Same app. On Windows, open the project in the folder, run the same commands in Command Prompt or PowerShell (install [Node.js](https://nodejs.org/) first).
- **Phone & tablet** – The UI is responsive and touch-friendly. Run `npm run dev` on your computer, then on your phone/tablet open the same URL (e.g. `http://YOUR_COMPUTER_IP:3000`) over the same Wi‑Fi. For use outside your network, deploy the app (e.g. Vercel) or use a tunnel like ngrok.

## Quick start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
   This creates the SQLite DB and seeds categories (Painting, Hardware, Plumbing, Electrical) plus one sample product. If you already had a database and added new fields (e.g. Brand, Purchased from), run `npx prisma db push` again to update the schema.

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- **Next.js 14** (App Router) – frontend and API
- **Prisma** – database access
- **SQLite** – database (file: `prisma/dev.db`)
- **Tailwind CSS** – styling

## Project layout

- `app/page.tsx` – Dashboard
- `app/products/` – Product list and “Add product” form
- `app/sales/` – Sales list and “Record sale” form
- `app/api/` – API routes for categories, products, sales
- `prisma/schema.prisma` – Data model (Category, Product, Sale, SaleItem)

## Adding more categories

Use the API or add a small admin page later. For now, the seed creates Painting, Hardware, Plumbing, Electrical. You can add more by inserting into the `Category` table (e.g. via Prisma Studio: `npx prisma studio`).

## Optional next steps

- **Reports** – Daily/weekly/monthly sales and profit summary.
- **Purchases** – Record stock purchases to increase inventory.
- **Deploy** – Run on a VPS or use Vercel + a hosted database for access from outside the shop.
