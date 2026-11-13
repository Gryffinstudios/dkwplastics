"use client";

/* Source media retain their original proportions; fallbacks are existing local DKW assets. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { DkwPageShell } from "./site-shell";
import { ArticleShare } from "./article-share";
import posts from "./posts.json";
import "./blog.css";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  image: string;
  summary: string;
  contentHtml: string;
};

function readableDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function fallbackImage(slug: string) {
  if (slug.includes("recycling") || slug.includes("recycle")) return "/sites/dkwplastics/recycle.png";
  if (slug.includes("food") || slug.includes("wijaya")) return "/sites/dkwplastics/food-2fb38c05.webp.png";
  return "/sites/dkwplastics/ziplocks-c7cf2dd5.webp.png";
}

function BlogImage({ post, eager = false }: { post: BlogPost; eager?: boolean }) {
  return <img src={post.image || fallbackImage(post.slug)} alt={post.title} width="900" height="550" loading={eager ? "eager" : "lazy"} onError={(event) => {
    if (event.currentTarget.dataset.fallback === "true") return;
    event.currentTarget.dataset.fallback = "true";
    event.currentTarget.src = fallbackImage(post.slug);
    event.currentTarget.alt = "DKW packaging illustration";
  }} />;
}

function BlogCard({ post }: { post: BlogPost }) {
  return <article className="blog-card">
    <Link href={`/${post.slug}/`} className="blog-card-image" aria-label={post.title}><BlogImage post={post} /></Link>
    <h2><Link href={`/${post.slug}/`}>{post.title}</Link></h2>
    <div className="blog-post-meta"><Link href="/blog/">Blog</Link><span aria-hidden="true"> / </span><time dateTime={post.date}>{readableDate(post.date)}</time></div>
    <p>{post.summary}</p>
  </article>;
}

export function BlogIndex() {
  return <DkwPageShell title="Blog" className="dkw-blog">
    <div className="blog-index container"><div className="blog-grid">{posts.map((post) => <BlogCard key={post.slug} post={post} />)}</div></div>
  </DkwPageShell>;
}

export function BlogArticle({ post }: { post: BlogPost }) {
  const index = posts.findIndex((candidate) => candidate.slug === post.slug);
  const previous = posts[index + 1];
  const next = posts[index - 1];
  const related = posts.filter((candidate) => candidate.slug !== post.slug).slice(0, 4);

  return <DkwPageShell title={post.title} className="dkw-blog dkw-blog-article">
    <article className="blog-article container">
      <div className="blog-feature-image"><BlogImage post={post} eager /></div>
      <div className="article-category"><Link href="/blog/">Blog</Link></div>
      {post.contentHtml ? <div className="blog-article-body" dangerouslySetInnerHTML={{ __html: post.contentHtml }} /> : <div className="blog-article-preview">
        <p>{post.summary}</p>
        <div className="article-preview-notice"><h2>Article preview</h2><p>Read the complete article on the DKW Plastic Industries website.</p><a className="blue-button" href={`https://dkwplastics.com/${post.slug}/`}>Read original article</a></div>
      </div>}
      <ArticleShare slug={post.slug} title={post.title} />
      <nav className="blog-article-navigation" aria-label="Article navigation">
        {previous ? <Link href={`/${previous.slug}/`}><span>← Previous article</span><strong>{previous.title}</strong></Link> : <span />}
        {next ? <Link href={`/${next.slug}/`}><span>Next article →</span><strong>{next.title}</strong></Link> : <span />}
      </nav>
      <Link href="/blog/" className="blog-back-link">← Back to Blog</Link>
    </article>
    <section className="blog-related container" aria-labelledby="related-articles-heading"><h2 id="related-articles-heading">Related Articles</h2><div className="blog-grid">{related.map((item) => <BlogCard key={item.slug} post={item} />)}</div></section>
  </DkwPageShell>;
}
