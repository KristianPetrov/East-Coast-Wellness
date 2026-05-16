import type { Metadata } from "next";
import { StorePage } from "./StorePage";

export const metadata: Metadata = {
  title: "Store | East Coast Wellness",
  description: "Search East Coast Wellness research-use peptide products.",
};

export default function Page() {
  return <StorePage />;
}
