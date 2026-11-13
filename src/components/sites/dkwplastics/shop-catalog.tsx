"use client";

/* The catalog uses the original source images without altering their crops. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { catalogCategories, catalogIntro, type CatalogCategory, type CatalogVariant } from "./catalog-data";
import "./shop.css";

function CatalogGallery({ category }: { category: CatalogCategory }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [enlarged, setEnlarged] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);
  const image = category.gallery[selectedImage];
  const count = category.gallery.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (enlarged && !dialog?.open) dialog?.showModal();
    else if (!enlarged && dialog?.open) dialog.close();
  }, [enlarged]);

  function cycleImage(direction: number) {
    setSelectedImage((current) => (current + direction + count) % count);
  }

  function galleryKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") { event.preventDefault(); cycleImage(1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); cycleImage(-1); }
    else if (event.key === "Home") { event.preventDefault(); setSelectedImage(0); }
    else if (event.key === "End") { event.preventDefault(); setSelectedImage(count - 1); }
  }

  function finishSwipe(event: TouchEvent<HTMLElement>) {
    if (touchStart.current === null) return;
    const movement = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(movement) > 45) cycleImage(movement > 0 ? -1 : 1);
    touchStart.current = null;
  }

  return (
    <div className="catalog-gallery" role="region" aria-roledescription="carousel" aria-label={`${category.title} examples`} onKeyDown={galleryKeys}>
      <div className="catalog-gallery-stage" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={finishSwipe}>
        <button type="button" className="catalog-gallery-open" aria-label={`Enlarge ${image.caption || image.alt}`} ref={openerRef} onClick={() => setEnlarged(true)}>
          <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />
        </button>
        {count > 1 && <>
          <button type="button" className="catalog-gallery-arrow catalog-gallery-prev" aria-label={`Previous ${category.shortName} image`} onClick={() => cycleImage(-1)}><ChevronLeft /></button>
          <button type="button" className="catalog-gallery-arrow catalog-gallery-next" aria-label={`Next ${category.shortName} image`} onClick={() => cycleImage(1)}><ChevronRight /></button>
        </>}
      </div>
      <p className="catalog-gallery-caption" aria-live="polite">{image.caption}</p>
      {count > 1 && <div className="catalog-thumbnails" aria-label={`${category.title} image selection`}>
        {category.gallery.map((thumbnail, index) => <button key={thumbnail.src} type="button" aria-label={`Show ${thumbnail.caption || thumbnail.alt} (${index + 1} of ${count})`} aria-pressed={selectedImage === index} onClick={() => setSelectedImage(index)}>
          <img src={thumbnail.src} alt="" width="60" height="60" loading="lazy" />
        </button>)}
      </div>}
      <dialog className="catalog-image-dialog" ref={dialogRef} aria-label={image.caption || image.alt} onCancel={() => setEnlarged(false)} onClose={() => { setEnlarged(false); openerRef.current?.focus(); }} onClick={(event) => { if (event.target === event.currentTarget) setEnlarged(false); }}>
        <button type="button" className="catalog-gallery-close" aria-label="Close enlarged image" onClick={() => setEnlarged(false)}><X /></button>
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} />
        <p>{image.caption}</p>
        {count > 1 && <div className="catalog-dialog-navigation">
          <button type="button" aria-label="Previous enlarged image" onClick={() => cycleImage(-1)}><ChevronLeft /></button><span>{selectedImage + 1} / {count}</span><button type="button" aria-label="Next enlarged image" onClick={() => cycleImage(1)}><ChevronRight /></button>
        </div>}
      </dialog>
    </div>
  );
}

function CatalogTable({ variant }: { variant: CatalogVariant }) {
  return (
    <table>
      <caption className="catalog-sr-only">Specifications for {variant.name}</caption>
      <thead><tr><th scope="col">Title</th><th scope="col">Value</th></tr></thead>
      <tbody>{variant.specifications.map((specification) => <tr key={specification.title}><th scope="row">{specification.title}</th><td dangerouslySetInnerHTML={{ __html: specification.valueHtml }} /></tr>)}</tbody>
    </table>
  );
}

function CatalogSection({ category }: { category: CatalogCategory }) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = category.variants[selected];
  const tabPrefix = `catalog-${category.id}`;

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % category.variants.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + category.variants.length) % category.variants.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = category.variants.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="catalog-section" id={category.id} aria-labelledby={`${tabPrefix}-heading`}>
      <div className="catalog-visual">
        <h2 id={`${tabPrefix}-heading`}>{category.title}</h2>
        <CatalogGallery category={category} />
      </div>
      <div className="catalog-details">
        <div className="catalog-description">
          <h3>Description</h3>
          <div dangerouslySetInnerHTML={{ __html: category.description }} />
        </div>
      <div className="catalog-specifications catalog-desktop-specifications">
        <div className="catalog-tabs" role="tablist" aria-label={`${category.title} variants`}>
          {category.variants.map((item, index) => <button
            key={item.name}
            type="button"
            role="tab"
            id={`${tabPrefix}-tab-${index}`}
            aria-selected={selected === index}
            aria-controls={`${tabPrefix}-panel`}
            tabIndex={selected === index ? 0 : -1}
            ref={(element) => { tabRefs.current[index] = element; }}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => navigateTabs(event, index)}
          >{item.name}</button>)}
        </div>
        <div className="catalog-panel" id={`${tabPrefix}-panel`} role="tabpanel" aria-labelledby={`${tabPrefix}-tab-${selected}`} tabIndex={0}>
          <CatalogTable variant={current} />
        </div>
      </div>
        <div className="catalog-mobile-specifications">
          {category.variants.map((item, index) => <div className="catalog-mobile-variant" key={item.name}>
            <h4><button type="button" id={`${tabPrefix}-mobile-button-${index}`} aria-expanded={selected === index} aria-controls={`${tabPrefix}-mobile-panel-${index}`} onClick={() => setSelected(index)}>{item.name}</button></h4>
            <div hidden={selected !== index} className="catalog-panel" role="region" id={`${tabPrefix}-mobile-panel-${index}`} aria-labelledby={`${tabPrefix}-mobile-button-${index}`}><CatalogTable variant={item} /></div>
          </div>)}
        </div>
        <Link className="catalog-inquire" href={`/contact-us/?product=${encodeURIComponent(current.name)}`}>{category.inquiryLabel}</Link>
      </div>
    </section>
  );
}

export function ShopCatalog() {
  const [activeCategory, setActiveCategory] = useState("01");

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
      if (visible.length) setActiveCategory(visible[0].target.id);
    }, { rootMargin: "-10% 0px -65% 0px" });
    catalogCategories.forEach((category) => {
      const section = document.getElementById(category.id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="shop-catalog">
      <nav className="catalog-jumpnav" aria-label="Product categories"><div className="container">
        {catalogCategories.map((category) => <a key={category.id} href={`#${category.id}`} aria-current={activeCategory === category.id ? "location" : undefined} onClick={() => setActiveCategory(category.id)}>{category.shortName}</a>)}
      </div></nav>
      <div className="catalog-content">
        <p className="catalog-intro">{catalogIntro}</p>
        {catalogCategories.map((category) => <CatalogSection key={category.id} category={category} />)}
      </div>
    </div>
  );
}
