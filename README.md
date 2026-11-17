# GoKart

GoKart is a portfolio e-commerce application with a Next.js storefront and a separate Express API.

## Project layout

- `frontend/` — Next.js App Router application.
- `backend/` — Express REST API and MongoDB/Mongoose connection.

## Phase 1: Foundation

### Prerequisites

- Node.js 20.9 or newer.
- MongoDB local instance or an Atlas connection string for database-backed features.

### Configure environment

Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`. Copy `frontend/.env.example` to `frontend/.env.local` if the API URL differs from the local default.

### Install and run

In one terminal:

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

In another terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

The frontend runs at `http://localhost:3000`; the API health endpoint is `http://localhost:5000/api/health`.

## Phase 2: Authentication and catalog API

Before using authentication, replace the example `JWT_SECRET` in `backend/.env` with a private random secret. On Node.js, generate one with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Seed or refresh the development catalog (the command upserts the known seed records and does not clear other data):

```powershell
cd backend
npm.cmd run seed
```

The Express API exposes:

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/me`.
- `GET /api/categories` and `GET /api/categories/:slug`.
- `GET /api/products` with `q`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, and `limit` query parameters.
- `GET /api/products/:slug` and `GET /api/products/:slug/related`.

Authentication uses an HTTP-only `shopsphere_token` cookie. Public signup always creates a customer account; admin roles are not accepted from client input. Catalog records live in MongoDB; the seed command adds three categories and six sample products.

## Phase 3: Responsive storefront and catalog browsing

The storefront reads categories and products from the Express API at `http://localhost:5000/api` by default. Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` when the API is hosted elsewhere. The home page includes database-backed categories, best sellers, and new arrivals. The catalog supports keyword search, category and price filtering, sorting, and pagination. Product detail pages show the current catalog price, stock, gallery, variants, and related products.

Run the backend and frontend in separate terminals using the commands in Phase 1, then visit `http://localhost:3000`. If the database has no sample catalog yet, run the Phase 2 seed command. Frontend checks for this phase: `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run build`.

## Phase 4: Customer account, cart, wishlist, orders, and reviews

Customer account pages are available at `/account`, `/account/sign-in`, and `/account/sign-up`. The profile supports contact details and saved delivery addresses. Authenticated carts and wishlists are stored in MongoDB, and product reviews can only be submitted by a customer with a paid or delivered order for that product. Order history, details, and eligible cancellations are available.

Customer API endpoints include `GET/PATCH /api/users/me`, `POST/PATCH/DELETE /api/users/me/addresses`, `GET /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/:itemId`, `DELETE /api/cart`, `GET /api/wishlist`, `POST /api/wishlist/items`, `DELETE /api/wishlist/items/:productId`, `GET /api/orders`, `GET /api/orders/:orderId`, `POST /api/orders/:orderId/cancel`, `GET /api/products/:slug/reviews`, and `POST /api/reviews/:productId`. Except product review reads, these endpoints require the HTTP-only session cookie.

Frontend dependencies include React Hook Form and Zod for validated forms. Run `npm.cmd install` in `frontend/` after pulling changes, then use `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run build` to validate the storefront.

## Phase 5: Checkout and payments

The `/checkout` page requires a signed-in customer with an address saved in their account and a non-empty cart. Checkout creates an immutable order snapshot, recalculates prices and shipping from current database records, reserves stock, and clears the cart in one MongoDB transaction. Shipping is ₹99 below ₹3,000 and free at or above ₹3,000. Cash on Delivery is available without payment-provider credentials; eligible COD cancellations restore inventory.

For Razorpay test payments, add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` to `backend/.env` using test-mode credentials from the Razorpay dashboard. Keep all three values server-side; only the public key ID is returned to the browser. Configure the dashboard webhook URL as `https://<your-api-host>/api/payments/webhook` and subscribe to `payment.captured`. The API creates provider orders, verifies the checkout signature and provider-side captured payment, and validates webhook signatures before marking an order paid. Use an account with automatic capture enabled; an authorized-but-uncaptured payment is not treated as paid.

