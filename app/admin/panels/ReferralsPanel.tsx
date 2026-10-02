import type { referralCodes, referralPartners } from "@/db/schema";
import { formatCents } from "@/lib/money";
import { StatusPill } from "@/app/ui";
import { createReferralCode, createReferralPartner, updateReferralCode } from "../actions";
import { SubmitButton } from "../FormButtons";
import {
  adminCheckbox,
  adminCodeInput,
  adminInput,
  adminLabel,
  EmptyState,
  PanelHeader,
  StatCard,
} from "../ui";

type Partner = typeof referralPartners.$inferSelect;
type Code = typeof referralCodes.$inferSelect;
export type ReferralTotals = { orders: number; salesCents: number; discountCents: number };

export function ReferralsPanel({
  partners,
  codesByPartner,
  totalsByPartner,
  totalsByCode,
}: {
  partners: Partner[];
  codesByPartner: Map<string, Code[]>;
  totalsByPartner: Map<string, ReferralTotals>;
  totalsByCode: Map<string, ReferralTotals>;
}) {
  const allTotals = Array.from(totalsByPartner.values()).reduce(
    (sum, totals) => ({
      orders: sum.orders + totals.orders,
      salesCents: sum.salesCents + totals.salesCents,
      discountCents: sum.discountCents + totals.discountCents,
    }),
    { orders: 0, salesCents: 0, discountCents: 0 },
  );

  return (
    <div className="grid gap-8">
      <PanelHeader
        title="Referrals"
        description="Create partner codes, set percentage discounts, and track active order sales attributed to each referral partner."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Partners" value={partners.length} />
        <StatCard label="Referred orders" value={allTotals.orders} hint="Active orders" />
        <StatCard label="Referred sales" value={formatCents(allTotals.salesCents)} tone="success" />
        <StatCard label="Discounts given" value={formatCents(allTotals.discountCents)} tone="warning" />
      </div>

      <details className="group rounded-xl border border-ink/10 bg-white" open={partners.length === 0}>
        <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
          <span>
            <span className="block font-medium">New referral partner</span>
            <span className="block text-xs text-muted">Creates the partner and their first code.</span>
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/12 text-lg leading-none transition group-open:rotate-45" aria-hidden>
            +
          </span>
        </summary>
        <form
          action={createReferralPartner}
          className="grid gap-3 border-t border-ink/8 px-5 py-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_9rem_7rem_auto_auto] xl:items-end"
        >
          <label className={adminLabel}>
            Partner name
            <input name="name" required className={adminInput} />
          </label>
          <label className={adminLabel}>
            Partner email
            <input name="email" type="email" className={adminInput} />
          </label>
          <label className={adminLabel}>
            Code
            <input name="code" required className={adminCodeInput} />
          </label>
          <label className={adminLabel}>
            Discount %
            <input name="discountPercent" type="number" min={1} max={100} required className={`${adminInput} no-spin`} />
          </label>
          <label className={adminCheckbox}>
            <input name="excludeReconstitution" type="checkbox" className="h-4 w-4 accent-[var(--color-copper)]" />
            Exclude Reconstitution
          </label>
          <SubmitButton pendingLabel="Creating…" savedLabel="Created">
            Create partner
          </SubmitButton>
        </form>
      </details>

      {partners.length > 0 ? (
        <div className="grid gap-4">
          {partners.map((partner) => {
            const codes = codesByPartner.get(partner.id) ?? [];
            const totals = totalsByPartner.get(partner.id);

            return (
              <article key={partner.id} className="overflow-hidden rounded-xl border border-ink/10 bg-white">
                <div className="flex flex-col justify-between gap-4 px-5 py-5 lg:flex-row lg:items-center">
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl">{partner.name}</h2>
                    {partner.email ? <p className="mt-0.5 text-sm text-muted">{partner.email}</p> : null}
                  </div>
                  <dl className="grid grid-cols-3 divide-x divide-ink/10 rounded-lg border border-ink/10 bg-bone text-sm lg:min-w-[26rem]">
                    {[
                      ["Orders", String(totals?.orders ?? 0)],
                      ["Sales", formatCents(totals?.salesCents ?? 0)],
                      ["Discounts", formatCents(totals?.discountCents ?? 0)],
                    ].map(([label, value]) => (
                      <div key={label} className="px-4 py-3">
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">{label}</dt>
                        <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="border-t border-ink/8">
                  {codes.map((code) => {
                    const codeTotals = totalsByCode.get(code.id);

                    return (
                      <form
                        key={code.id}
                        action={updateReferralCode}
                        className="grid gap-3 border-b border-ink/8 bg-paper/50 px-5 py-4 md:grid-cols-[1fr_7rem_auto_auto_auto] md:items-center"
                      >
                        <input type="hidden" name="codeId" value={code.id} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-sm font-medium">{code.code}</p>
                            <StatusPill tone={code.isActive ? "success" : "danger"}>
                              {code.isActive ? "Active" : "Inactive"}
                            </StatusPill>
                            {code.excludeReconstitution ? (
                              <StatusPill tone="accent">Excludes Reconstitution</StatusPill>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            {codeTotals?.orders ?? 0} orders · {formatCents(codeTotals?.salesCents ?? 0)} sales ·{" "}
                            {formatCents(codeTotals?.discountCents ?? 0)} discounts
                          </p>
                        </div>
                        <label className={adminLabel}>
                          <span className="md:sr-only">Discount %</span>
                          <span className="relative">
                            <input
                              name="discountPercent"
                              type="number"
                              min={1}
                              max={100}
                              defaultValue={code.discountPercent}
                              aria-label={`${code.code} discount percent`}
                              className={`${adminInput} no-spin pr-7 tabular-nums`}
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-faint">%</span>
                          </span>
                        </label>
                        <label className={adminCheckbox}>
                          <input name="isActive" type="checkbox" defaultChecked={code.isActive} className="h-4 w-4 accent-[var(--color-copper)]" />
                          Active
                        </label>
                        <label className={adminCheckbox}>
                          <input
                            name="excludeReconstitution"
                            type="checkbox"
                            defaultChecked={code.excludeReconstitution}
                            className="h-4 w-4 accent-[var(--color-copper)]"
                          />
                          Exclude Reconstitution
                        </label>
                        <SubmitButton>Save</SubmitButton>
                      </form>
                    );
                  })}

                  <form
                    action={createReferralCode}
                    className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_7rem_auto_auto] md:items-end"
                  >
                    <input type="hidden" name="partnerId" value={partner.id} />
                    <label className={adminLabel}>
                      Add code
                      <input name="code" required className={adminCodeInput} />
                    </label>
                    <label className={adminLabel}>
                      Discount %
                      <input name="discountPercent" type="number" min={1} max={100} required className={`${adminInput} no-spin`} />
                    </label>
                    <label className={adminCheckbox}>
                      <input name="excludeReconstitution" type="checkbox" className="h-4 w-4 accent-[var(--color-copper)]" />
                      Exclude Reconstitution
                    </label>
                    <SubmitButton variant="secondary" pendingLabel="Adding…" savedLabel="Added">
                      Add code
                    </SubmitButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No referral partners yet">
          Create your first partner above to start tracking referrals.
        </EmptyState>
      )}
    </div>
  );
}
