import type { Metadata } from "next";
import { DkwPageShell } from "@/components/sites/dkwplastics/site-shell";
import { ShopCatalog } from "@/components/sites/dkwplastics/shop-catalog";

export const metadata: Metadata = {
  title: "Shop - DKW Plastic Industries",
  description: "DKW Plastic Industries packaging products and sectors: ziplock bags, food packaging, retail bags, agriculture, garments, household items, polythene reels, and gusseted bags.",
};

export default function ShopPage() {
  return (
    <DkwPageShell title="Products and Sectors" className="shop-page">
      <ShopCatalog />
    </DkwPageShell>
  );
}
