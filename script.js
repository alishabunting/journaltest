let entries = [];
let watchlist = [];

function addEntry() {
    const entryType = document.getElementById('entryType').value;
    const title = document.getElementById('titleInput').value;
    const date = document.getElementById('dateWatched').value;
    const notes = document.getElementById('notesInput').value;
    const rating = document.getElementById('ratingInput').value;
    const tags = document.getElementById('tagsInput').value.split(',').map(tag => tag.trim());
    const season = entryType === 'tvShow' ? document.getElementById('seasonInput').value : null;

    if (title && date && rating) {
        const entry = { entryType, title, date, notes, rating, tags, season, favorite: false };
        entries.push(entry);
        saveData('entries', JSON.stringify(entries));
        renderEntries();
        updateStatistics();
        showNotification('Entry added successfully!');
        clearInputs();
    } else {
        showNotification('Please fill in all required fields.', 'error');
    }
}

function renderEntries() {
    const entriesList = document.getElementById('entriesList');
    entriesList.innerHTML = '';
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortMethod = document.getElementById('sortSelect').value;
    
    let filteredEntries = entries.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm) ||
        entry.notes.toLowerCase().includes(searchTerm) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    filteredEntries.sort((a, b) => {
        switch (sortMethod) {
            case 'dateDesc':
                return new Date(b.date) - new Date(a.date);
            case 'dateAsc':
                return new Date(a.date) - new Date(b.date);
            case 'ratingDesc':
                return b.rating - a.rating;
            case 'ratingAsc':
                return a.rating - b.rating;
            case 'titleAsc':
                return a.title.localeCompare(b.title);
            case 'titleDesc':
                return b.title.localeCompare(a.title);
        }
    });
    
    filteredEntries.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'entry';
        entryElement.innerHTML = `
            <h3>${entry.title} ${entry.entryType === 'tvShow' ? `(Season ${entry.season})` : ''}</h3>
            <p>Type: ${entry.entryType}</p>
            <p>Date: ${entry.date}</p>
            <p>Notes: ${entry.notes}</p>
            <p class="rating">Rating: ${'★'.repeat(entry.rating)}${'☆'.repeat(5 - entry.rating)}</p>
            <p>Tags: ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</p>
            <button onclick="toggleFavorite(${index})">${entry.favorite ? 'Remove from Favorites' : 'Add to Favorites'}</button>
            <button onclick="deleteEntry(${index})">Delete</button>
        `;
        entriesList.appendChild(entryElement);
    });
}

function toggleFavorite(index) {
    entries[index].favorite = !entries[index].favorite;
    saveData('entries', JSON.stringify(entries));
    renderEntries();
    renderFavorites();
    showNotification(entries[index].favorite ? 'Added to favorites!' : 'Removed from favorites!');
}

function renderFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';
    const favorites = entries.filter(entry => entry.favorite);
    favorites.forEach(entry => {
        const favoriteElement = document.createElement('div');
        favoriteElement.className = 'favorite-entry';
        favoriteElement.innerHTML = `
            <h3>${entry.title} ${entry.entryType === 'tvShow' ? `(Season ${entry.season})` : ''}</h3>
            <p>Type: ${entry.entryType}</p>
            <p class="rating">Rating: ${'★'.repeat(entry.rating)}${'☆'.repeat(5 - entry.rating)}</p>
        `;
        favoritesList.appendChild(favoriteElement);
    });
}

function updateStatistics() {
    const totalEntries = entries.length;
    const averageRating = entries.reduce((sum, entry) => sum + Number(entry.rating), 0) / totalEntries || 0;

    document.getElementById('totalEntries').textContent = totalEntries;
    document.getElementById('averageRating').textContent = averageRating.toFixed(1);

    // Calculate top tags
    const tagCounts = {};
    entries.forEach(entry => {
        entry.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    const topTags = getTopItems(tagCounts, 5);
    document.getElementById('topTags').textContent = topTags;

    // Calculate top TV shows
    const tvShowCounts = {};
    entries.filter(entry => entry.entryType === 'tvShow').forEach(entry => {
        tvShowCounts[entry.title] = (tvShowCounts[entry.title] || 0) + 1;
    });
    const topTVShows = getTopItems(tvShowCounts, 5);
    document.getElementById('topTVShows').textContent = topTVShows;

    // Calculate top genres (using tags as genres for now)
    const topGenres = getTopItems(tagCounts, 5);
    document.getElementById('topGenres').textContent = topGenres;
}

function getTopItems(counts, limit) {
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([item, count]) => `${item} (${count})`)
        .join(', ');
}

function deleteEntry(index) {
    entries.splice(index, 1);
    saveData('entries', JSON.stringify(entries));
    renderEntries();
    updateStatistics();
    showNotification('Entry deleted successfully!');
}

function addToWatchlist() {
    const watchlistInput = document.getElementById('watchlistInput');
    if (watchlistInput.value) {
        watchlist.push(watchlistInput.value);
        saveData('watchlist', JSON.stringify(watchlist));
        renderWatchlist();
        watchlistInput.value = '';
        showNotification('Added to watchlist!');
    }
}

function renderWatchlist() {
    const watchlistItems = document.getElementById('watchlistItems');
    watchlistItems.innerHTML = '';
    watchlist.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item;
        li.innerHTML += ` <button onclick="removeFromWatchlist(${index})">Remove</button>`;
        watchlistItems.appendChild(li);
    });
}

function removeFromWatchlist(index) {
    watchlist.splice(index, 1);
    saveData('watchlist', JSON.stringify(watchlist));
    renderWatchlist();
    showNotification('Removed from watchlist!');
}

function clearInputs() {
    document.getElementById('titleInput').value = '';
    document.getElementById('dateWatched').value = '';
    document.getElementById('seasonInput').value = '';
    document.getElementById('notesInput').value = '';
    document.getElementById('ratingInput').value = '';
    document.getElementById('tagsInput').value = '';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function saveData(key, value) {
    localStorage.setItem(key, value);
}

function loadData(key) {
    return localStorage.getItem(key);
}

document.getElementById('entryType').addEventListener('change', function() {
    const seasonInput = document.getElementById('seasonInput');
    seasonInput.style.display = this.value === 'tvShow' ? 'block' : 'none';
});

window.onload = function() {
    const savedEntries = loadData('entries');
    if (savedEntries) {
        entries = JSON.parse(savedEntries);
        renderEntries();
    }

    const savedWatchlist = loadData('watchlist');
    if (savedWatchlist) {
        watchlist = JSON.parse(savedWatchlist);
        renderWatchlist();
    }

    updateStatistics();
    renderFavorites();

    document.getElementById('searchInput').addEventListener('input', renderEntries);
    document.getElementById('sortSelect').addEventListener('change', renderEntries);
};
