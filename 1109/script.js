
const themeRadios = document.querySelectorAll('input[name="theme"]');
themeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.style.setProperty('--primary', getComputedStyle(document.documentElement).getPropertyValue(`--${this.value}-500`));
            document.documentElement.style.setProperty('--secondary', getComputedStyle(document.documentElement).getPropertyValue(`--${this.value}-600`));
            
            // Update result flight colors
            document.querySelectorAll('.result-flight').forEach(flight => {
                flight.style.background = `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)`;
            });
            
            showToast(`Theme changed to ${this.value}`, 'success');
        }
    });
});

// Main calculation function with progress tracking
document.getElementById('calculateBtn').addEventListener('click', async function() {
    try {
        const n = parseInt(document.getElementById('flightCount').value);
        const bookingsText = document.getElementById('bookingsInput').value.trim();
        const bookings = bookingsText ? JSON.parse(bookingsText) : [];
        
        if (isNaN(n) || n <= 0) {
            throw new Error("Please enter a valid number of flights (1-100)");
        }
        
        if (n > 100) {
            throw new Error("For performance reasons, please keep n ≤ 100");
        }
        
        // Show progress bar
        document.getElementById('progressContainer').classList.remove('hidden');
        updateProgress(0);
        
        // Show capacity section if not shown
        document.getElementById('capacitySection').classList.remove('hidden');
        
        // Simulate processing with progress updates
        await simulateProcessing();
        
        // Calculate the answer
        const answer = corpFlightBookings(bookings, n);
        
        // Display visualization
        displayVisualization(bookings, n);
        
        // Display results
        displayResults(answer);
        
        // Show stats
        showStats(bookings, answer);
        
        // Show results and algorithm sections
        document.getElementById('resultsSection').classList.remove('hidden');
        document.getElementById('algorithmSection').classList.remove('hidden');
        
        // Check for overbooking
        checkOverbooking(answer);
        
        // Celebrate!
        createConfetti();
        
        // Show performance comparison
        renderPerformanceChart();
        
        // Show booking chart
        renderBookingChart(bookings);
        
        // Show summary chart
        renderSummaryChart(bookings);
        
    } catch (error) {
        showToast(error.message, 'error');
        console.error(error);
    } finally {
        updateProgress(100);
        setTimeout(() => {
            document.getElementById('progressContainer').classList.add('hidden');
        }, 500);
    }
});

// Sample data button
document.getElementById('sampleDataBtn').addEventListener('click', function() {
    document.getElementById('bookingsInput').value = '[[1,2,10],[2,3,20],[2,5,25]]';
    document.getElementById('flightCount').value = '5';
    
    showToast('Sample data loaded!', 'info');
});

// Clear button
document.getElementById('clearBtn').addEventListener('click', function() {
    document.getElementById('bookingsInput').value = '';
    showToast('Input cleared!', 'info');
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', function() {
    document.getElementById('bookingsInput').value = '';
    document.getElementById('flightCount').value = '5';
    document.getElementById('tableVisualization').innerHTML = `
        <p class="text-gray-500 italic text-center py-8">
            <i class="fas fa-plane text-3xl text-gray-300 mb-2 block"></i>
            Enter data and click calculate to see visualization magic!
        </p>
    `;
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('algorithmSection').classList.add('hidden');
    document.getElementById('statsContainer').classList.add('hidden');
    document.getElementById('chartContainer').classList.add('hidden');
    document.getElementById('graphVisualization').classList.add('hidden');
    document.getElementById('tableTab').classList.add('active');
    document.getElementById('graphTab').classList.remove('active');
    document.getElementById('tableVisualization').classList.remove('hidden');
    
    showToast('Form reset!', 'info');
});

// Quick add booking
document.getElementById('quickAddBtn').addEventListener('click', function() {
    const first = parseInt(document.getElementById('quickFirst').value);
    const last = parseInt(document.getElementById('quickLast').value);
    const seats = parseInt(document.getElementById('quickSeats').value);
    
    if (isNaN(first) || isNaN(last) || isNaN(seats)) {
        showToast('Please fill all fields with valid numbers', 'error');
        return;
    }
    
    if (first > last) {
        showToast('First flight must be ≤ last flight', 'error');
        return;
    }
    
    if (seats <= 0) {
        showToast('Seats must be positive', 'error');
        return;
    }
    
    const bookingsInput = document.getElementById('bookingsInput');
    let currentBookings = [];
    
    if (bookingsInput.value.trim()) {
        try {
            currentBookings = JSON.parse(bookingsInput.value);
        } catch (e) {
            showToast('Invalid current bookings data', 'error');
            return;
        }
    }
    
    currentBookings.push([first, last, seats]);
    bookingsInput.value = JSON.stringify(currentBookings, null, 2);
    
    // Clear fields
    document.getElementById('quickFirst').value = '';
    document.getElementById('quickLast').value = '';
    document.getElementById('quickSeats').value = '';
    
    showToast(`Added booking for flights ${first}-${last}`, 'success');
});

