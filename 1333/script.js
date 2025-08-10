
        // Sample restaurant data
        const restaurants = [
            [1, 4, 1, 40, 10],
            [2, 8, 0, 50, 5],
            [3, 8, 1, 30, 4],
            [4, 10, 0, 10, 3],
            [5, 1, 1, 15, 1],
            [6, 7, 1, 25, 8],
            [7, 9, 0, 45, 2],
            [8, 5, 1, 20, 6],
            [9, 6, 0, 35, 9],
            [10, 3, 1, 15, 12],
            [11, 8, 1, 28, 7],
            [12, 7, 0, 42, 4]
        ];
        
        // Additional restaurant info for UI
        const restaurantInfo = {
            1: { name: "Green Leaf Cafe", tags: ["Salads", "Organic", "Gluten-Free"], image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            2: { name: "Burger Palace", tags: ["Burgers", "American", "Fast Food"], image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            3: { name: "Vegan Heaven", tags: ["Vegan", "Organic", "Healthy"], image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            4: { name: "Pasta Paradise", tags: ["Italian", "Pasta", "Romantic"], image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            5: { name: "Sushi World", tags: ["Japanese", "Sushi", "Asian"], image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            6: { name: "Taco Fiesta", tags: ["Mexican", "Tacos", "Spicy"], image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            7: { name: "Steak House", tags: ["Steak", "BBQ", "American"], image: "https://images.unsplash.com/photo-1432139509613-5c4255815697?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            8: { name: "Curry Palace", tags: ["Indian", "Spicy", "Vegetarian"], image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            9: { name: "Pizza Planet", tags: ["Pizza", "Italian", "Family"], image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            10: { name: "Noodle Bar", tags: ["Asian", "Noodles", "Quick"], image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            11: { name: "Raw Vegan", tags: ["Vegan", "Raw", "Healthy"], image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
            12: { name: "Burrito Bros", tags: ["Mexican", "Burritos", "Fast Food"], image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }
        };
        
        // DOM elements
        const veganFilter = document.getElementById('veganFilter');
        const priceRange = document.getElementById('priceRange');
        const priceValue = document.getElementById('priceValue');
        const distanceRange = document.getElementById('distanceRange');
        const distanceValue = document.getElementById('distanceValue');
        const applyFilters = document.getElementById('applyFilters');
        const resultsContainer = document.getElementById('resultsContainer');
        const loading = document.getElementById('loading');
        const resultsCount = document.getElementById('resultsCount');
        const sortRating = document.getElementById('sortRating');
        const sortDistance = document.getElementById('sortDistance');
        
        // Update slider values
        priceRange.addEventListener('input', () => {
            priceValue.textContent = `$${priceRange.value}`;
        });
        
        distanceRange.addEventListener('input', () => {
            distanceValue.textContent = `${distanceRange.value} km`;
        });
        
        // Filter function
        function filterRestaurants(veganFriendly, maxPrice, maxDistance) {
            return restaurants
                .filter(restaurant => {
                    const [id, rating, vegan, price, distance] = restaurant;
                    return (
                        (veganFriendly === 0 || vegan === veganFriendly) &&
                        price <= maxPrice &&
                        distance <= maxDistance
                    );
                })
                .sort((a, b) => {
                    if (a[1] === b[1]) {
                        return b[0] - a[0]; // higher id first if same rating
                    }
                    return b[1] - a[1]; // higher rating first
                });
        }
        
        // Display results
        function displayResults(filteredRestaurants) {
            resultsContainer.innerHTML = '';
            resultsCount.textContent = filteredRestaurants.length;
            
            if (filteredRestaurants.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-gray-900">No restaurants found</h3>
                        <p class="mt-1 text-gray-500">Try adjusting your filters to find more options.</p>
                    </div>
                `;
                return;
            }
            
            filteredRestaurants.forEach((restaurant, index) => {
                const [id, rating, vegan, price, distance] = restaurant;
                const info = restaurantInfo[id] || { 
                    name: `Restaurant ${id}`, 
                    tags: ["Food", "Dining"], 
                    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                };
                
                // Create rating stars
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 >= 0.5;
                let stars = '';
                
                for (let i = 0; i < 5; i++) {
                    if (i < fullStars) {
                        stars += `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>`;
                    } else if (i === fullStars && hasHalfStar) {
                        stars += `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>`;
                    } else {
                        stars += `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>`;
                    }
                }
                
                // Price indicator
                let priceIndicator = '';
                let priceText = '';
                if (price < 15) {
                    priceIndicator = '$';
                    priceText = 'Inexpensive';
                } else if (price < 30) {
                    priceIndicator = '$$';
                    priceText = 'Moderate';
                } else {
                    priceIndicator = '$$$';
                    priceText = 'Expensive';
                }
                
                const card = document.createElement('div');
                card.className = `restaurant-card border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer slide-in`;
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = `
                    <div class="flex items-start">
                        <div class="flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-gray-200 mr-4">
                            <img src="${info.image}" alt="${info.name}" class="h-full w-full object-cover">
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800">${info.name}</h3>
                                    <div class="flex items-center mt-1">
                                        <div class="flex">
                                            ${stars}
                                        </div>
                                        <span class="text-gray-500 text-sm ml-2">${rating.toFixed(1)} (${Math.floor(Math.random() * 100 + 50)} reviews)</span>
                                    </div>
                                </div>
                                ${vegan ? `<span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                    Vegan
                                </span>` : ''}
                            </div>
                            <div class="mt-2 flex items-center text-sm text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                ${distance.toFixed(1)} km away
                            </div>
                            <div class="mt-1 flex items-center text-sm text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Open until ${Math.floor(Math.random() * 3 + 8)}:00 PM
                            </div>
                            <div class="mt-2">
                                ${info.tags.map(tag => `<span class="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#${tag}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="mt-3 flex justify-between items-center border-t border-gray-100 pt-3">
                        <div>
                            <span class="text-gray-700 font-medium">${priceIndicator}</span>
                            <span class="text-gray-500 text-sm ml-2">${priceText}</span>
                        </div>
                        <button class="text-green-600 hover:text-green-800 font-medium flex items-center">
                            View Menu
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                `;
                
                resultsContainer.appendChild(card);
            });
        }
        
        // Apply filters
        applyFilters.addEventListener('click', () => {
            loading.classList.remove('hidden');
            resultsContainer.classList.add('hidden');
            
            setTimeout(() => {
                const veganChecked = veganFilter.checked ? 1 : 0;
                const maxPrice = parseInt(priceRange.value);
                const maxDistance = parseInt(distanceRange.value);
                
                const filtered = filterRestaurants(veganChecked, maxPrice, maxDistance);
                displayResults(filtered);
                
                loading.classList.add('hidden');
                resultsContainer.classList.remove('hidden');
            }, 800);
        });
        
        // Initial load
        displayResults(filterRestaurants(1, 50, 10));
        
        // Sort buttons
        sortRating.addEventListener('click', (e) => {
            e.preventDefault();
            sortRating.classList.remove('bg-gray-200', 'text-gray-700');
            sortRating.classList.add('bg-green-600', 'text-white');
            sortDistance.classList.remove('bg-green-600', 'text-white');
            sortDistance.classList.add('bg-gray-200', 'text-gray-700');
            
            const currentRestaurants = Array.from(resultsContainer.children).map(card => {
                const id = parseInt(card.querySelector('h3').textContent.replace(/\D/g, ''));
                return restaurants.find(r => r[0] === id);
            });
            
            currentRestaurants.sort((a, b) => {
                if (a[1] === b[1]) return b[0] - a[0];
                return b[1] - a[1];
            });
            
            displayResults(currentRestaurants);
        });
        
        sortDistance.addEventListener('click', (e) => {
            e.preventDefault();
            sortDistance.classList.remove('bg-gray-200', 'text-gray-700');
            sortDistance.classList.add('bg-green-600', 'text-white');
            sortRating.classList.remove('bg-green-600', 'text-white');
            sortRating.classList.add('bg-gray-200', 'text-gray-700');
            
            const currentRestaurants = Array.from(resultsContainer.children).map(card => {
                const id = parseInt(card.querySelector('h3').textContent.replace(/\D/g, ''));
                return restaurants.find(r => r[0] === id);
            });
            
            currentRestaurants.sort((a, b) => a[4] - b[4]);
            
            displayResults(currentRestaurants);
        });
 