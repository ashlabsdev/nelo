"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowUp,
} from "lucide-react";

export default function ScrollToTop() {
  const [
    visible,
    setVisible,
  ] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(
        window.scrollY >
          700
      );
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  function goToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={goToTop}
      title="Back to top"
      aria-label="Back to top"
      className="theme-accent-bg fixed bottom-24 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 md:bottom-6"
    >
      <ArrowUp
        size={20}
      />
    </button>
  );
}