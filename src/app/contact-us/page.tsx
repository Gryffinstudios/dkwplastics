import type { Metadata } from "next";
import { ContactForm } from "@/components/sites/dkwplastics/contact-form";
import { DkwFooter, DkwHeader } from "@/components/sites/dkwplastics/site-shell";
import "@/components/sites/dkwplastics/contact.css";

export const metadata: Metadata = {
  title: "Contact Us - DKW Plastic Industries",
  description: "Contact DKW Plastic Industries to discuss your packaging requirements and request a quote.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const query = await searchParams;

  return (
    <div className="dkw dkw-contact-page" id="top">
      <a className="skip-link" href="#contact-content">Skip to content</a>
      <div className="dkw-page-header contact-page-header"><DkwHeader /></div>
      <main id="contact-content" className="contact-content" aria-label="Request a packaging quote">
        <ContactForm initialProduct={query.product ?? ""} />
      </main>
      <DkwFooter />
    </div>
  );
}