// Export buttons
document.getElementById('exportBtn').addEventListener('click', exportToCsv);
document.getElementById('exportJsonBtn').addEventListener('click', exportToJson);
document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);

// Chart button
document.getElementById('chartBtn').addEventListener('click', function() {
    const container = document.getElementById('chartContainer');
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        renderChart();
        document.getElementById('chartBtn').innerHTML = '<i class="fas fa-eye-slash mr-2"></i> Hide Chart';
    } else {
        container.classList.add('hidden');
        document.getElementById('chartBtn').innerHTML = '<i class="fas fa-chart-pie mr-2"></i> Show Chart';
    }
});

// Visualization tabs
document.getElementById('tableTab').addEventListener('click', function() {
    document.getElementById('tableVisualization').classList.remove('hidden');
    document.getElementById('graphVisualization').classList.add('hidden');
    this.classList.add('active');
    document.getElementById('graphTab').classList.remove('active');
});

document.getElementById('graphTab').addEventListener('click', function() {
    document.getElementById('tableVisualization').classList.add('hidden');
    document.getElementById('graphVisualization').classList.remove('hidden');
    this.classList.add('active');
    document.getElementById('tableTab').classList.remove('active');
});

// Apply filters
document.getElementById('applyFilterBtn').addEventListener('click', function() {
    const answer = getCurrentResults();
    if (!answer) return;
    
    const filter = document.getElementById('filterSeats').value;
    const sortBy = document.getElementById('sortResults').value;
    
    displayResults(answer, filter, sortBy);
    showToast('Filters applied!', 'success');
});

// Enhanced corpFlightBookings function with validation
function corpFlightBookings(bookings, n) {
    if (!Array.isArray(bookings)) {
        throw new Error("Bookings must be an array");
    }
    
    const answer = new Array(n).fill(0);
    
    // Validate and process each booking
    bookings.forEach((booking, index) => {
        if (!Array.isArray(booking) || booking.length !== 3) {
            throw new Error(`Booking at index ${index} must be an array of [first, last, seats]`);
        }
        
        const [first, last, seats] = booking;
        
        if (first < 1 || first > n || last < 1 || last > n || first > last) {
            throw new Error(`Invalid flight range in booking ${index+1}: ${first} to ${last}`);
        }
        
        if (typeof seats !== 'number' || seats <= 0) {
            throw new Error(`Invalid seat count in booking ${index+1}: ${seats}`);
        }
        
        answer[first - 1] += seats;
        if (last < n) {
            answer[last] -= seats;
        }
    });
    
    // Convert difference array to prefix sum
    for (let i = 1; i < n; i++) {
        answer[i] += answer[i - 1];
    }
    
    return answer;
}

// Enhanced visualization with tooltips
function displayVisualization(bookings, n) {
    const visualization = document.getElementById('tableVisualization');
    visualization.innerHTML = '';
    
    if (bookings.length === 0) {
        visualization.innerHTML = `
            <p class="text-gray-500 italic text-center py-8">
                <i class="fas fa-plane-slash text-3xl text-gray-300 mb-2 block"></i>
                No bookings to display
            </p>
        `;
        return;
    }
    
    // Create a header with flight numbers
    let header = '<div class="flex mb-2 bg-gray-100 p-2 rounded-lg sticky top-0 z-10 shadow-sm flight-header">';
    header += '<div class="w-40 font-semibold text-gray-700">Booking</div>';
    for (let i = 1; i <= n; i++) {
        header += `<div class="flex-1 text-center font-medium text-gray-700">${i}</div>`;
    }
    header += '</div>';
    visualization.innerHTML = header;
    
    // Display each booking with enhanced UI
    bookings.forEach((booking, idx) => {
        const [first, last, seats] = booking;
        const bookingId = `booking-${idx+1}`;
        
        let bookingRow = `<div id="${bookingId}" class="flex items-center mb-3 flight-card booking-highlight p-3 rounded-xl border border-gray-200 relative">`;
        bookingRow += `<div class="w-40 font-medium flex items-center">
            <span class="bg-indigo-600 text-white text-sm font-bold px-2 py-1 rounded-full mr-3">${idx+1}</span>
            <span>Flights ${first}-${last}</span>
        </div>`;
        
        for (let i = 1; i <= n; i++) {
            if (i >= first && i <= last) {
                bookingRow += `<div class="flex-1 text-center py-2 bg-yellow-100 rounded-lg mx-1 font-medium relative has-tooltip">
                    ${seats}
                    <div class="tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                        Flight ${i}: ${seats} seats
                    </div>
                </div>`;
            } else {
                bookingRow += `<div class="flex-1 text-center py-2 bg-gray-50 rounded-lg mx-1 text-gray-400">-</div>`;
            }
        }
        
        bookingRow += '</div>';
        visualization.innerHTML += bookingRow;
    });
}

