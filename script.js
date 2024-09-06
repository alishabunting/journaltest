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

        // Add all your other methods here
        loadEntries() {
            // Implementation
        },

        loadProfile() {
            // Implementation
        },

        loadWatchlist() {
            // Implementation
        },

        renderDashboard() {
            // Implementation
        },

        initQuill() {
            // Implementation
        },

        updateCharts() {
            // Implementation
        },

        // ... (all other methods)
    });
});

// If you have any code outside of the Alpine.js store, add it here
