import { eq } from "drizzle-orm";
import { getAuthSession } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { PricingTier } from "@/app/products";

export async function getCurrentPricingTier(): Promise<PricingTier> {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return "retail";
  }

  const [user] = await db
    .select({ memberPricingEnabled: users.memberPricingEnabled })
    .from(users)
    .where(eq(users.id, session.user.id));

  return user?.memberPricingEnabled ? "member" : "retail";
}
