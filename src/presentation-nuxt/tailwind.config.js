/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{vue,js,ts,jsx,tsx}",
        "./nuxt.config.{js,ts}",
    ],
    theme: {
        extend: {
            colors: {
                // Flexoki color system with olive green
                'flexoki-bg': '#EDEECF',
                'flexoki-primary': '#66800b',
                'flexoki-warning': '#e67e22',
                'flexoki-black': '#111811',
                'flexoki-paper': '#ffffff',
                'flexoki-50': '#f0f4f0',
                'flexoki-100': '#e2e8e2',
                'flexoki-150': '#d4dcd4',
                'flexoki-200': '#dbe6db',
                'flexoki-300': '#a8b8a8',
                'flexoki-400': '#8aa08a',
                'flexoki-500': '#6c886c',
                'flexoki-600': '#546a54',
                'flexoki-700': '#3c4c3c',
                'flexoki-800': '#111811',
                'flexoki-850': '#182818',
                'flexoki-900': '#111811',
                'flexoki-950': '#102210',
                'flexoki-muted': '#6c886c',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
    darkMode: 'class', // Managed by class, not media query
}
