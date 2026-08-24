import type { ResponsiveImage } from "@/assets/optimized/manifest";

interface PictureProps {
  image: ResponsiveImage;
  alt: string;
  /** Rendered widths per breakpoint, e.g. "(min-width: 1024px) 480px, 100vw". */
  sizes: string;
  className?: string;
  /** Set on the one image that is likely the largest element in the viewport. */
  priority?: boolean;
}

/**
 * Serves AVIF, then WebP, then the widest WebP as the fallback, and always carries
 * intrinsic dimensions so the browser reserves space (no layout shift).
 */
export default function Picture({ image, alt, sizes, className, priority = false }: PictureProps) {
  return (
    // display:contents makes the <img> the direct layout child, so the parent's
    // sizing and object-fit classes apply as if the <picture> weren't there.
    <picture style={{ display: "contents" }}>
      {image.sources.map((source) => (
        <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={sizes} />
      ))}
      <img
        src={image.fallback}
        alt={alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={className}
      />
    </picture>
  );
}
