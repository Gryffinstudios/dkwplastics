"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Mail, MapPin, Menu, Phone, X, ArrowUp } from "lucide-react";
import "./dkw.css";
import "./shell.css";

const assets = "/sites/dkwplastics/";
const navigation = [
  { name: "Our Journey", href: "/#journey" },
  { name: "Products", href: "/shop/" },
  { name: "Client Reviews", href: "/#client-reviews" },
  { name: "Contact Us", href: "/contact-us/" },
];

export function DkwHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
          <div className="contact-bar"><div className="contact-inner">
            <div className="locations">
              <a href="https://www.google.com/maps/place/DKW+Plastic+Industries,+Hatton+-+Maskeliya+-+Dalhousie+Rd,+Hatton,+Sri+Lanka/@6.894413,80.593384,17z/data=!4m6!3m5!1s0x3ae39b73055c5389:0x4c0c06b5d51754e2!8m2!3d6.8944076!4d80.5959586!16s%2Fg%2F1hhmw75wq?hl=en-US&entry=ttu"><MapPin aria-hidden="true" />Hatton</a>
              <a href="https://maps.app.goo.gl/HzeVAK3s4ar1PJ3X9"><MapPin aria-hidden="true" />Colombo</a>
            </div>
            <div className="contact-details">
              <a href="tel:+94512222117"><Phone aria-hidden="true" /><span>(051) 222-2117</span></a>
              <a href="mailto:info@dkwplastics.com"><Mail aria-hidden="true" /><span className="desktop-email">info@dkwplastics.com</span><span className="mobile-email">Email</span></a>
            </div>
          </div></div>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.slice(0, 2).map((item) => <Link key={item.name} href={item.href}>{item.name}</Link>)}
            <Link className="logo-link" href="/" aria-label="DKW Plastic Industries home"><img src={`${assets}dkw-logo.svg`} alt="DKW Plastic Industries — Since 1981" width="200" height="200" /></Link>
            {navigation.slice(2).map((item) => <Link key={item.name} href={item.href}>{item.name}</Link>)}
          </nav>
          <div className="mobile-header">
            <button aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
            <Link href="/" aria-label="DKW home"><img src={`${assets}dkw-logo.svg`} alt="DKW Plastic Industries — Since 1981" width="100" height="100" /></Link>
          </div>
          {menuOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            {navigation.map((item) => <Link key={item.name} href={item.href} onClick={() => setMenuOpen(false)}>{item.name}</Link>)}
            <Link href="/blog/" onClick={() => setMenuOpen(false)}>Blog</Link>
          </nav>}
        </header>
  );
}

export function DkwFooter() {
  return (
    <>
      <footer><p>©️ All Rights Reserved 2024 | DKW Plastic Industries</p><a href="https://circuitx.io/">Developed by CircuitX</a></footer>
      <a className="back-to-top" href="#top" aria-label="Go to Top"><ArrowUp /></a>
    </>
  );
}

type DkwPageShellProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
};

export function DkwPageShell({ children, title, description, className = "" }: DkwPageShellProps) {
  return (
    <div className={`dkw ${className}`} id="top">
      <a className="skip-link" href="#content">Skip to content</a>
      <div className="dkw-page-header">
        <DkwHeader />
        {title && <div className="dkw-page-title container"><h1>{title}</h1>{description && <p>{description}</p>}</div>}
      </div>
      <main id="content">{children}</main>
      <DkwFooter />
    </div>
  );
}
