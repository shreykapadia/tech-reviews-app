/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // Look for Tailwind classes in your main HTML file
    "./js/**/*.js", // Look for Tailwind classes in any JS file in the js directory and its subdirectories
    // Add other template files if you have them, e.g., "./src/**/*.{html,js,jsx,ts,tsx,vue}"
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0052cc', // Example: A specific blue
        'brand-secondary': '#ff7f50', // Example: Coral orange
        'brand-text': '#333333',     // Example: Dark gray for text
        'brand-light-gray': '#f0f2f5', // Example: A light background gray
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        serif: ['Lora', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      // You can also extend other theme aspects here, like:
      // spacing: {
      //   '128': '32rem',
      // },
      // borderRadius: {
      //   '4xl': '2rem',
      // }
    },
  },
  plugins: [],
}