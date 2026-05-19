import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Pantone palette from project brief
        ambernight: "#E5C7A1",   // 14-1217 TCX — warm cream / accent text
        skyway:     "#A1B4C7",   // 14-4112 TCX — info / muted text
        toffee:     "#755139",   // 18-1031 TCX — warm tan border
        "rytmic-red": "#9B2335", // 19-1653 TCX — primary CTA
        "tawny-port": "#6E2639", // 19-1725 TCX — hover / secondary
        "blue-coal":  "#353D4B", // 19-4120 TCX — surface
        syrah:       "#5D2028",  // 19-1535 TCX — destructive / deep
        ink:         "#1B2028",  // page background, slightly darker than blue-coal
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
