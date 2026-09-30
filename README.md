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

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Order fulfillment and notifications

Orders are fulfilled manually in the admin dashboard: update payment and shipping
status, select a carrier, and enter the tracking number. Storefront inventory is
managed locally and still decreases at checkout and returns when an order is cancelled.

ShipStation is disabled and hidden by default, even if credentials are present.
To reconnect later, restore valid `SHIP_STATION_API_KEY` credentials, configure
`SHIP_STATION_INVENTORY_LOCATION_ID` if needed, and set `SHIP_STATION_ENABLED=true`
in the server environment. Restart or redeploy after changing configuration.
Existing ShipStation records and integration code are preserved.

Admin order notifications default to `eastcoastwellnesscoaching@gmail.com`.
Use `ORDER_NOTIFICATION_EMAIL` to override the recipient; `ADMIN_EMAIL` only
controls admin account access.
