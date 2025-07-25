
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const weightsInput = document.getElementById('weightsInput');
    const daysRange = document.getElementById('daysRange');
    const daysInput = document.getElementById('daysInput');
    const calculateBtn = document.getElementById('calculateBtn');
    const randomWeightsBtn = document.getElementById('randomWeightsBtn');
    const resultContainer = document.getElementById('resultContainer');
    const visualizationContainer = document.getElementById('visualizationContainer');
    const visualizationPlaceholder = document.getElementById('visualizationPlaceholder');
    const capacityResult = document.getElementById('capacityResult');
    const daysBadge = document.getElementById('daysBadge');
    const minCapacity = document.getElementById('minCapacity');
    const maxCapacity = document.getElementById('maxCapacity');
    const capacityBar = document.getElementById('capacityBar');
    const packagesContainer = document.getElementById('packagesContainer');
    const shippingPlan = document.getElementById('shippingPlan');
    const shipAnimationContainer = document.getElementById('shipAnimationContainer');
    const animatedShip = document.getElementById('animatedShip');
    const confettiContainer = document.getElementById('confettiContainer');
    const totalPackagesStat = document.getElementById('totalPackagesStat');
    const totalShipmentsStat = document.getElementById('totalShipmentsStat');
    const runDemoBtn = document.getElementById('runDemoBtn');

    // Stats counters
    let totalPackages = 0;
    let totalShipments = 0;

    // Sync days range and input
    daysRange.addEventListener('input', function() {
        daysInput.value = this.value;
    });

    daysInput.addEventListener('input', function() {
        if (this.value > 15) this.value = 15;
        if (this.value < 1) this.value = 1;
        daysRange.value = this.value;
    });

    // Generate random weights
    randomWeightsBtn.addEventListener('click', function() {
        const count = Math.floor(Math.random() * 10) + 5; // 5-15 packages
        const weights = [];
        for (let i = 0; i < count; i++) {
            weights.push(Math.floor(Math.random() * 20) + 1); // 1-20 kg
        }
        weightsInput.value = weights.join(', ');
    });

    // Run demo with preset values
    runDemoBtn.addEventListener('click', function() {
        weightsInput.value = "3,5,1,7,8,2,4,6,9,5";
        daysInput.value = 4;
        daysRange.value = 4;
        calculateOptimalCapacity();
        this.classList.add('animate-ping');
        setTimeout(() => {
            this.classList.remove('animate-ping');
        }, 1000);
    });

    // Calculate optimal capacity
    calculateBtn.addEventListener('click', calculateOptimalCapacity);

    function calculateOptimalCapacity() {
        // Parse input
        const weights = weightsInput.value.split(',').map(w => parseInt(w.trim())).filter(w => !isNaN(w));
        const days = parseInt(daysInput.value);
        
        if (weights.length === 0 || isNaN(days)) {
            alert('Please enter valid package weights and days');
            return;
        }
        
        // Update stats
        totalPackages += weights.length;
        totalShipments++;
        totalPackagesStat.textContent = totalPackages.toLocaleString();
        totalShipmentsStat.textContent = totalShipments.toLocaleString();
        
        // Calculate min and max possible capacities
        const minCap = Math.max(...weights);
        const maxCap = weights.reduce((a, b) => a + b, 0);
        
        // Find optimal capacity using binary search
        let left = minCap;
        let right = maxCap;
        let result = maxCap;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (canShip(weights, days, mid)) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        
        // Display results
        capacityResult.textContent = result;
        daysBadge.innerHTML = `<i class="fas fa-calendar-day mr-1"></i><span>${days} days</span>`;
        minCapacity.textContent = `${minCap} kg`;
        maxCapacity.textContent = `${maxCap} kg`;
        
        // Calculate percentage for bar
        const percentage = ((result - minCap) / (maxCap - minCap)) * 100;
        capacityBar.style.width = `${percentage}%`;
        
        // Show result container
        resultContainer.classList.remove('hidden');
        resultContainer.classList.add('animate__bounceIn');
        
        // Show visualization
        visualizationContainer.classList.remove('hidden');
        visualizationPlaceholder.classList.add('hidden');
        
        // Generate package visualization
        packagesContainer.innerHTML = '';
        weights.forEach((weight, i) => {
            const packageEl = document.createElement('div');
            packageEl.className = 'package bg-white rounded-lg p-3 shadow-md flex flex-col items-center justify-center w-16 h-16 animate__animated animate__fadeIn';
            packageEl.style.animationDelay = `${i * 0.1}s`;
            packageEl.innerHTML = `
                <div class="text-xs text-gray-500 mb-1">Pkg ${i+1}</div>
                <div class="font-bold text-blue-600">${weight}kg</div>
            `;
            packagesContainer.appendChild(packageEl);
        });
        
        // Generate shipping plan
        shippingPlan.innerHTML = '';
        const plan = generateShippingPlan(weights, days, result);
        
        plan.forEach((dayPlan, dayIdx) => {
            const dayEl = document.createElement('div');
            dayEl.className = 'bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate__animated animate__fadeIn';
            dayEl.style.animationDelay = `${dayIdx * 0.2 + 0.5}s`;
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'flex justify-between items-center mb-3';
            dayHeader.innerHTML = `
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                        <i class="fas fa-ship text-sm"></i>
                    </div>
                    <h4 class="font-medium text-gray-800">Day ${dayIdx + 1}</h4>
                </div>
                <div class="text-sm font-medium text-gray-700">
                    <span class="text-blue-600">${dayPlan.reduce((a, b) => a + b, 0)}</span> / ${result} kg
                </div>
            `;
            
            const packagesEl = document.createElement('div');
            packagesEl.className = 'flex flex-wrap gap-2';
            
            dayPlan.forEach((pkg, pkgIdx) => {
                const pkgEl = document.createElement('div');
                pkgEl.className = 'px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center';
                pkgEl.innerHTML = `
                    <i class="fas fa-box mr-1 text-blue-500"></i>
                    ${pkg} kg
                `;
                packagesEl.appendChild(pkgEl);
            });
            
            dayEl.appendChild(dayHeader);
            dayEl.appendChild(packagesEl);
            shippingPlan.appendChild(dayEl);
        });
        
        // Animate ship departure
        animateShipDeparture();
        
        // Show confetti celebration
        celebrate();
    }
    
    function canShip(weights, days, capacity) {
        let current = 0;
        let needed = 1;
        
        for (const weight of weights) {
            if (current + weight > capacity) {
                needed++;
                current = 0;
                if (needed > days) return false;
            }
            current += weight;
        }
        
        return true;
    }
    
    function generateShippingPlan(weights, days, capacity) {
        const plan = [];
        let currentDay = [];
        let currentLoad = 0;
        
        for (const weight of weights) {
            if (currentLoad + weight > capacity) {
                plan.push(currentDay);
                currentDay = [];
                currentLoad = 0;
            }
            currentDay.push(weight);
            currentLoad += weight;
        }
        
        if (currentDay.length > 0) {
            plan.push(currentDay);
        }
        
        // Ensure we don't exceed days (though algorithm should prevent this)
        while (plan.length > days) {
            // Merge days if needed (though this shouldn't happen with correct capacity)
            const lastDay = plan.pop();
            const secondLastDay = plan.pop();
            plan.push([...secondLastDay, ...lastDay]);
        }
        
        return plan;
    }
    
    function animateShipDeparture() {
        shipAnimationContainer.classList.remove('hidden');
        animatedShip.classList.remove('ship-depart');
        
        // Reset position
        animatedShip.style.left = '0';
        animatedShip.style.opacity = '1';
        
        // Trigger reflow
        void animatedShip.offsetWidth;
        
        // Start animation
        animatedShip.classList.add('ship-depart');
        
        // Hide after animation
        setTimeout(() => {
            shipAnimationContainer.classList.add('hidden');
        }, 1500);
    }
    
    function celebrate() {
        confettiContainer.classList.remove('hidden');
        
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            spread: 100,
            ticks: 100,
            gravity: 1,
            decay: 0.94,
            startVelocity: 30
        };
        
        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }
        
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
        
        setTimeout(() => {
            confettiContainer.classList.add('hidden');
        }, 3000);
    }
    
    // Initialize with demo values
    setTimeout(() => {
        runDemoBtn.click();
    }, 1000);
});
