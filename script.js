let quill;

function app() {
    return {
        currentPage: 'dashboard',
        entries: [],
        entryType: 'movie',
        title: '',
        dateWatched: '',
        season: '',
        rating: '',
        tags: '',
        searchTerm: '',
        sortMethod: 'dateDesc',
        notificationClass: '',
        totalEntries: 0,
        averageRating: 0,
        topTags: '',
        selectedItem: null,
        username: '',
        email: '',
        watchlist: [],

        init() {
            this.loadEntries();
            this.loadProfile();
            this.loadWatchlist();
            this.renderDashboard();
            this.initQuill();
        },

        changePage(page) {
            this.currentPage = page;
            if (page === 'browseEntries') {
                this.renderEntries();
            } else if (page === 'statistics') {
                this.updateCharts();
            } else if (page === 'dashboard') {
                this.renderDashboard();
            }
        },

        initQuill() {
            quill = new Quill('#editor', {
                theme: 'snow'
            });
        },

        toggleSeasonInput() {
            const seasonInput = document.querySelector('input[type="number"]');
            seasonInput.style.display = this.entryType === 'tvShow' ? 'block' : 'none';
        },

        async searchTMDB(query) {
            if (query.length < 3) return;
            
            const type = this.entryType === 'movie' ? 'movie' : 'tv';
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&type=${type}`);
            const results = await response.json();
            
            const autocompleteResults = document.getElementById('autocompleteResults');
            autocompleteResults.innerHTML = '';
            
            results.slice(0, 5).forEach(item => {
                const div = document.createElement('div');
                div.className = 'p-2 hover:bg-gray-100 cursor-pointer';
                div.textContent = item.title || item.name;
                div.onclick = () => this.selectItem(item);
                autocompleteResults.appendChild(div);
            });
        },

        selectItem(item) {
            this.selectedItem = item;
            this.title = item.title || item.name;
            document.getElementById('titleInput').value = this.title;
            document.getElementById('autocompleteResults').innerHTML = '';
            
            const boxArt = document.getElementById('boxArt');
            if (item.poster_path) {
                boxArt.innerHTML = `<img src="https://image.tmdb.org/t/p/w200${item.poster_path}" alt="${this.title}" class="mt-2">`;
            } else {
                boxArt.innerHTML = '';
            }
        },

        addEntry() {
            if (this.title && this.dateWatched && this.rating) {
                const entry = {
                    entryType: this.entryType,
                    title: this.title,
                    date: this.dateWatched,
                    season: this.entryType === 'tvShow' ? this.season : null,
                    notes: quill.root.innerHTML,
                    rating: parseInt(this.rating),
                    tags: this.tags.split(',').map(tag => tag.trim()),
                    favorite: false,
                    tmdbId: this.selectedItem ? this.selectedItem.id : null,
                    posterPath: this.selectedItem ? this.selectedItem.poster_path : null
                };
                this.entries.push(entry);
                this.saveEntries();
                this.renderEntries();
                this.updateStatistics();
                this.showNotification('Entry added successfully!', 'success');
                this.clearInputs();
            } else {
                this.showNotification('Please fill in all required fields.', 'error');
            }
        },

        renderEntries() {
            const entriesList = document.getElementById('entriesList');
            entriesList.innerHTML = '';
            
            let filteredEntries = this.entries.filter(entry => 
                entry.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                entry.notes.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                entry.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()))
            );
            
            filteredEntries.sort((a, b) => {
                switch (this.sortMethod) {
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
                entryElement.className = 'bg-gray-50 p-4 rounded-lg animate__animated animate__fadeIn';
                entryElement.innerHTML = `
                    ${entry.posterPath ? `<img src="https://image.tmdb.org/t/p/w200${entry.posterPath}" alt="${entry.title}" class="float-right ml-4 mb-4">` : ''}
                    <h3 class="text-xl font-semibold">${entry.title} ${entry.entryType === 'tvShow' ? `(Season ${entry.season})` : ''}</h3>
                    <p class="text-gray-600">Date: ${entry.date}</p>
                    <div class="mt-2">${entry.notes}</div>
                    <p class="mt-2">Rating: ${'★'.repeat(entry.rating)}${'☆'.repeat(5 - entry.rating)}</p>
                    <p class="mt-2">Tags: ${entry.tags.map(tag => `<span class="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2">${tag}</span>`).join('')}</p>
                    <button onclick="toggleFavorite(${index})" class="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">${entry.favorite ? 'Remove from Favorites' : 'Add to Favorites'}</button>
                    <button onclick="deleteEntry(${index})" class="mt-2 ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
                `;
                entriesList.appendChild(entryElement);
            });
        },

        toggleFavorite(index) {
            this.entries[index].favorite = !this.entries[index].favorite;
            this.saveEntries();
            this.renderEntries();
            this.showNotification(this.entries[index].favorite ? 'Added to favorites!' : 'Removed from favorites!', 'success');
        },

        deleteEntry(index) {
            this.entries.splice(index, 1);
            this.saveEntries();
            this.renderEntries();
            this.updateStatistics();
            this.showNotification('Entry deleted successfully!', 'success');
        },

        updateStatistics() {
            this.totalEntries = this.entries.length;
            this.averageRating = this.entries.reduce((sum, entry) => sum + entry.rating, 0) / this.totalEntries || 0;

            const tagCounts = {};
            const ratingCounts = [0, 0, 0, 0, 0];

            this.entries.forEach(entry => {
                entry.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
                ratingCounts[entry.rating - 1]++;
            });

            this.topTags = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([tag, count]) => `${tag} (${count})`)
                .join(', ');

            // Update charts
            this.updateRatingChart(ratingCounts);
            this.updateTimelineChart();
            this.updateTypeChart();
        },

        updateRatingChart(ratingCounts) {
            const ctx = document.getElementById('ratingChart').getContext('2d');
            if (this.ratingChart) {
                this.ratingChart.destroy();
            }
            this.ratingChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                    datasets: [{
                        label: 'Number of Entries',
                        data: ratingCounts,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    }
                }
            });
        },

        updateTimelineChart() {
            const entriesByDate = this.entries.reduce((acc, entry) => {
                const date = entry.date;
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            const labels = Object.keys(entriesByDate).sort();
            const data = labels.map(date => entriesByDate[date]);

            const ctx = document.getElementById('timelineChart').getContext('2d');
            if (this.timelineChart) {
                this.timelineChart.destroy();
            }
            this.timelineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Entries Over Time',
                        data: data,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    }
                }
            });
        },

        updateTypeChart() {
            const typeCounts = this.entries.reduce((acc, entry) => {
                acc[entry.entryType] = (acc[entry.entryType] || 0) + 1;
                return acc;
            }, {});

            const ctx = document.getElementById('typeChart').getContext('2d');
            if (this.typeChart) {
                this.typeChart.destroy();
            }
            this.typeChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Movies', 'TV Shows'],
                    datasets: [{
                        data: [typeCounts.movie || 0, typeCounts.tvShow || 0],
                        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)']
                    }]
                }
            });
        },

        showNotification(message, type) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white opacity-100 transition-opacity duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
            setTimeout(() => {
                notification.className = notification.className.replace('opacity-100', 'opacity-0');
            }, 3000);
        },

        clearInputs() {
            this.title = '';
            this.dateWatched = '';
            this.season = '';
            this.rating = '';
            this.tags = '';
            quill.setContents([]);
        },

        saveEntries() {
            localStorage.setItem('entries', JSON.stringify(this.entries));
        },

        loadEntries() {
            const savedEntries = localStorage.getItem('entries');
            if (savedEntries) {
                this.entries = JSON.parse(savedEntries);
            }
        },

        saveProfile() {
            localStorage.setItem('profile', JSON.stringify({
                username: this.username,
                email: this.email
            }));
            this.showNotification('Profile saved successfully!', 'success');
        },

        loadProfile() {
            const savedProfile = localStorage.getItem('profile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                this.username = profile.username;
                this.email = profile.email;
            }
        },

        saveWatchlist() {
            localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
        },

        loadWatchlist() {
            const savedWatchlist = localStorage.getItem('watchlist');
            if (savedWatchlist) {
                this.watchlist = JSON.parse(savedWatchlist);
            }
        },

        renderDashboard() {
            this.renderRecentEntries();
            this.renderWatchlist();
        },

        renderRecentEntries() {
            const recentEntries = document.getElementById('recentEntries');
            recentEntries.innerHTML = '';
            
            const sortedEntries = this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            const recent = sortedEntries.slice(0, 5);
            
            recent.forEach(entry => {
                const li = document.createElement('li');
                li.className = 'flex items-center py-2';
                li.innerHTML = `
                    ${entry.posterPath ? `<img src="https://image.tmdb.org/t/p/w92${entry.posterPath}" alt="${entry.title}" class="w-12 h-16 mr-2">` : ''}
                    <div>
                        <p class="font-semibold">${entry.title}</p>
                        <p class="text-gray-600">${entry.date}</p>
                    </div>
                `;
                recentEntries.appendChild(li);
            });
        },

        renderWatchlist() {
            const watchlist = document.getElementById('watchlist');
            watchlist.innerHTML = '';
            
            this.watchlist.forEach(item => {
                const li = document.createElement('li');
                li.className = 'flex items-center py-2';
                li.innerHTML = `
                    ${item.posterPath ? `<img src="https://image.tmdb.org/t/p/w92${item.posterPath}" alt="${item.title}" class="w-12 h-16 mr-2">` : ''}
                    <div>
                        <p class="font-semibold">${item.title}</p>
                        <p class="text-gray-600">${item.release_date || item.first_air_date}</p>
                    </div>
                `;
                watchlist.appendChild(li);
            });
        }
    }
}

// Global function for TMDB search (used in HTML)
function searchTMDB(query) {
    return Alpine.store('app').searchTMDB(query);
}

// Global functions for entry management (used in HTML)
function toggleFavorite(index) {
    return Alpine.store('app').toggleFavorite(index);
}

function deleteEntry(index) {
    return Alpine.store('app').deleteEntry(index);
}

// Initialize Alpine.js store
document.addEventListener('alpine:init', () => {
    Alpine.store('app', app());
});

// Run init after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    Alpine.store('app').init();
});
