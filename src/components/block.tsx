import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The "+ ACTION" motif — every primary action on the page is a plus-prefixed,
 * wide-tracked uppercase label. Two shapes:
 *
 *  - `Action`: a bare text link (follow-outs, contact, secondary moves)
 *  - the bordered-rectangle style lives on the buttons that use it directly
 *    (NotifyButton, the form submit), since those carry their own behaviour
 *
 * The "+" is presentation, added here — copy in site.ts stays clean.
 */
export function Action({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a
      {...props}
      className={cn(
        "group inline-flex items-baseline gap-2 font-ui text-[0.72rem] tracking-[0.2em] text-foreground/85 uppercase transition-colors duration-300 hover:text-foreground",
        className
      )}
    >
      <span aria-hidden className="transition-transform duration-300 group-hover:rotate-90">
        +
      </span>
      <span className="relative">
        {children}
        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-500 ease-out group-hover:scale-x-100" />
      </span>
    </a>
  );
}

/** Shared rectangle-button classes for primary actions — hard edges, inverts on hover. */
export const actionButtonClass =
  "inline-flex h-12 items-center gap-2 border border-foreground bg-foreground px-7 font-ui text-[0.72rem] tracking-[0.2em] text-background uppercase transition-colors duration-300 hover:bg-transparent hover:text-foreground";

/**
 * The glass form of the same action — used by the release blocks, where the
 * chip sits on artwork rather than on a panel. Near-colourless frost with a 1px
 * rim; the artwork behind it supplies all the colour. Tint, hover and the
 * reduced-transparency fallback live on `.glass-chip` in globals.css, because
 * unlayered rules there outrank any utility written here.
 */
export const actionChipClass =
  "glass-chip group inline-flex h-12 items-center gap-2.5 rounded-full px-6 font-ui text-[0.7rem] tracking-[0.2em] text-foreground uppercase";

type ActionChipProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

/** `Action`'s chip sibling: same "+ LABEL" motif, on glass. */
export function ActionChip({ children, className, ...props }: ActionChipProps) {
  return (
    <a {...props} className={cn(actionChipClass, className)}>
      <span aria-hidden className="transition-transform duration-300 group-hover:rotate-90">
        +
      </span>
      {children}
    </a>
  );
}

type BlockLabelProps = {
  /** "01" — the block's position in the stack. */
  index: string;
  /** "Upcoming single" — what the block is. */
  label: string;
  className?: string;
};

/** Mono index label pinned in a block's corner: "01 — UPCOMING SINGLE". */
export function BlockLabel({ index, label, className }: BlockLabelProps) {
  return (
    <p className={cn("block-index", className)}>
      {index} — {label}
    </p>
  );
}
