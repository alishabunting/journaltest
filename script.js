let quill;

function journalApp() {
    return {
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

        init() {
            this.loadEntries();
            this.renderEntries();
            this.updateStatistics();
            this.initQuill();
            this.initChart();
        },

        initQuill() {
            quill = new Quill('#editor', {
                theme: 'snow'
            });
        },

        initChart() {
            const ctx = document.getElementById('ratingChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                    datasets: [{
                        label: 'Number of Entries',
                        data: [0, 0, 0, 0, 0],
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

        toggleSeasonInput() {
            const seasonInput = document.querySelector('input[type="number"]');
            seasonInput.style.display = this.entryType === 'tvShow' ? 'block' : 'none';
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
                    favorite: false
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
                    <h3 class="text-xl font-semibold">${entry.title} ${entry.entryType === 'tvShow' ? `(Season ${entry.season})` : ''}</h3>
                    <p class="text-gray-600">Date: ${entry.date}</p>
                    <div class="mt-2">${entry.notes}</div>
                    <p class="mt-2">Rating: ${'★'.repeat(entry.rating)}${'☆'.repeat(5 - entry.rating)}</p>
                    <p class="mt-2">Tags: ${entry.tags.map(tag => `<span class="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2">${tag}</span>`).join('')}</p>
                    <button onclick="journalApp().toggleFavorite(${index})" class="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">${entry.favorite ? 'Remove from Favorites' : 'Add to Favorites'}</button>
                    <button onclick="journalApp().deleteEntry(${index})" class="mt-2 ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
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

            // Update chart
            const chart = Chart.getChart('ratingChart');
            chart.data.datasets[0].data = ratingCounts;
            chart.update();
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
        }
    }
}
