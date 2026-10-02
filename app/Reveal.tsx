"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
};

/**
 * Fades and lifts content into place the first time it scrolls into view.
 * Content is server-rendered hidden and revealed by CSS; <noscript> in the
 * root layout and prefers-reduced-motion both force it visible.
 */
export function Reveal({
  children,
  as: Component = "div",
  className,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      data-reveal={shown ? "shown" : "pending"}
      className={className}
      style={delay ? ({ "--delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Component>
  );
}
