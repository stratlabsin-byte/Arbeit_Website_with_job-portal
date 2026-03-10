"use client";

import { useEffect, useRef } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
  delay?: number;
  animation?: "fade-up" | "fade-left" | "fade-right" | "zoom-in" | "fade";
}

export default function AnimatedSection({
  children,
  className = "",
  as: Tag = "div",
  delay = 0,
  animation = "fade-up",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("animate-visible");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref as any}
      className={`animate-on-scroll animate-${animation} ${className}`}
    >
      {children}
    </Tag>
  );
}
