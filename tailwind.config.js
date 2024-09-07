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
        'material': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'material-hover': '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
      },
      borderRadius: {
        'apple': '1rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