// Premium results display with animations and filtering
function displayResults(answer, filter = 'all', sortBy = 'flight') {
    const results = document.getElementById('results');
    results.innerHTML = '';
    
    // Find max seats for scaling
    const maxSeats = Math.max(...answer, 1);
    
    // Create array of flights with their numbers and seats
    let flights = answer.map((seats, idx) => ({
        number: idx + 1,
        seats: seats
    }));
    
    // Apply filter
    if (filter !== 'all') {
        flights = flights.filter(flight => {
            if (filter === 'overbooked') return flight.seats > 100;
            if (filter === 'high') return flight.seats >= 50 && flight.seats <= 100;
            if (filter === 'medium') return flight.seats >= 20 && flight.seats < 50;
            if (filter === 'low') return flight.seats < 20;
            return true;
        });
    }
    
    // Apply sorting
    if (sortBy === 'seats-asc') {
        flights.sort((a, b) => a.seats - b.seats);
    } else if (sortBy === 'seats-desc') {
        flights.sort((a, b) => b.seats - a.seats);
    } else {
        flights.sort((a, b) => a.number - b.number);
    }
    
    // Display flights
    flights.forEach((flight, idx) => {
        const percentage = Math.min(100, (flight.seats / maxSeats) * 100);
        const colorClass = getColorClass(percentage);
        
        const flightElement = document.createElement('div');
        flightElement.className = `result-flight rounded-xl p-5 text-center w-32 shadow-md cursor-pointer relative overflow-hidden`;
        flightElement.style.animationDelay = `${idx * 0.05}s`;
        flightElement.innerHTML = `
            <div class="absolute top-0 left-0 w-full h-full ${colorClass} opacity-10"></div>
            <div class="relative z-10">
                <div class="text-xs text-white opacity-80">Flight</div>
                <div class="text-3xl font-bold text-white my-2">${flight.number}</div>
                <div class="text-lg font-semibold text-white">${flight.seats} seats</div>
                <div class="mt-2 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                    <div class="h-full ${colorClass} rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
        
        // Add click effect
        flightElement.addEventListener('click', () => {
            flightElement.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                flightElement.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
            
            showToast(`Flight ${flight.number} has ${flight.seats} seats booked`, 'info');
        });
        
        results.appendChild(flightElement);
    });
}

// Show statistics
function showStats(bookings, answer) {
    const statsContainer = document.getElementById('statsContainer');
    statsContainer.classList.remove('hidden');
    
    const totalFlights = answer.length;
    const totalBookings = bookings.length;
    const totalSeats = answer.reduce((sum, seats) => sum + seats, 0);
    
    document.getElementById('totalFlights').textContent = totalFlights;
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('totalSeats').textContent = totalSeats;
}

// Check for overbooking
function checkOverbooking(answer) {
    const overbookedFlights = answer.filter(seats => seats > 100).length;
    
    if (overbookedFlights > 0) {
        const alert = document.getElementById('overbookingAlert');
        alert.classList.remove('hidden');
        document.getElementById('overbookingCount').textContent = 
            `${overbookedFlights} overbooked flight${overbookedFlights > 1 ? 's' : ''} detected!`;
        
        // Highlight overbooked flights
        setTimeout(() => {
            answer.forEach((seats, idx) => {
                if (seats > 100) {
                    const flightElements = document.querySelectorAll('.result-flight');
                    if (flightElements[idx]) {
                        flightElements[idx].classList.add('animate__animated', 'animate__shakeX');
                        flightElements[idx].style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                    }
                }
            });
        }, 1000);
    }
}

// Render main results chart
function renderChart() {
    const resultFlights = document.querySelectorAll('.result-flight');
    const ctx = document.getElementById('resultsChart').getContext('2d');
    
    const labels = [];
    const data = [];
    
    resultFlights.forEach((flight, index) => {
        labels.push(`Flight ${index + 1}`);
        data.push(parseInt(flight.querySelector('div:nth-child(3)').textContent));
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Seats Booked',
                data: data,
                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Seats: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Seats Booked'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Flight Number'
                    }
                }
            }
        }
    });
}

// Render booking chart
function renderBookingChart(bookings) {
    const ctx = document.getElementById('bookingChart').getContext('2d');
    
    const labels = bookings.map((_, idx) => `Booking ${idx + 1}`);
    const ranges = bookings.map(b => b[1] - b[0] + 1);
    const seats = bookings.map(b => b[2]);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Number of Flights',
                    data: ranges,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Seats per Flight',
                    data: seats,
                    backgroundColor: 'rgba(236, 72, 153, 0.7)',
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1',
                    type: 'line'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Booking Analysis'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Flights'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Seats per Flight'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });
}

// Render summary chart
function renderSummaryChart(bookings) {
    const ctx = document.getElementById('summaryChart').getContext('2d');
    
    // Calculate stats
    const totalSeats = bookings.reduce((sum, b) => sum + (b[2] * (b[1] - b[0] + 1)), 0);
    const avgSeats = bookings.reduce((sum, b) => sum + b[2], 0) / bookings.length;
    const maxSeats = Math.max(...bookings.map(b => b[2]));
    const minSeats = Math.min(...bookings.map(b => b[2]));
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Total Seats', 'Avg Seats/Flight', 'Max Seats', 'Min Seats'],
            datasets: [{
                data: [totalSeats, avgSeats, maxSeats, minSeats],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Render performance comparison chart
function renderPerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    // Sample performance data (in ms)
    const sizes = [100, 1000, 10000, 100000];
    const bruteForceTimes = sizes.map(size => size * size * 0.0001); // O(n^2)
    const optimalTimes = sizes.map(size => size * 0.1); // O(n)
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sizes.map(size => size.toLocaleString()),
            datasets: [
                {
                    label: 'Brute Force (O(n²))',
                    data: bruteForceTimes,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Optimal (O(n))',
                    data: optimalTimes,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Performance Comparison (Execution Time)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}ms`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Time (ms)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Number of Flights/Bookings'
                    }
                }
            }
        }
    });
}

