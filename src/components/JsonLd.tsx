import { useEffect } from "react";

/**
 * Injects a JSON-LD block for the current route and removes it on unmount, so
 * structured data never leaks from one page to the next.
 */
export default function JsonLd({ id, data }: { id: string; data: unknown }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `jsonld-${id}`;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [id, data]);

  return null;
}
