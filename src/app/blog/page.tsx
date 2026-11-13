import type { Metadata } from "next";
import { BlogIndex } from "@/components/sites/dkwplastics/blog-page";

export const metadata: Metadata = {
  title: "Blog - DKW Plastic Industries",
  description: "Packaging articles from DKW Plastic Industries covering resealable bags, recycling, and food-grade packaging.",
};

export default function BlogPage() {
  return <BlogIndex />;
}
