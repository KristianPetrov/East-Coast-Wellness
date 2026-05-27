export const siteConfig = {
  name: "East Coast Wellness",
  shortName: "ECW",
  description:
    "Premium research-use molecule catalog with compliant product information, clear ordering, and responsive support.",
  url: getSiteUrl(),
  locale: "en_US",
  logo: "/ecw-logo.png",
  ogImage: "/opengraph-image",
  twitterImage: "/twitter-image",
  keywords: [
    "East Coast Wellness",
    "research molecules",
    "research peptides",
    "laboratory research supplies",
    "research-use molecules",
    "reconstitution solution",
  ],
};

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "https://eastcoastwellness.com";

  return new URL(
    configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`,
  );
}

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
