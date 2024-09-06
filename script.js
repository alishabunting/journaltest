let quill;

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

            sortedEntries.forEach(entry => {
                const entryElement = document.createElement('div');
                entryElement.className = 'bg-white p-4 rounded-lg shadow';
                entryElement.innerHTML = `
                    <h3 class="text-xl font-semibold">${entry.title}</h3>
                    <p>Date: ${entry.dateWatched}</p>
                    <p>Rating: ${entry.rating}/5</p>
                    <p>Tags: ${entry.tags}</p>
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
            // Implement rating chart update logic
        },

        updateTimelineChart() {
            // Implement timeline chart update logic
        },

        updateTypeChart() {
            // Implement type chart update logic
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

            const apiKey = 'YOUR_TMDB_API_KEY'; // Replace with your actual TMDB API key
            const url = `https://api.themoviedb.org/3/search/${this.entryType === 'movie' ? 'movie' : 'tv'}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.tmdbResults = data.results.slice(0, 5); // Limit to 5 results
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

        // Add any other methods you need here
    });
});

// If you have any code outside of the Alpine.js store, add it here
