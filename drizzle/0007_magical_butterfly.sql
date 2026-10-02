CREATE TABLE "product_prices" (
	"product_id" text PRIMARY KEY NOT NULL,
	"retail_vial_price_cents" integer,
	"member_vial_price_cents" integer,
	"retail_kit_price_cents" integer,
	"member_kit_price_cents" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
