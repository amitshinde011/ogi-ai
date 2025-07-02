
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// All custom colors using HSL format
				sage: 'hsl(var(--sage))',
				'light-gray': 'hsl(var(--light-gray))',
				'card-gray': 'hsl(var(--card-gray))',
				'dark-text': 'hsl(var(--dark-text))',
				// Pastel color palette using HSL
				'pastel-purple': 'hsl(var(--pastel-purple))',
				'pastel-pink': 'hsl(var(--pastel-pink))',
				'pastel-blue': 'hsl(var(--pastel-blue))',
				'pastel-green': 'hsl(var(--pastel-green))',
				'pastel-yellow': 'hsl(var(--pastel-yellow))',
				'pastel-peach': 'hsl(var(--pastel-peach))',
				'pastel-lavender': 'hsl(var(--pastel-lavender))',
				'pastel-mint': 'hsl(var(--pastel-mint))',
			},
			backgroundImage: {
				'gradient-sage': 'linear-gradient(135deg, hsl(160, 65%, 55%) 0%, hsl(180, 100%, 85%) 100%)',
				'gradient-joyful': 'linear-gradient(135deg, hsl(320, 85%, 60%) 0%, hsl(60, 100%, 70%) 50%, hsl(180, 100%, 85%) 100%)',
				'gradient-peaceful': 'linear-gradient(135deg, hsl(45, 100%, 96%) 0%, hsl(195, 85%, 75%) 50%, hsl(270, 85%, 75%) 100%)',
				'gradient-vibrant': 'linear-gradient(135deg, hsl(351, 100%, 80%) 0%, hsl(60, 100%, 85%) 50%, hsl(142, 76%, 55%) 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'pastel-float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'pastel-float': 'pastel-float 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
