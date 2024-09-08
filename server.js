import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(movieGenresUrl),
      fetch(tvGenresUrl)
    ]);

    const movieGenres = await movieResponse.json();
    const tvGenres = await tvResponse.json();

    genres = {
      movie: movieGenres.genres.reduce((acc, genre) => {
        acc[genre.id] = genre.name;
        return acc;
      }, {}),
      tv: tvGenres.genres.reduce((acc, genre) => {
        acc[genre.id] = genre.name;
        return acc;
      }, {})
    };

    console.log('Genres fetched successfully');
  } catch (error) {
    console.error('Error fetching genres:', error);
  }
}

fetchGenres();

app.get('/api/search', async (req, res) => {
  const apiKey = process.env.TMDB_API_KEY;
  const { query, type } = req.query;
  const url = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const results = data.results.map(item => ({
      ...item,
      genre_names: item.genre_ids.map(id => genres[type][id]).filter(Boolean)
    }));
    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
