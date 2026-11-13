"use client";

import "./article-share.css";

const networks = [
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "Twitter" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "pinterest", label: "Pinterest" },
] as const;

type ShareNetwork = typeof networks[number]["id"];

export function ArticleShare({ slug, title }: { slug: string; title: string }) {
  function share(network: ShareNetwork) {
    const currentUrl = window.location.href;
    const destinations: Record<ShareNetwork, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: currentUrl })}`,
      twitter: `https://twitter.com/intent/tweet?${new URLSearchParams({ url: currentUrl, text: title })}`,
      whatsapp: `https://wa.me/?${new URLSearchParams({ text: `${title} ${currentUrl}` })}`,
      pinterest: `https://www.pinterest.com/pin/create/button/?${new URLSearchParams({ url: currentUrl, description: title })}`,
    };
    window.open(destinations[network], "_blank", "noopener,noreferrer,width=640,height=600");
  }

  return (
    <section className="article-share" aria-labelledby={`article-share-${slug}`}>
      <h3 id={`article-share-${slug}`}>SHARE ARTICLE :</h3>
      <div className="article-share-buttons">
        {networks.map((network) => <button key={network.id} className={`article-share-button article-share-${network.id}`} type="button" aria-label={`Share on ${network.label}`} title={`Share on ${network.label}`} onClick={() => share(network.id)}>
          <span className={`article-share-icon article-share-icon-${network.id}`} aria-hidden="true" />
        </button>)}
      </div>
    </section>
  );
}
