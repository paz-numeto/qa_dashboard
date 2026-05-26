import { useEffect, useState, useCallback } from "react";

// ── Dark/light mode hook ──────────────────────────────────────────────
// Persists to localStorage, toggles `.dark` on <html>, emits a
// `theme-changed` window event so chart components can re-render with
// new fore/grid colors.
export default function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: { dark } }));
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);
  return { dark, toggle };
}
