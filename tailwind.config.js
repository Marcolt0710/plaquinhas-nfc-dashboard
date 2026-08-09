/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--bg-page)",
        card: "var(--bg-card)",
        "card-hover": "var(--bg-card-hover)",
        input: "var(--bg-input)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        disabled: "var(--text-disabled)",
        accent: {
          DEFAULT: "var(--accent-green)",
          strong: "var(--accent-green-strong)",
          tint: "var(--accent-green-tint)",
          ink: "var(--accent-green-ink)",
        },
        alert: {
          DEFAULT: "var(--red-alert)",
          tint: "var(--red-alert-tint)",
        },
        attention: {
          DEFAULT: "var(--yellow-attention)",
          tint: "var(--yellow-attention-tint)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "16px", fontWeight: "500" }],
        sm: ["13px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "20px" }],
        md: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "26px", fontWeight: "600" }],
        xl: ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "2xl": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "3xl": ["36px", { lineHeight: "40px", fontWeight: "700" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
    },
  },
  plugins: [],
}
