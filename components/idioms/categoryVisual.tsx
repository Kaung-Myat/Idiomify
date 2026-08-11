import type { Category } from "@/lib/content";

export const CATEGORY_VISUAL: Record<
  Category,
  {
    accent: string;
    glow: string;
    blurbKey: "business" | "dailyLife" | "emotions" | "travel";
  }
> = {
  Business: {
    accent: "#f5a623",
    glow: "rgba(245,166,35,0.22)",
    blurbKey: "business",
  },
  "Daily Life": {
    accent: "#38b2ac",
    glow: "rgba(56,178,172,0.2)",
    blurbKey: "dailyLife",
  },
  Emotions: {
    accent: "#f07878",
    glow: "rgba(240,120,120,0.2)",
    blurbKey: "emotions",
  },
  Travel: {
    accent: "#7eb6ff",
    glow: "rgba(126,182,255,0.2)",
    blurbKey: "travel",
  },
};

export function CategoryIcon({
  category,
  className = "h-6 w-6",
}: {
  category: Category;
  className?: string;
}) {
  const stroke = "currentColor";
  if (category === "Business") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7"
          stroke={stroke}
          strokeWidth="1.75"
        />
        <rect
          x="4"
          y="7"
          width="16"
          height="13"
          rx="2"
          stroke={stroke}
          strokeWidth="1.75"
        />
        <path d="M4 12h16" stroke={stroke} strokeWidth="1.75" />
      </svg>
    );
  }
  if (category === "Daily Life") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke={stroke}
          strokeWidth="1.75"
        />
      </svg>
    );
  }
  if (category === "Emotions") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <circle cx="12" cy="12" r="8.25" stroke={stroke} strokeWidth="1.75" />
        <path
          d="M8.5 10.2h.01M15.5 10.2h.01M8.8 14.2c.9 1.2 2 1.8 3.2 1.8s2.3-.6 3.2-1.8"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3.5 17.5 10 6l3.5 6.5L17 8.5l3.5 9"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 6.5h4v4"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
