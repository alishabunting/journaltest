let quill;

document.addEventListener('DOMContentLoaded', () => {
    initQuill(); // Initialize Quill when the DOM is fully loaded
});

function initQuill() {
    if (!quill) { // Check if quill is already initialized
        quill = new Quill('#editor', {
            theme: 'snow'
        });
    }
}

document.addEventListener('alpine:init', () => {
    Alpine.store('app', {
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

        init() {
            this.loadEntries();
            this.loadProfile();
            this.loadWatchlist();
            this.renderDashboard();
            this.initQuill();
        },

        changePage(page) {
            const currentPageElement = document.querySelector(`.page-${this.currentPage}`);
            const newPageElement = document.querySelector(`.page-${page}`);

            if (currentPageElement && newPageElement) {
                this.gsap.to(currentPageElement, { 
                    opacity: 0, 
                    duration: 0.3, 
                    onComplete: () => {
                        this.currentPage = page;
                        this.gsap.fromTo(newPageElement, 
                            { opacity: 0 }, 
                            { opacity: 1, duration: 0.3 }
                        );
                        
                        if (page === 'browseEntries') {
                            this.renderEntries();
                        } else if (page === 'statistics') {
                            setTimeout(() => {
                                this.updateCharts();
                            }, 0);
                        } else if (page === 'dashboard') {
                            this.renderDashboard();
                        }
                    }
                });
            } else {
                console.error(`Page elements not found for ${this.currentPage} or ${page}`);
            }
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
                entryElement.className = 'bg-white p-4 rounded-lg shadow mb-4';
                entryElement.innerHTML = `
                    <h3 class="text-xl font-semibold">${entry.title}</h3>
                    <p>Type: ${entry.type}</p>
                    <p>Date: ${entry.dateWatched}</p>
                    <p>Rating: ${entry.rating}/5</p>
                    <p>Tags: ${entry.tags}</p>
                    <button @click="$store.app.editEntry(${index})" class="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                    <button @click="$store.app.deleteEntry(${index})" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                `;
                entriesList.appendChild(entryElement);
            });
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
            // Initialize Quill editor
            quill = new Quill('#editor', {
                theme: 'snow'
            });
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

        searchTMDB(query) {
            if (query.length < 3) {
                this.tmdbResults = [];
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
                    this.renderTMDBResults();
                })
                .catch(error => {
                    console.error('Error fetching TMDB data:', error);
                    this.showNotification('Error fetching movie/TV show data', 'error');
                });
        },

        renderTMDBResults() {
            const resultsContainer = document.getElementById('autocompleteResults');
            resultsContainer.innerHTML = '';

            this.tmdbResults.forEach(item => {
                const resultElement = document.createElement('div');
                resultElement.className = 'p-2 hover:bg-gray-100 cursor-pointer';
                resultElement.textContent = item.title || item.name;
                resultElement.addEventListener('click', () => this.selectTMDBItem(item));
                resultsContainer.appendChild(resultElement);
            });
        },

        selectTMDBItem(item) {
            this.selectedTMDBItem = item;
            this.title = item.title || item.name;
            document.getElementById('titleInput').value = this.title;
            document.getElementById('autocompleteResults').innerHTML = '';
            this.renderBoxArt();
        },

        renderBoxArt() {
            const boxArtContainer = document.getElementById('boxArt');
            if (this.selectedTMDBItem && this.selectedTMDBItem.poster_path) {
                const imgUrl = `https://image.tmdb.org/t/p/w200${this.selectedTMDBItem.poster_path}`;
                boxArtContainer.innerHTML = `<img src="${imgUrl}" alt="${this.title} Poster" class="w-32 h-auto">`;
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
                notes: quill.root.innerHTML
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
            this.selectedItem = null;
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

        // Add any other methods you need here
    });
});

// If you have any code outside of the Alpine.js store, add it here
