import { useEffect, useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type FadeProps = {
  className: string;
  style: { transitionDelay: string };
};

/** Mount fade-up for page heroes (faster, like homepage hero). */
export function useHeroMotion() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReady(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const fade = (delayMs = 0): FadeProps => ({
    className: `transition-[opacity,transform] duration-1000 ease-out ${
      ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`,
    style: { transitionDelay: ready ? `${delayMs}ms` : "0ms" },
  });

  return { ready, fade };
}

/** Scroll fade-up for page CTAs (slower, like homepage CTA). */
export function useCtaMotion() {
  const { ref, visible } = useScrollReveal<HTMLElement>();

  const fade = (delayMs = 0): FadeProps => ({
    className: `transition-[opacity,transform] duration-[1600ms] ease-out ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`,
    style: { transitionDelay: visible ? `${delayMs}ms` : "0ms" },
  });

  return { ref, visible, fade };
}
