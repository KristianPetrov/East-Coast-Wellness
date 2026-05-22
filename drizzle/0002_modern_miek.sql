ALTER TABLE "orders" ADD COLUMN "ship_station_shipment_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "ship_station_external_shipment_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "ship_station_sync_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "ship_station_sync_error" text;