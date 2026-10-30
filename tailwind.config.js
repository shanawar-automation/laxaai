module.exports = {
	darkMode: "class",
	content: ["./index.html","./js/script.js"],
	theme: {
		extend: {
			colors: {
				laxa: {
					black: "#030305",
					dark: "#08080C",
					card: "rgba(15, 15, 22, 0.75)",
					cardHover: "rgba(25, 20, 30, 0.85)",
					red: "#FF2A4D",
					redBright: "#FF0033",
					redDark: "#80001A",
					redGlow: "rgba(255, 42, 77, 0.35)",
					textMuted: "#94A3B8",
				},
			},
			fontFamily: {
				sans: ["Plus Jakarta Sans", "sans-serif"],
				heading: ["Space Grotesk", "sans-serif"],
				mono: ["JetBrains Mono", "monospace"],
			},
			animation: {
				"pulse-glow": "pulseGlow 3s ease-in-out infinite",
				"orbit-spin": "spin 20s linear infinite",
				float: "float 6s ease-in-out infinite",
				radar: "radar 4s linear infinite",
			},
			keyframes: {
				pulseGlow: {
					"0%, 100%": {
						opacity: "0.4",
						filter: "drop-shadow(0 0 15px rgba(255, 42, 77, 0.5))",
					},
					"50%": {
						opacity: "0.9",
						filter: "drop-shadow(0 0 35px rgba(255, 0, 51, 0.9))",
					},
				},
				float: {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-10px)" },
				},
			},
		},
	},
};
