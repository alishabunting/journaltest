const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

let genres = {};

async function fetchGenres() {
  const apiKey = process.env.TMDB_API_KEY;
  const movieGenresUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`;
  const tvGenresUrl = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}`;

  try {
    const movieResponse = await fetch(movieGenresUrl);
    const tvResponse = await fetch(tvGenresUrl);

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error(`HTTP error! status: ${movieResponse.status} ${tvResponse.status}`);
    }

    const movieData = await movieResponse.json();
    const tvData = await tvResponse.json();

    genres = {
      movie: movieData.genres,
      tv: tvData.genres
    };
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
}

fetchGenres();

app.get('/api/search', async (req, res) => {
  const { query, type } = req.query;
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data.results);
  } catch (error) {
    console.error('Error fetching TMDB data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
