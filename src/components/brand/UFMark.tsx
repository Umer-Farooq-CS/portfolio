import { motion } from "motion/react";
import logoDark from "@/assets/brand/uf-logo-dark.svg";
import logoLight from "@/assets/brand/uf-logo-light.svg";
import { useMotionPolicy } from "@/lib/motion-policy";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const LOGO_WIDTH = 421;
const LOGO_HEIGHT = 209;

interface UFMarkProps {
  /** Display height; width is derived from the master artwork's intrinsic ratio. */
  height?: number;
  className?: string;
  /**
   * Omit when adjacent text already says “Umer Farooq”; the mark is decorative
   * by default. Supply a label only when the artwork stands on its own.
   */
  label?: string;
  /** A restrained entrance for the persistent header mark. Never loops. */
  animated?: boolean;
}

/** Theme-resolved rendering of the supplied UF identity artwork. */
export default function UFMark({
  height = 24,
  className,
  label,
  animated = false,
}: UFMarkProps) {
  const { resolved } = useTheme();
  const { enabled, duration } = useMotionPolicy();
  const width = Math.round((height * LOGO_WIDTH) / LOGO_HEIGHT);
  const animatesOnMount = enabled && animated;

  return (
    <motion.img
      src={resolved === "dark" ? logoDark : logoLight}
      width={width}
      height={height}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      data-theme-asset={resolved}
      draggable={false}
      className={cn("block h-auto shrink-0 object-contain", className)}
      initial={animatesOnMount ? { opacity: 0, x: -4 } : false}
      animate={{ opacity: 1, x: 0 }}
      whileHover={enabled ? { x: 1.5 } : undefined}
      transition={{ duration: duration(0.35), ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
