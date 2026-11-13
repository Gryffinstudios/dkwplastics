import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/sites/dkwplastics/blog-page";
import posts from "@/components/sites/dkwplastics/posts.json";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((candidate) => candidate.slug === slug);
  if (!post) notFound();
  return {
    title: `${post.title} - DKW Plastic Industries`,
    description: post.summary,
    openGraph: { title: post.title, description: post.summary, type: "article", publishedTime: post.date },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((candidate) => candidate.slug === slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
