
        // Global variables
        let remainingEggs = 2;
        let totalFloors = 6;
        let optimalFloors = [];
        let currentOptimalIndex = 0;
        
        function superEggDrop(k, n) {
            const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0));
            
            for (let j = 1; j <= n; j++) {
                dp[1][j] = j;
            }
            
            for (let i = 1; i <= k; i++) {
                dp[i][0] = 0;
                dp[i][1] = 1;
            }
            
            for (let i = 2; i <= k; i++) {
                for (let j = 2; j <= n; j++) {
                    let low = 1, high = j, result = j;
                    
                    while (low <= high) {
                        const mid = Math.floor((low + high) / 2);
                        const broken = dp[i - 1][mid - 1];
                        const notBroken = dp[i][j - mid];
                        
                        const temp = 1 + Math.max(broken, notBroken);
                        
                        if (broken < notBroken) {
                            low = mid + 1;
                        } else {
                            high = mid - 1;
                        }
                        
                        result = Math.min(result, temp);
                    }
                    
                    dp[i][j] = result;
                }
            }
            
            return dp[k][n];
        }

        function calculate() {
            const k = parseInt(document.getElementById('eggs').value);
            const n = parseInt(document.getElementById('floors').value);
            
            if (isNaN(k) || isNaN(n) || k < 1 || n < 1) {
                showErrorToast('Please enter valid numbers (k ≥ 1, n ≥ 1)');
                return;
            }
            
            remainingEggs = k;
            totalFloors = n;
            updateEggCounter();
            
            const result = superEggDrop(k, n);
            document.getElementById('result').innerHTML = `
                <div class="text-center animate__animated animate__fadeIn">
                    <p class="text-lg">With <span class="font-bold">${k} egg${k > 1 ? 's' : ''}</span> and <span class="font-bold">${n} floor${n > 1 ? 's' : ''}</span>,</p>
                    <p class="text-2xl font-bold text-yellow-600 mt-2 animate__animated animate__pulse">Minimum moves needed: ${result}</p>
                    <p class="text-sm text-gray-500 mt-2 animate__animated animate__fadeIn">${getFunnyMessage(k, n, result)}</p>
                </div>
            `;
            
            // Calculate optimal floors for visualization
            optimalFloors = calculateOptimalFloors(k, n, result);
            currentOptimalIndex = 0;
            
            visualizeBuilding(k, n, result);
        }

        function calculateOptimalFloors(k, n, moves) {
            const floors = [];
            let remainingFloors = n;
            let remainingEggs = k;
            let step = Math.ceil(remainingFloors / moves);
            
            for (let i = 0; i < moves; i++) {
                if (remainingFloors <= 0) break;
                
                const floor = Math.min(step, remainingFloors);
                floors.push(floor);
                remainingFloors -= floor;
                
                // Adjust step based on remaining eggs and floors
                if (remainingEggs > 1) {
                    step = Math.ceil(remainingFloors / (moves - i - 1));
                }
            }
            
            // Convert to cumulative floors
            for (let i = 1; i < floors.length; i++) {
                floors[i] += floors[i - 1];
            }
            
            return floors;
        }

        function dropFromOptimal() {
            if (optimalFloors.length === 0 || currentOptimalIndex >= optimalFloors.length) {
                showErrorToast('No optimal floors calculated or all floors tested');
                return;
            }
            
            const floor = optimalFloors[currentOptimalIndex];
            animateEggDrop(floor, remainingEggs, totalFloors);
            currentOptimalIndex++;
        }

        function getFunnyMessage(k, n, result) {
            const messages = [
                "That's fewer than the number of eggs you had for breakfast!",
                "Even Humpty Dumpty would be impressed!",
                "Your eggs are in safe hands!",
                "No omelettes were made in solving this problem!",
                "Egg-cellent calculation!",
                "You're really cracking these problems!",
                "That's fewer drops than your last phone!",
                "The chickens approve this result!",
                "Your egg-dropping skills are unbreakable!",
                "This result is nothing to yolk about!",
                "You're eggs-traordinary at this!",
                "That's egg-sactly right!",
                "You've cracked the code!",
                "Egg-splosive results!",
                "You're an eggs-pert now!"
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        }

        function visualizeBuilding(k, n, result) {
            const building = document.getElementById('building');
            const eggContainer = document.getElementById('egg-container');
            
            // Clear previous visualization
            building.innerHTML = '';
            
            // Create egg if not exists
            if (!document.getElementById('egg')) {
                const egg = document.createElement('div');
                egg.id = 'egg';
                egg.className = 'egg absolute top-4 left-1/2 transform -translate-x-1/2 w-10 h-12 rounded-full shadow-md cursor-pointer hover:shadow-lg transition duration-300';
                egg.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><span class="text-xs font-bold">Drop me!</span></div>';
                egg.onclick = dropFromOptimal;
                eggContainer.appendChild(egg);
            }
            
            // Create floors
            const maxFloorsToShow = 15;
            const step = Math.max(1, Math.floor(n / maxFloorsToShow));
            
            for (let i = n; i >= 0; i -= step) {
                if (i < 0) i = 0;
                
                const floor = document.createElement('div');
                floor.className = 'floor relative py-3 pl-10 border-b border-gray-200 transition duration-200 hover:bg-gray-100';
                floor.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="font-mono text-sm text-gray-600 flex items-center">
                            <span class="inline-block w-6 text-right mr-2">${i}</span>
                            ${i === 0 ? 'Ground' : i === n ? 'Top' : ''}
                        </span>
                        <button onclick="animateEggDrop(${i}, ${k}, ${n})" 
                                class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition duration-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            Drop
                        </button>
                    </div>
                `;
                floor.dataset.floor = i;
                building.appendChild(floor);
                
                // Add highlight to critical floors based on optimal strategy
                if (optimalFloors.includes(i)) {
                    floor.classList.add('bg-yellow-50', 'font-medium');
                    const marker = document.createElement('div');
                    marker.className = 'absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full';
                    floor.insertBefore(marker, floor.firstChild);
                }
            }
            
            // Add ground floor if not already there
            if (n % step !== 0) {
                const groundFloor = document.createElement('div');
                groundFloor.className = 'floor relative py-3 pl-10 border-b border-gray-200 bg-gray-100';
                groundFloor.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="font-mono text-sm text-gray-600 flex items-center">
                            <span class="inline-block w-6 text-right mr-2">0</span>
                            Ground
                        </span>
                        <button onclick="animateEggDrop(0, ${k}, ${n})" 
                                class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition duration-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            Drop
                        </button>
                    </div>
                `;
                groundFloor.dataset.floor = 0;
                building.appendChild(groundFloor);
            }
            
            // Add building roof
            const roof = document.createElement('div');
            roof.className = 'py-2 px-4 bg-gray-800 text-white text-center rounded-t-lg font-mono text-sm';
            roof.textContent = `🏢 ${n}-Floor Building`;
            building.insertBefore(roof, building.firstChild);
        }

        function animateEggDrop(floor, k, n) {
            if (remainingEggs <= 0) {
                showErrorToast('No eggs remaining! Reset to try again.');
                return;
            }
            
            const egg = document.getElementById('egg');
            const eggContainer = document.querySelector('#egg-container');
            const building = document.querySelector('#building');
            const floors = building.querySelectorAll('.floor');
            
            // Disable egg during animation
            egg.style.pointerEvents = 'none';
            
            // Calculate position to drop (approximate based on floor number)
            const containerHeight = eggContainer.offsetHeight;
            const floorHeight = containerHeight / (n / Math.max(1, Math.floor(n / 15)));
            const dropPosition = containerHeight - (floor * floorHeight);
            
            // Add drop animation
            egg.classList.add('egg-drop');
            egg.style.top = `${dropPosition}px`;
            
            // After animation, show result
            setTimeout(() => {
                egg.classList.remove('egg-drop');
                
                // Determine if egg breaks (based on optimal strategy for visualization)
                let breaks = false;
                if (optimalFloors.length > 0) {
                    // For visualization, break if floor is higher than middle optimal floor
                    const middleFloor = optimalFloors[Math.floor(optimalFloors.length / 2)];
                    breaks = floor > middleFloor;
                } else {
                    // Random if no optimal floors calculated
                    breaks = Math.random() > 0.5;
                }
                
                if (breaks) {
                    // Egg breaks
                    egg.innerHTML = '<div class="absolute inset-0 bg-yellow-200 rounded-full opacity-80 flex items-center justify-center text-xs">💔</div>';
                    egg.classList.add('egg-crack');
                    remainingEggs--;
                    updateEggCounter();
                    
                    // Show message with animation
                    setTimeout(() => {
                        showToast(`Egg broke at floor ${floor}! ${remainingEggs} egg${remainingEggs !== 1 ? 's' : ''} remaining`, 'error');
                    }, 300);
                } else {
                    // Egg survives
                    egg.innerHTML = '<div class="absolute inset-0 bg-green-100 rounded-full opacity-80 flex items-center justify-center text-xs">👍</div>';
                    egg.classList.add('egg-survive');
                    
                    // Show message with animation
                    setTimeout(() => {
                        showToast(`Egg survived floor ${floor}! Try a higher floor`, 'success');
                    }, 300);
                }
                
                // Reset egg after a delay
                setTimeout(() => {
                    egg.style.top = '1rem';
                    egg.innerHTML = '<div class="absolute inset-0 flex items-center justify-center"><span class="text-xs font-bold">Drop me!</span></div>';
                    egg.classList.remove('egg-crack', 'egg-survive', 'opacity-70');
                    egg.style.pointerEvents = 'auto';
                }, 1500);
                
                // Highlight the tested floor
                floors.forEach(f => {
                    if (parseInt(f.dataset.floor) === floor) {
                        f.classList.add('floor-animate');
                        setTimeout(() => f.classList.remove('floor-animate'), 1500);
                    }
                });
            }, 800);
        }

        function updateEggCounter() {
            const counter = document.getElementById('egg-counter');
            const remaining = document.getElementById('remaining-eggs');
            
            remaining.textContent = remainingEggs;
            
            if (remainingEggs <= 1) {
                counter.classList.remove('bg-yellow-100', 'text-yellow-800');
                counter.classList.add('bg-red-100', 'text-red-800');
            } else {
                counter.classList.remove('bg-red-100', 'text-red-800');
                counter.classList.add('bg-yellow-100', 'text-yellow-800');
            }
        }

        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white animate__animated animate__fadeInUp ${
                type === 'error' ? 'bg-red-500' : 
                type === 'success' ? 'bg-green-500' : 'bg-blue-500'
            }`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.remove('animate__fadeInUp');
                toast.classList.add('animate__fadeOutDown');
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }

        function showErrorToast(message) {
            showToast(message, 'error');
        }

        function setExample(k, n) {
            document.getElementById('eggs').value = k;
            document.getElementById('floors').value = n;
            calculate();
            
            // Animate the example button
            event.target.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                event.target.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
        }

        // Initialize with default values
        document.addEventListener('DOMContentLoaded', () => {
            calculate();
            
            // Add animation to title
            setTimeout(() => {
                const title = document.querySelector('h1');
                title.classList.remove('animate-pulse');
                title.classList.add('animate__animated', 'animate__tada');
                
                setTimeout(() => {
                    title.classList.remove('animate__animated', 'animate__tada');
                }, 1000);
            }, 1500);
        });
   