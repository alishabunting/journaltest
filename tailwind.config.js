/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './*.js'],
  theme: {
    extend: {
      colors: {
        'primary': '#FF6B6B',
        'secondary': '#4ECDC4',
        'accent': '#45B7D1',
        'background': '#F7F7F7',
        'text': '#2C3E50',
      },
      fontFamily: {
        'sans': ['Inter var', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
        'handwritten': ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

