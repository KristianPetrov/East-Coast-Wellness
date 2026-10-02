import type { users } from "@/db/schema";
import { StatusPill } from "@/app/ui";
import { updateMemberPricing } from "../actions";
import { SubmitButton } from "../FormButtons";
import { adminCheckbox, EmptyState, PanelHeader, SearchBox, StatCard } from "../ui";

type User = typeof users.$inferSelect;

const joinedFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});

export function AccountsPanel({ userRows, query }: { userRows: User[]; query?: string }) {
  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const visible = userRows.filter(
    (user) =>
      !normalizedQuery ||
      [user.name, user.email].join(" ").toLowerCase().includes(normalizedQuery),
  );
  const memberCount = userRows.filter((user) => user.memberPricingEnabled).length;

  return (
    <div className="grid gap-8">
      <PanelHeader
        title="Accounts"
        description="Enable special member pricing for individual accounts. Retail pricing remains the default for everyone else."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Accounts" value={userRows.length} hint="Registered customers" />
        <StatCard label="Member pricing" value={memberCount} hint="Accounts with special pricing" tone="success" />
      </div>

      <SearchBox tab="accounts" query={query} placeholder="Search name or email" />

      {visible.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
          {visible.map((user, index) => (
            <form
              key={user.id}
              action={updateMemberPricing}
              className={`grid gap-3 px-5 py-4 transition hover:bg-bone/70 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4 ${
                index > 0 ? "border-t border-ink/8" : ""
              }`}
            >
              <input type="hidden" name="userId" value={user.id} />
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand font-display text-lg text-ink-soft"
                  aria-hidden
                >
                  {user.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{user.name}</p>
                    {user.role === "admin" ? <StatusPill tone="neutral">Admin</StatusPill> : null}
                    {user.memberPricingEnabled ? <StatusPill tone="success">Member</StatusPill> : null}
                  </div>
                  <p className="truncate text-xs text-muted">
                    {user.email} · Joined {joinedFormatter.format(user.createdAt)}
                  </p>
                </div>
              </div>
              <label className={adminCheckbox}>
                <input
                  name="memberPricingEnabled"
                  type="checkbox"
                  defaultChecked={user.memberPricingEnabled}
                  className="h-4 w-4 accent-[var(--color-copper)]"
                />
                Special member pricing
              </label>
              <SubmitButton>Save</SubmitButton>
            </form>
          ))}
        </div>
      ) : (
        <EmptyState title={userRows.length === 0 ? "No accounts yet" : "No matching accounts"}>
          {userRows.length === 0
            ? "Customer accounts will appear here after registration."
            : "Try another search term."}
        </EmptyState>
      )}
    </div>
  );
}
