"use client";

import { useRef, useState } from "react";
import sourceForm from "./contact-source.json";

const products = sourceForm.products;

function matchProduct(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  return products.find((product) => {
    const name = product.toLowerCase().replace(/[^a-z]/g, "");
    return normalized.length > 2 && (name.includes(normalized) || normalized.includes(name));
  }) ?? (normalized.includes("wholesale") ? "Retail Textile Bags" : "");
}

export function ContactForm({ initialProduct = "" }: { initialProduct?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [description, setDescription] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const selectedProduct = matchProduct(initialProduct) || initialProduct.trim().slice(0, 160) || products[0];
  const customProduct = selectedProduct && !products.includes(selectedProduct) ? selectedProduct : "";

  function requestQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const firstInput = form.elements.namedItem("firstName") as HTMLInputElement;
    const lastInput = form.elements.namedItem("lastName") as HTMLInputElement;
    const phoneInput = form.elements.namedItem("phone") as HTMLInputElement;
    firstInput.setCustomValidity(/\p{L}/u.test(firstName) ? "" : "Please enter your first name.");
    lastInput.setCustomValidity(/\p{L}/u.test(lastName) ? "" : "Please enter your last name.");
    const phoneDigits = phone.replace(/\D/g, "");
    phoneInput.setCustomValidity(/^[+\d\s().-]+$/.test(phone) && phoneDigits.length >= 7 && phoneDigits.length <= 15 ? "" : "Please enter a valid phone number, including the country code where needed.");
    if (!form.reportValidity()) return;

    const product = String(data.get("product") ?? "");
    const subject = product ? `Packaging quote request: ${product}` : "Packaging quote request";
    const body = [
      `Name: ${firstName} ${lastName}`,
      `Email: ${String(data.get("email") ?? "").trim()}`,
      `Phone: ${phone}`,
      `Product: ${product || "Please advise"}`,
      "",
      "Description:",
      description.trim(),
    ].join("\n");
    const url = `mailto:info@dkwplastics.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setDraftUrl(url);
    window.location.href = url;
  }

  return (
    <form className="quote-form" ref={formRef} onSubmit={requestQuote}>
      <div className="quote-form-row">
        <div className="quote-field">
          <label htmlFor="quote-first-name">First Name <span aria-hidden="true">*</span></label>
          <input id="quote-first-name" name="firstName" autoComplete="given-name" placeholder="E.g. John" required maxLength={80} onInput={(event) => event.currentTarget.setCustomValidity("")} />
        </div>
        <div className="quote-field">
          <label htmlFor="quote-last-name">Last Name <span aria-hidden="true">*</span></label>
          <input id="quote-last-name" name="lastName" autoComplete="family-name" placeholder="E.g. Doe" required maxLength={80} onInput={(event) => event.currentTarget.setCustomValidity("")} />
        </div>
      </div>
      <div className="quote-field">
          <label htmlFor="quote-email">Email Address <span aria-hidden="true">*</span></label>
          <input id="quote-email" name="email" type="email" autoComplete="email" placeholder="E.g. example@gmail.com" required maxLength={254} />
      </div>
      <div className="quote-field">
          <label htmlFor="quote-phone">Phone Number <span aria-hidden="true">*</span></label>
          <input id="quote-phone" name="phone" type="tel" autoComplete="tel" placeholder="E.g. +94 77 345 6789" required maxLength={30} onInput={(event) => event.currentTarget.setCustomValidity("")} />
      </div>
      <div className="quote-field">
        <label htmlFor="quote-product">Product</label>
        <select id="quote-product" name="product" defaultValue={selectedProduct}>
          {customProduct && <option value={customProduct}>{customProduct}</option>}
          {products.map((product) => <option key={product} value={product}>{product}</option>)}
        </select>
      </div>
      <div className="quote-field">
        <label htmlFor="quote-description">Description</label>
        <textarea id="quote-description" name="description" rows={6} maxLength={sourceForm.descriptionLimit} value={description} onChange={(event) => setDescription(event.target.value)} aria-describedby="quote-description-count" />
        <span className="quote-character-count" id="quote-description-count">{description.length} / {sourceForm.descriptionLimit}</span>
      </div>
      <button className="quote-submit" type="submit">{sourceForm.submitLabel}</button>
      <p className="quote-email-note">Your request opens in your email app. Review it there and send it to DKW.</p>
      {draftUrl && <p className="quote-draft-status" role="status">Your email app should open with your quote request. If it did not, <a href={draftUrl}>open the email draft</a> or email <a href="mailto:info@dkwplastics.com">info@dkwplastics.com</a>. Your request has not been sent by this website.</p>}
    </form>
  );
}