Checkout endpoints are `POST /api/checkout`, `POST /api/checkout/:orderId/payment-intent`, and `POST /api/checkout/:orderId/verify-payment`; the payment webhook is `POST /api/payments/webhook`. Checkout inventory operations require MongoDB transactions, so use MongoDB Atlas or a local replica set rather than a standalone local MongoDB server.

Validate this phase with a signed-in account, a saved address, and a seeded product: test COD checkout and cancellation first. To test Razorpay, configure test credentials and complete a test-mode payment; verify the order only becomes paid after provider-side capture. `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run build` are the frontend checks; backend files can be syntax-checked with `Get-ChildItem src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }` from `backend/`.

## Deployment: GitHub, Vercel, and Render

The root `render.yaml` defines the Express service for Render Blueprints. The Next.js app uses a same-origin `/api/*` rewrite for browser-side account requests so its HTTP-only auth cookie remains first-party; server-rendered catalog requests use `SHOPSPHERE_API_URL` directly. In Vercel, configure `NEXT_PUBLIC_API_URL=/api`, `BACKEND_API_URL=https://<render-service>.onrender.com`, and `SHOPSPHERE_API_URL=https://<render-service>.onrender.com/api`. These are separate settings: browser requests are proxied through the Vercel host, while server components contact the Render API directly.

## GoKart admin workspace

The admin workspace is available at `/admin`. Its REST API is mounted under `/api/admin`; every route requires the existing HTTP-only login session and `role: "admin"`. Admin APIs cover store metrics, products, categories, order-status updates, customer activation, and review moderation. Product removal archives records to preserve order references; category removal deactivates them. Orders can move through processing, shipped, and delivered states in the admin UI. Cancellation remains on the existing customer-safe transaction flow to ensure reserved inventory is restored.

Register the account you intend to use as the administrator first, then promote that exact email from a trusted local terminal connected to your database:

```powershell
cd backend
$env:ADMIN_EMAIL = "your-admin-email@example.com"
npm.cmd run promote-admin
Remove-Item Env:ADMIN_EMAIL
```

The role cannot be selected at signup. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the backend environment to enable image upload from the admin product editor. The backend signs upload requests; the API secret never goes to the browser. If Cloudinary is not configured, the editor can still use existing or externally hosted HTTPS image URLs.

Admin API routes include `GET /api/admin/overview`, CRUD under `/products` and `/categories`, `GET /orders` / `PATCH /orders/:id/status`, `GET /customers` / `PATCH /customers/:id`, and review list/delete endpoints. Do not expose or promote administrator accounts from a public signup form.

To deploy, first create an empty GitHub repository and push this project. In Render, create a Blueprint from that repository; supply the rotated Atlas URI for `MONGODB_URI` and a placeholder or final Vercel origin for `FRONTEND_URL`, then deploy. In Vercel, import the same repository with `frontend` as the Root Directory, set the three variables above, and deploy. After Vercel gives you its production URL, update Render's `FRONTEND_URL` to that exact origin and redeploy. Seed the Atlas database once from `backend/` with `npm.cmd run seed` after configuring a local `backend/.env` to point to Atlas; don't rerun the sample seed against production after catalog data is edited because it upserts sample product values.

Before pushing, inspect `git status` and confirm that `.env` and `.env.local` are not staged. The root `.gitignore` excludes them. Rotate the Atlas password previously shared in chat, use the replacement only in Render's secret settings and local ignored `.env`, and never add credentials to GitHub or `render.yaml`. Atlas must allow connections from Render; prefer a restricted network configuration and use a dedicated database user. For a basic portfolio test, verify the Render `/api/health` endpoint, browse Vercel product pages, create an account, save an address, and place/cancel a COD order.

## Planned phases

1. Foundation and database/API bootstrap — complete.
2. Authentication, catalog models, and product/category APIs — complete.
3. Responsive storefront and catalog browsing â€” complete.
4. Customer profile, cart, wishlist, orders, and reviews â€” complete.
5. Checkout, COD, and Razorpay test payments — complete (COD verified; live test-mode payment requires configured credentials).
6. Role-protected admin dashboard and management APIs — complete; administrator promotion is an explicit local command.
7. Validation, production configuration, and deployment guidance — configuration and instructions complete; provider accounts and production deployment remain operator actions.
#   G o K a r t  
 