# Varahi Traders – Shop Inventory & Sales App – Plan

## What You’ll Have

An app to:

1. **Manage inventory** – Products in categories: Painting, Hardware, Plumbing, Electrical  
2. **Record daily sales** – What was sold, quantity, price  
3. **Track profit** – Cost vs selling price, daily/monthly profit  
4. **See business status** – Dashboard: stock value, today’s sales, profit, low stock

---

## How It Works (High Level)

| Area | What you do | What the app does |
|------|-------------|--------------------|
| **Products** | Add products with name, category, cost price, selling price, quantity | Stores in DB, used for sales and reports |
| **Sales** | Enter sale: select product, quantity, (optional) price | Reduces stock, records sale, computes profit |
| **Dashboard** | Open app | Shows: stock value, today’s sales, profit, low-stock list |
| **Reports** | Open “Reports” | Daily/weekly/monthly sales and profit |

---

## Tech Stack (What We’ll Build With)

- **Next.js 14** – One codebase for UI + API (no separate backend server)
- **SQLite + Prisma** – Database in a file on your computer; no DB server to install
- **Tailwind CSS** – Styling and a clean, usable UI
- **TypeScript** – Fewer bugs and better editor support

You’ll run it with `npm run dev` and open it in the browser (phone/tablet/PC).

---

## Data We’ll Store

- **Categories** – Painting, Hardware, Plumbing, Electrical (you can add more)
- **Products** – Name, category, cost price, selling price, quantity in stock, unit
- **Sales** – Date, product, quantity sold, unit price, total, profit per line
- **Optional later** – Purchases (restocking), multiple users, barcode

---

## Next Steps (After Scaffold)

1. Run the app locally and add categories/products.  
2. Record a few test sales and check dashboard.  
3. Use it daily; add “Purchases” and reports when you’re ready.  
4. (Optional) Deploy to a small VPS or use a service like Vercel + hosted DB if you want access from outside your shop.

I’ll scaffold the app next so you have a working inventory, sales, and dashboard to start with.
