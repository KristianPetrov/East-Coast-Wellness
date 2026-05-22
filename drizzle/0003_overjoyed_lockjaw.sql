ALTER TABLE "orders" ADD COLUMN "ship_station_address_validation_status" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "ship_station_address_validation_message" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "ship_station_matched_address" text;--> statement-breakpoint
ALTER TABLE "product_inventory" ADD COLUMN "ship_station_inventory_sync_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_inventory" ADD COLUMN "ship_station_inventory_sync_error" text;--> statement-breakpoint
ALTER TABLE "product_inventory" ADD COLUMN "ship_station_inventory_synced_at" timestamp with time zone;