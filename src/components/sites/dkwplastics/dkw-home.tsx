"use client";

/* Original image crops and SVGs are intentionally rendered unmodified. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DkwHeader, DkwFooter } from "./site-shell";
import content from "./content.json";
import "./dkw.css";

const assets = "/sites/dkwplastics/";
const bags = ["1.10-254x300.png", "1.9-300x227.png", "1.8-300x292.png", "1.6-283x300.png", "1.5ruby-192x300.png", "1.4.Nursery-237x300.png", "1.4.1-208x300.png", "1.3ZL-Spare-198x300.png", "1.3odeal-214x300.png", "1.3noli-213x300.png", "1.2.flora_-190x300.png", "1.1-LH-217x300.png", "1.11-138x300.png", "1.7rain-300x300.jpeg", "1.5kruak-236x300.png"];
const services = [
  { title: "Recycling Scheme", image: "recycle.png", text: "We will buy eligible plastics products for recycling. Please reach out to obtain further details on what we can recycle." },
  { title: "On-time Delivery", image: "hkjjg-150x150.png", text: "We take pride in our 98% on-time delivery rate, showcasing our commitment to meeting deadlines and satisfying our clients." },
  { title: "Scalable Production", image: "Rectangle-17d-150x150.png", text: "Our state-of-the-art facility has a production capacity of 500 tons per month, ensuring timely delivery of high-quality products." },
];

export function DkwHome() {
  const [review, setReview] = useState(0);
  const [service, setService] = useState(0);
  const [reviewsPaused, setReviewsPaused] = useState(false);
  useEffect(() => {
    if (reviewsPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setReview((current) => (current + 1) % content.reviews.length), 5000);
    return () => window.clearInterval(timer);
  }, [reviewsPaused]);

  const cycleReview = (direction: number) => setReview((current) => (current + direction + content.reviews.length) % content.reviews.length);

  return (
    <div className="dkw" id="top">
      <a className="skip-link" href="#content">Skip to content</a>
      <section className="hero">
        <DkwHeader />
        <div id="content" className="hero-content">
          <h1>Manufacturing Custom<br />PolyPackaging Solutions</h1>
          <div className="hero-description"><h2>Quality, Affordability, Integrity</h2><p>Specialized in retail bags, zip locks, food, agriculture and garment packaging, garbage bags, films and more</p></div>
          <div className="statistics">
            {[['42+', 'Years in Industry'], ['10+', 'Sectors Served'], ['1,000+', 'Satisfied Customers'], ['3.4 Million KG', 'Volume Recycled']].map(([value, label]) => <div key={label}><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>)}
          </div>
        </div>
      </section>

      <main>
        <div className="bag-marquee" aria-label="A selection of DKW packaging products"><div className="bag-track">
          {[0, 1].map((copy) => <div className="bag-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {bags.map((bag, index) => <img key={bag} src={assets + bag} alt={copy === 0 ? `DKW packaging sample ${index + 1}` : ""} width="180" height="220" />)}
          </div>)}
        </div></div>

        <section id="journey" className="clients section container">
          <h2>Our Past Clients from 40 Years across the Island</h2><p className="section-intro">{content.clientIntro}</p>
          <Link className="blue-button" href="/blog/">View Blog</Link>
          <div className="client-logos">{content.clients.map((client) => <img key={client.src} src={client.src} alt={client.alt} width="180" height="85" loading="lazy" />)}</div>
          <img className="product-overview" src={`${assets}webuop-imgp-1024x481.png`} alt="DKW packaging product range" width="1024" height="481" loading="lazy" />
        </section>

        <section id="products" className="products section container">
          <h2>Products and Sectors</h2><p className="section-intro">{content.productIntro}</p>
          <div className="product-grid">{content.products.map((product) => <article className="product-card" key={product.title}>
            <Link href={product.href.replace("https://dkwplastics.com", "")} className="product-picture"><img src={product.image.src} alt={product.image.alt} width="550" height="360" loading="lazy" /></Link>
            <div className="product-copy"><h3><Link href="/shop/">{product.title}</Link></h3>
              <div dangerouslySetInnerHTML={{ __html: product.body }} /><Link className="see-more" href={product.href.replace("https://dkwplastics.com", "")}>See More &gt;&gt;&gt;</Link>
            </div>
          </article>)}</div>
        </section>

        <section className="services section container" aria-label="Our Services">
          <h2>Our Services</h2><p className="section-intro">{content.servicesIntro}</p>
          <div className="service-slider">
            <button className="carousel-arrow service-prev" aria-label="Previous service" onClick={() => setService((service + 2) % 3)}><ChevronLeft /></button>
            <div className="service-grid">{[0, 1].map((index) => { const item = services[(service + index) % services.length]; return <article className={`service-card ${index === 0 ? 'selected-service' : ''}`} key={item.title}>
              <img src={assets + item.image} alt="" width="150" height="150" loading="lazy" /><h3>{item.title}</h3><p>{item.text}</p>
            </article>; })}</div>
            <button className="carousel-arrow service-next" aria-label="Next service" onClick={() => setService((service + 1) % 3)}><ChevronRight /></button>
          </div>
        </section>

        <section className="global section container">
          <h2>Global Exposure</h2><p className="section-intro">{content.globalIntro}</p>
          <img src={`${assets}Screenshot-2023-12-11-120651.png`} alt="World map showing DKW's global reach" width="1100" height="500" loading="lazy" />
        </section>
        <section className="customize section container">
          <div><h2>Customize your packaging</h2><p>{content.customIntro}</p><Link className="blue-button" href="/contact-us/?product=Custom%20packaging">Get Started</Link></div>
          <img src={`${assets}ship-e4961f92.webp.png`} alt="Customized packaging and shipping solutions" width="550" height="460" loading="lazy" />
        </section>

        <section id="client-reviews" className="reviews section"><div className="container">
          <h2>Hear from Customers</h2>
          <div className="reviews-carousel" aria-roledescription="carousel" aria-label="Customer reviews" onMouseEnter={() => setReviewsPaused(true)} onMouseLeave={() => setReviewsPaused(false)} onFocus={() => setReviewsPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setReviewsPaused(false); }}>
            <button className="carousel-arrow review-prev" aria-label="Previous review" onClick={() => cycleReview(-1)}><ChevronLeft /></button>
            <div className="reviews-grid" aria-live={reviewsPaused ? "polite" : "off"}>{[0, 1].map((offset) => {
              const item = content.reviews[(review + offset) % content.reviews.length];
              return <article className={`review-card review-offset-${offset}`} key={item.name}>
                <p>{item.text}</p><div className="review-person"><img src={item.image} alt={item.name} width="80" height="80" loading="lazy" /><div><h3>{item.name}</h3><span>Co-owner</span></div></div>
              </article>;
            })}</div>
            <button className="carousel-arrow review-next" aria-label="Next review" onClick={() => cycleReview(1)}><ChevronRight /></button>
          </div>
          <div className="review-dots">{content.reviews.map((item, index) => <button key={item.name} aria-label={`Go to review ${index + 1}`} aria-current={review === index ? "true" : undefined} onClick={() => setReview(index)} />)}</div>
        </div></section>
      </main>
      <DkwFooter />
    </div>
  );
}