// Export to CSV
function exportToCsv() {
    const flights = document.querySelectorAll('.result-flight');
    let csvContent = "Flight,Seats\n";
    
    flights.forEach((flight, index) => {
        const flightNum = index + 1;
        const seats = flight.querySelector('div:nth-child(3)').textContent.replace(' seats', '');
        csvContent += `${flightNum},${seats}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'flight_seats.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data exported to CSV!', 'success');
}

// Export to JSON
function exportToJson() {
    const flights = document.querySelectorAll('.result-flight');
    const data = [];
    
    flights.forEach((flight, index) => {
        const flightNum = index + 1;
        const seats = parseInt(flight.querySelector('div:nth-child(3)').textContent);
        data.push({
            flight: flightNum,
            seats: seats
        });
    });
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'flight_seats.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data exported to JSON!', 'success');
}

// Take screenshot of results
function takeScreenshot() {
    const element = document.getElementById('resultsSection');
    
    html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'flight-booking-results.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showToast('Screenshot saved!', 'success');
    });
}

// Get current results from DOM
function getCurrentResults() {
    const flights = document.querySelectorAll('.result-flight');
    if (flights.length === 0) return null;
    
    const results = [];
    flights.forEach(flight => {
        const number = parseInt(flight.querySelector('div:nth-child(2)').textContent);
        const seats = parseInt(flight.querySelector('div:nth-child(3)').textContent);
        results[number - 1] = seats;
    });
    
    return results;
}

// Helper functions
function getColorClass(percentage) {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-orange-500';
    if (percentage > 40) return 'bg-yellow-500';
    if (percentage > 20) return 'bg-green-500';
    return 'bg-blue-500';
}

async function simulateProcessing() {
    for (let i = 0; i <= 100; i += 10) {
        updateProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

function updateProgress(percent) {
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    
    // Change color based on progress
    if (percent < 30) {
        progressBar.className = 'progress-bar bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full';
    } else if (percent < 70) {
        progressBar.className = 'progress-bar bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full';
    } else {
        progressBar.className = 'progress-bar bg-gradient-to-r from-purple-500 to-pink-600 h-2.5 rounded-full';
    }
}

function showToast(message, type = 'info') {
    const types = {
        info: { bg: 'bg-blue-500', icon: 'fa-info-circle' },
        success: { bg: 'bg-green-500', icon: 'fa-check-circle' },
        error: { bg: 'bg-red-500', icon: 'fa-exclamation-circle' },
        warning: { bg: 'bg-yellow-500', icon: 'fa-exclamation-triangle' }
    };
    
    const toast = document.createElement('div');
    toast.className = `animate__animated animate__fadeInRight ${types[type].bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center`;
    toast.innerHTML = `
        <i class="fas ${types[type].icon} mr-3"></i>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate__fadeOutRight');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';
    
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = `${Math.random() * 100 + 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.borderRadius = `${Math.random() > 0.5 ? '50%' : '0'}`;
        container.appendChild(confetti);
        
        setTimeout(() => {
            confetti.classList.add('animate-fly');
            confetti.style.left = `${Math.random() * 100}%`;
        }, i * 20);
        
        setTimeout(() => {
            confetti.remove();
        }, 2000);
    }
}

// Initialize with sample data
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bookingsInput').value = '[[1,2,10],[2,3,20],[2,5,25]]';
    document.getElementById('flightCount').value = '5';
});
