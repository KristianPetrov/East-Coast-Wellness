import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { referralCodes } from "@/db/schema";

export type AppliedReferralCode = {
  id: string;
  partnerId: string;
  code: string;
  discountPercent: number;
};

export function normalizeReferralCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function calculateReferralDiscountCents(
  subtotalCents: number,
  discountPercent: number,
) {
  if (subtotalCents <= 0 || discountPercent <= 0) {
    return 0;
  }

  return Math.round((subtotalCents * discountPercent) / 100);
}

export async function getActiveReferralCode(
  code: string,
): Promise<AppliedReferralCode | null> {
  const normalizedCode = normalizeReferralCode(code);

  if (!normalizedCode) {
    return null;
  }

  const [referralCode] = await db
    .select()
    .from(referralCodes)
    .where(
      and(
        eq(referralCodes.code, normalizedCode),
        eq(referralCodes.isActive, true),
      ),
    );

  if (!referralCode) {
    return null;
  }

  return referralCode;
}
