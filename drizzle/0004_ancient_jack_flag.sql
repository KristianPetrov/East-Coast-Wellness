ALTER TABLE "orders" ADD COLUMN "order_status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "inventory_restored_at" timestamp with time zone;