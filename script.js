let quill;

function appData() {
    return {
        gsap: window.gsap,
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
        notificationMessage: '',
        totalEntries: 0,
        averageRating: 0,
        topTags: '',
        selectedItem: null,
        username: '',
        email: '',
        watchlist: [],
        ratingChart: null,
        timelineChart: null,
        typeChart: null,
        tmdbResults: [],
        selectedTMDBItem: null,
        addEntryStep: 1,

        init() {
            this.loadEntries();
            this.loadProfile();
            this.loadWatchlist();
            this.renderDashboard();
            this.initQuill();
            this.initTagCloud();
            this.updateAverageRatingChart();
        },

        changePage(page) {
            this.animatePageTransition(this.currentPage, page);
            this.currentPage = page;

            if (page === 'browseEntries') {
                this.renderEntries();
            } else if (page === 'statistics') {
                setTimeout(() => {
                    this.updateCharts();
                }, 300);
            } else if (page === 'dashboard') {
                this.renderDashboard();
            }
        },

        animatePageTransition(from, to) {
            const fromElement = document.querySelector(`.page-${from}`);
            const toElement = document.querySelector(`.page-${to}`);

            gsap.to(fromElement, {
                opacity: 0,
                x: -50,
                duration: 0.3,
                onComplete: () => {
                    fromElement.style.display = 'none';
                    toElement.style.display = 'block';
                    gsap.fromTo(toElement,
                        { opacity: 0, x: 50 },
                        { opacity: 1, x: 0, duration: 0.3 }
                    );
                }
            });
        },

        showNotification(message, type) {
            this.notificationClass = `fixed top-4 right-4 p-4 rounded-lg text-white opacity-100 transition-opacity duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
            this.notificationMessage = message;
            setTimeout(() => {
                this.notificationClass = '';
                this.notificationMessage = '';
            }, 3000);
        },

        loadEntries() {
            // Load entries from localStorage or API
            const storedEntries = localStorage.getItem('entries');
            if (storedEntries) {
                this.entries = JSON.parse(storedEntries);
                this.totalEntries = this.entries.length;
                this.calculateAverageRating();
            }
        },

        renderEntries() {
            const entriesList = document.getElementById('entriesList');
            entriesList.innerHTML = '';
            
            const filteredEntries = this.entries.filter(entry =>
                entry.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                entry.tags.toLowerCase().includes(this.searchTerm.toLowerCase())
            );

            const sortedEntries = this.sortEntries(filteredEntries);

            sortedEntries.forEach((entry, index) => {
                const entryElement = document.createElement('div');
                entryElement.className = 'bg-white p-4 rounded-lg shadow mb-4 cursor-pointer';
                entryElement.innerHTML = `
                    <div class="flex items-center">
                        <img src="https://image.tmdb.org/t/p/w92${entry.poster_path}" alt="${entry.title} Poster" class="w-16 h-24 object-cover mr-4">
                        <div>
                            <h3 class="text-xl font-semibold">${entry.title}</h3>
                            <p>Type: ${entry.type}</p>
                            <p>Date: ${entry.dateWatched}</p>
                            <p>Rating: ${entry.rating}/5</p>
                            <p>Tags: ${entry.tags}</p>
                        </div>
                    </div>
                `;
                entryElement.addEventListener('click', () => this.viewFullEntry(entry));
                entriesList.appendChild(entryElement);
            });
        },

        viewFullEntry(entry) {
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
            overlay.innerHTML = `
                <div class="bg-white p-6 rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
                    <h3 class="text-2xl mb-4">${entry.title}</h3>
                    <img src="https://image.tmdb.org/t/p/w300${entry.poster_path}" alt="${entry.title} Poster" class="float-right ml-4 mb-4">
                    <p><strong>Type:</strong> ${entry.type}</p>
                    <p><strong>Date Watched:</strong> ${entry.dateWatched}</p>
                    <p><strong>Rating:</strong> ${entry.rating}/5</p>
                    <p><strong>Tags:</strong> ${entry.tags}</p>
                    <div class="mt-4"><strong>Notes:</strong></div>
                    <div>${entry.notes}</div>
                    <button class="apple-button mt-4" onclick="this.closest('.fixed').remove()">Close</button>
                </div>
            `;
            document.body.appendChild(overlay);
        },

        sortEntries(entries) {
            return entries.sort((a, b) => {
                switch (this.sortMethod) {
                    case 'dateDesc':
                        return new Date(b.dateWatched) - new Date(a.dateWatched);
                    case 'dateAsc':
                        return new Date(a.dateWatched) - new Date(b.dateWatched);
                    case 'ratingDesc':
                        return b.rating - a.rating;
                    case 'ratingAsc':
                        return a.rating - b.rating;
                    case 'titleAsc':
                        return a.title.localeCompare(b.title);
                    case 'titleDesc':
                        return b.title.localeCompare(a.title);
                    default:
                        return 0;
                }
            });
        },

        loadProfile() {
            // Load profile from localStorage or API
            const storedProfile = localStorage.getItem('profile');
            if (storedProfile) {
                const profile = JSON.parse(storedProfile);
                this.username = profile.username;
                this.email = profile.email;
            }
        },

        loadWatchlist() {
            // Load watchlist from localStorage or API
            const storedWatchlist = localStorage.getItem('watchlist');
            if (storedWatchlist) {
                this.watchlist = JSON.parse(storedWatchlist);
            }
        },

        renderDashboard() {
            // Implement dashboard rendering logic
        },

        initQuill() {
            if (!quill) {
                quill = new Quill('#editor', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline'],
                            ['image', 'code-block']
                        ]
                    }
                });
            }
        },

        updateCharts() {
            this.updateRatingChart();
            this.updateTimelineChart();
            this.updateTypeChart();
        },

        updateRatingChart() {
            const ctx = document.getElementById('ratingChart').getContext('2d');
            const ratingCounts = [0, 0, 0, 0, 0];
            this.entries.forEach(entry => {
                ratingCounts[Math.floor(entry.rating) - 1]++;
            });
            this.ratingChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['1', '2', '3', '4', '5'],
                    datasets: [{
                        label: 'Ratings',
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
            const ctx = document.getElementById('timelineChart').getContext('2d');
            const entriesByMonth = {};
            this.entries.forEach(entry => {
                const date = new Date(entry.dateWatched);
                const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                entriesByMonth[monthYear] = (entriesByMonth[monthYear] || 0) + 1;
            });
            const sortedMonths = Object.keys(entriesByMonth).sort();
            this.timelineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sortedMonths,
                    datasets: [{
                        label: 'Entries per Month',
                        data: sortedMonths.map(month => entriesByMonth[month]),
                        borderColor: 'rgba(255, 99, 132, 1)',
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
            const ctx = document.getElementById('typeChart').getContext('2d');
            const typeCounts = {
                movie: 0,
                tvShow: 0
            };
            this.entries.forEach(entry => {
                typeCounts[entry.type]++;
            });
            this.typeChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Movies', 'TV Shows'],
                    datasets: [{
                        data: [typeCounts.movie, typeCounts.tvShow],
                        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)']
                    }]
                }
            });
        },

        calculateAverageRating() {
            if (this.entries.length > 0) {
                const sum = this.entries.reduce((acc, entry) => acc + parseFloat(entry.rating), 0);
                this.averageRating = sum / this.entries.length;
            } else {
                this.averageRating = 0;
            }
        },

        searchTMDB(query, resultsDiv = null) {
            if (query.length < 3) {
                this.tmdbResults = [];
                if (resultsDiv) resultsDiv.innerHTML = '';
                return;
            }

            const url = `/api/search?query=${encodeURIComponent(query)}&type=${this.entryType === 'movie' ? 'movie' : 'tv'}`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.tmdbResults = data.slice(0, 5); // Limit to 5 results
                    
                    if (resultsDiv) {
                        resultsDiv.innerHTML = this.tmdbResults.map(item => `
                            <div class="p-2 hover:bg-gray-100 cursor-pointer flex items-center" onclick="selectTMDBItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                <img src="https://image.tmdb.org/t/p/w92${item.poster_path}" alt="${item.title || item.name} Poster" class="w-12 h-18 object-cover mr-2">
                                <span>${item.title || item.name}</span>
                            </div>
                        `).join('');
                    } else {
                        this.renderTMDBResults();
                    }
                })
                .catch(error => {
                    console.error('Error fetching TMDB data:', error);
                    this.showNotification('Error fetching movie/TV show data', 'error');
                });
        },

        renderTMDBResults() {
            const resultsContainer = document.getElementById('autocompleteResults');
            resultsContainer.innerHTML = this.tmdbResults.map(item => `
                <div class="p-2 hover:bg-gray-100 cursor-pointer flex items-center" @click="selectTMDBItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    <img src="https://image.tmdb.org/t/p/w92${item.poster_path}" alt="${item.title || item.name} Poster" class="w-12 h-18 object-cover mr-2">
                    <span>${item.title || item.name}</span>
                </div>
            `).join('');
        },

        selectTMDBItem(item) {
            this.selectedTMDBItem = item;
            this.title = item.title || item.name;
            this.tags = item.genre_ids.join(',');  // Store genre IDs as tags
            document.getElementById('titleInput').value = this.title;
            document.getElementById('autocompleteResults').innerHTML = '';
            this.renderBoxArt();
        },

        renderBoxArt() {
            const boxArtContainer = document.getElementById('boxArt');
            if (this.selectedTMDBItem && this.selectedTMDBItem.poster_path) {
                const imgUrl = `https://image.tmdb.org/t/p/w300${this.selectedTMDBItem.poster_path}`;
                boxArtContainer.innerHTML = `<img src="${imgUrl}" alt="${this.title} Poster" class="w-full h-auto rounded-lg shadow-lg">`;
            } else {
                boxArtContainer.innerHTML = '';
            }
        },

        addEntry() {
            const newEntry = {
                type: this.entryType,
                title: this.title,
                dateWatched: this.dateWatched,
                season: this.season,
                rating: this.rating,
                tags: this.tags || '',
                notes: quill.root.innerHTML,
                poster_path: this.selectedTMDBItem ? this.selectedTMDBItem.poster_path : null
            };
            this.entries.push(newEntry);
            this.saveEntries();
            this.resetForm();
            this.showNotification('Entry added successfully', 'success');
            this.changePage('dashboard');
        },

        saveEntries() {
            localStorage.setItem('entries', JSON.stringify(this.entries));
            this.calculateStats();
        },

        calculateStats() {
            this.totalEntries = this.entries.length;
            this.calculateAverageRating();
            this.calculateTopTags();
        },

        calculateTopTags() {
            const tagCounts = {};
            this.entries.forEach(entry => {
                if (typeof entry.tags === 'string') {
                    entry.tags.split(',').forEach(tag => {
                        tag = tag.trim();
                        if (tag) {
                            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                        }
                    });
                }
            });
            this.topTags = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([tag, count]) => `${tag} (${count})`)
                .join(', ');
        },

        resetForm() {
            this.entryType = 'movie';
            this.title = '';
            this.dateWatched = '';
            this.season = '';
            this.rating = '';
            this.tags = '';
            quill.root.innerHTML = '';
            this.selectedTMDBItem = null;
            this.addEntryStep = 1;  // Reset to step 1
        },

        editEntry(index) {
            this.selectedItem = this.entries[index];
            this.entryType = this.selectedItem.type;
            this.title = this.selectedItem.title;
            this.dateWatched = this.selectedItem.dateWatched;
            this.season = this.selectedItem.season;
            this.rating = this.selectedItem.rating;
            this.tags = this.selectedItem.tags;
            quill.root.innerHTML = this.selectedItem.notes;
            this.changePage('addEntry');
        },

        deleteEntry(index) {
            this.entries.splice(index, 1);
            this.saveEntries();
            this.showNotification('Entry deleted successfully', 'success');
            this.renderEntries();
        },

        saveProfile() {
            const profile = {
                username: this.username,
                email: this.email
            };
            localStorage.setItem('profile', JSON.stringify(profile));
            this.showNotification('Profile saved successfully', 'success');
        },

        initTagCloud() {
            const tagCloud = document.getElementById('tagCloud');
            const tags = this.topTags.split(', ');
            tagCloud.innerHTML = tags.map(tag => `<span class="bg-moleskine-light-gray text-moleskine-black px-2 py-1 rounded">${tag}</span>`).join('');
        },

        updateAverageRatingChart() {
            const path = this.$refs.avgRatingPath;
            const normalizedRating = (this.averageRating / 5) * 100;
            path.style.strokeDasharray = `${normalizedRating}, 100`;
        },

        renderRecentEntries() {
            const recentEntries = document.getElementById('recentEntries');
            const recentEntriesHtml = this.entries.slice(0, 5).map((entry, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}" data-entry-index="${index}">
                    <img src="https://image.tmdb.org/t/p/w300${entry.poster_path}" alt="${entry.title} Poster" class="w-full h-auto">
                    <p class="mt-2 text-center">${entry.title}</p>
                </div>
            `).join('');
            recentEntries.innerHTML = recentEntriesHtml;

            // Add click event to view full entry
            recentEntries.querySelectorAll('.carousel-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.entryIndex);
                    this.viewFullEntry(this.entries[index]);
                });
            });

            // Initialize carousel
            new Carousel(recentEntries, {
                interval: 5000,
                wrap: true,
                touch: true
            });
        },

        addToWatchlist() {
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
            overlay.innerHTML = `
                <div class="bg-white p-6 rounded-lg">
                    <h3 class="text-2xl mb-4">Add to Watchlist</h3>
                    <input type="text" id="watchlistSearch" placeholder="Search for a movie or TV show" class="material-input mb-4 w-full">
                    <div id="watchlistResults" class="mb-4"></div>
                    <textarea id="watchlistNotes" placeholder="Add notes" class="material-input mb-4 w-full"></textarea>
                    <button id="addWatchlistItem" class="apple-button">Add to Watchlist</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const searchInput = document.getElementById('watchlistSearch');
            const resultsDiv = document.getElementById('watchlistResults');
            const addButton = document.getElementById('addWatchlistItem');

            searchInput.addEventListener('input', () => this.searchTMDB(searchInput.value, resultsDiv));
            addButton.addEventListener('click', () => {
                const notes = document.getElementById('watchlistNotes').value;
                if (this.selectedTMDBItem) {
                    this.watchlist.push({
                        ...this.selectedTMDBItem,
                        notes: notes
                    });
                    this.saveWatchlist();
                    this.renderWatchlist();
                    document.body.removeChild(overlay);
                }
            });
        },

        saveWatchlist() {
            localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
        },

        renderWatchlist() {
            const watchlistContainer = document.getElementById('watchlist');
            watchlistContainer.innerHTML = this.watchlist.map(item => `
                <div class="flex items-center mb-2">
                    <img src="https://image.tmdb.org/t/p/w92${item.poster_path}" alt="${item.title || item.name} Poster" class="w-12 h-18 object-cover mr-2">
                    <span>${item.title || item.name}</span>
                </div>
            `).join('');
        },

        renderStatistics() {
            const allTags = this.entries.flatMap(entry => entry.genre_names);
            const tagCounts = allTags.reduce((acc, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {});

            const sortedTags = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            const topTagsHtml = sortedTags.map(([tag, count]) => `
                <div class="flex justify-between items-center mb-2">
                    <span>${tag}</span>
                    <span class="bg-moleskine-red text-white px-2 py-1 rounded">${count}</span>
                </div>
            `).join('');

            document.getElementById('topTags').innerHTML = topTagsHtml;

            // Render average rating chart
            this.updateAverageRatingChart();

            // Render entries by type chart
            const typeData = this.entries.reduce((acc, entry) => {
                acc[entry.type] = (acc[entry.type] || 0) + 1;
                return acc;
            }, {});

            const typeChartCtx = document.getElementById('typeChart').getContext('2d');
            new Chart(typeChartCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(typeData),
                    datasets: [{
                        data: Object.values(typeData),
                        backgroundColor: ['#A61C1C', '#4A4238']
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Entries by Type'
                    }
                }
            });

            // Render entries over time chart
            const timeData = this.entries.reduce((acc, entry) => {
                const date = new Date(entry.dateWatched);
                const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});

            const timeChartCtx = document.getElementById('timeChart').getContext('2d');
            new Chart(timeChartCtx, {
                type: 'line',
                data: {
                    labels: Object.keys(timeData),
                    datasets: [{
                        label: 'Entries',
                        data: Object.values(timeData),
                        borderColor: '#A61C1C',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Entries Over Time'
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1
                            }
                        }]
                    }
                }
            });
        }

        // Add any other methods you need here
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // Any DOM-related initialization can go here
});

// If you have any code outside of the appData function, keep it here
