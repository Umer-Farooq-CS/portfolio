import { useEffect } from "react";
import { SITE, absoluteUrl } from "./site";

export interface PageMeta {
  /** Page-specific title. The site name is appended automatically. */
  title: string;
  description?: string;
  /** Route path, e.g. "/projects/qcanvas". Used for the canonical URL. */
  path: string;
  /** Absolute or root-relative image URL for social cards. */
  image?: string;
  type?: "website" | "article";
  /** Set true on pages that shouldn't be indexed (e.g. the dev token page). */
  noIndex?: boolean;
}

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

/**
 * Gives each route its own title, description, canonical URL, and social card.
 * Without this every page shares one <title>, which is what the site did before.
 */
export function useDocumentMeta({
  title,
  description = SITE.description,
  path,
  image,
  type = "website",
  noIndex = false,
}: PageMeta): void {
  useEffect(() => {
    const fullTitle = title === SITE.name ? `${SITE.name} — ${SITE.role}` : `${title} · ${SITE.name}`;
    const canonical = absoluteUrl(path);
    const cardImage = image ? (image.startsWith("http") ? image : absoluteUrl(image)) : absoluteUrl(SITE.ogImage);

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", canonical);

    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonical);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:image"]', "property", "og:image", cardImage);

    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", cardImage);
  }, [title, description, path, image, type, noIndex]);
}
