/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './*.js'],
  theme: {
    extend: {
      colors: {
        'moleskine-black': '#2C2C2C',
        'moleskine-cream': '#F4F1E9',
        'moleskine-red': '#D92121',
        'moleskine-gray': '#8C8C8C',
        'moleskine-brown': '#4A4238',
      },
      fontFamily: {
        'sans': ['Lato', 'sans-serif'],
        'serif': ['Crimson Text', 'serif'],
        'handwritten': ['Caveat', 'cursive'],
      },
      boxShadow: {
        'moleskine': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

