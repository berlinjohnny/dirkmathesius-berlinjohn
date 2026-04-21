import { useEffect } from "react";

export function useScrollSpy() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
    if (sections.length === 0) return;

    let timer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        let current = sections[0]?.id ?? "";
        const mid = window.innerHeight * 0.45;
        for (const sec of sections) {
          if (sec.getBoundingClientRect().top <= mid) current = sec.id;
        }
        if (current && "#" + current !== window.location.hash) {
          history.replaceState(null, "", "#" + current);
        }
      }, 80);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);
}
