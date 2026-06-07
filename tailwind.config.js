/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        carbon: "#000000",
        ink: "#000000",
        panel: "rgba(0, 0, 0, 0.75)",
        cyanGlow: "#86d9e8",
        violetGlow: "#8ea0b8",
        roseGlow: "#d46a58",
        mintGlow: "#8fc7a4",
        amberGlow: "#d99a45",
      },
      boxShadow: {
        glow: "0 0 28px rgba(34, 211, 238, 0.24)",
        violet: "0 0 36px rgba(167, 139, 250, 0.24)",
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at 14% 18%, rgba(134,217,232,0.045), transparent 28%), radial-gradient(circle at 86% 8%, rgba(217,154,69,0.045), transparent 26%), linear-gradient(135deg, #000000 0%, #000000 100%)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-20%)" },
          "100%": { transform: "translateY(420%)" },
        },
      },
      animation: {
        scan: "scan 3s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
