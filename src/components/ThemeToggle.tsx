import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Dark/Light-Umschalter. Der Ausgangszustand wird bereits in index.html (Inline-
// Skript) gesetzt, damit es keinen Flash gibt; hier nur noch spiegeln & togglen.
function isDark() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => setDark(isDark()), []);

  const toggle = () => {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("dm-theme", next ? "dark" : "light");
    } catch {
      /* noop */
    }
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Zu hellem Modus wechseln" : "Zu dunklem Modus wechseln"}
      title={dark ? "Heller Modus" : "Dunkler Modus"}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-foreground/15 text-foreground/60 hover:text-[#FF6600] hover:border-[#FF6600] transition-colors ${className}`}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
