
// Initialize particles.js
document.addEventListener('DOMContentLoaded', function() {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 60,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#6366f1"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#c7d2fe",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

    // Initialize exam room
    let examRoom = null;
    let studentCounter = 1;
    const maxSeats = 50; // For visualization purposes

    // DOM elements
    const roomSizeInput = document.getElementById('roomSize');
    const initBtn = document.getElementById('initBtn');
    const seatBtn = document.getElementById('seatBtn');
    const leaveSeatInput = document.getElementById('leaveSeat');
    const leaveBtn = document.getElementById('leaveBtn');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const roomContainer = document.getElementById('roomContainer');
    const emptyRoomMessage = document.getElementById('emptyRoomMessage');
    const logContainer = document.getElementById('logContainer');
    const emptyLogMessage = document.getElementById('emptyLogMessage');
    const totalSeatsSpan = document.getElementById('totalSeats');
    const occupiedCountSpan = document.getElementById('occupiedCount');
    const viewCodeBtn = document.getElementById('viewCodeBtn');
    const codeModal = document.getElementById('codeModal');
    const closeCodeModal = document.getElementById('closeCodeModal');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const resetBtn = document.getElementById('resetBtn');
    const showSolutionBtn = document.getElementById('showSolutionBtn');
    const hintModal = document.getElementById('hintModal');
    const closeHintModal = document.getElementById('closeHintModal');
    const viewFullSolutionBtn = document.getElementById('viewFullSolutionBtn');

    // Initialize room
    initBtn.addEventListener('click', function() {
        const size = parseInt(roomSizeInput.value);
        if (isNaN(size) || size < 1 || size > maxSeats) {
            alert(`Please enter a room size between 1 and ${maxSeats}`);
            return;
        }

        examRoom = new ExamRoom(size);
        studentCounter = 1;
        renderRoom();
        updateStats();
        addLogEntry(`Initialized room with ${size} seats`);
        
        // Highlight algorithm step
        highlightAlgorithmStep('init');
        
        // Enable seat button
        seatBtn.disabled = false;
        
        // Show confetti for initialization
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    });

    // Seat next student
    seatBtn.addEventListener('click', function() {
        if (!examRoom) {
            alert('Please initialize the room first');
            return;
        }

        if (examRoom.seats.size >= examRoom.n) {
            alert('Room is full!');
            return;
        }

        const seat = examRoom.seat();
        renderRoom();
        updateStats();
        addLogEntry(`Student ${studentCounter} seated at position ${seat}`, 'seat');
        studentCounter++;
        
        // Highlight algorithm step
        highlightAlgorithmStep('seat');
        setTimeout(() => {
            highlightAlgorithmStep('check-empty');
            setTimeout(() => {
                highlightAlgorithmStep('find-gaps');
                setTimeout(() => {
                    highlightAlgorithmStep('place-middle');
                }, 500);
            }, 500);
        }, 500);
        
        // Animate the seated student
        const seatElement = document.querySelector(`.seat-${seat}`);
        if (seatElement) {
            seatElement.classList.add('animate__animated', 'animate__bounceIn');
            setTimeout(() => {
                seatElement.classList.remove('animate__animated', 'animate__bounceIn');
            }, 1000);
        }
    });

    // Leave seat
    leaveBtn.addEventListener('click', function() {
        if (!examRoom) {
            alert('Please initialize the room first');
            return;
        }

        const seat = parseInt(leaveSeatInput.value);
        if (isNaN(seat)) {
            alert('Please enter a valid seat number');
            return;
        }

        if (seat < 0 || seat >= examRoom.n) {
            alert(`Seat number must be between 0 and ${examRoom.n - 1}`);
            return;
        }

        if (!examRoom.seats.has(seat)) {
            alert(`Seat ${seat} is not occupied`);
            return;
        }

        examRoom.leave(seat);
        renderRoom();
        updateStats();
        addLogEntry(`Student left position ${seat}`, 'leave');
        leaveSeatInput.value = '';
        
        // Highlight algorithm step
        highlightAlgorithmStep('leave');
    });

    // Clear log
    clearLogBtn.addEventListener('click', function() {
        logContainer.innerHTML = '<div class="text-center text-gray-400 py-8" id="emptyLogMessage">No operations logged yet</div>';
        emptyLogMessage = document.getElementById('emptyLogMessage');
    });

    // Show code modal
    viewCodeBtn.addEventListener('click', function() {
        codeModal.classList.remove('hidden');
        codeModal.classList.add('animate__fadeIn');
    });

    // Close code modal
    closeCodeModal.addEventListener('click', function() {
        codeModal.classList.add('hidden');
    });

    // Copy code
    copyCodeBtn.addEventListener('click', function() {
        const code = document.querySelector('#codeModal code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = copyCodeBtn.innerHTML;
            copyCodeBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
            setTimeout(() => {
                copyCodeBtn.innerHTML = originalText;
            }, 2000);
        });
    });

    // Reset everything
    resetBtn.addEventListener('click', function() {
        examRoom = null;
        studentCounter = 1;
        roomContainer.innerHTML = '<div class="text-center w-full py-8 text-gray-400" id="emptyRoomMessage"><i class="fas fa-door-open text-3xl mb-3 opacity-50"></i><p>Room not initialized. Set size and click "Initialize"</p></div>';
        emptyRoomMessage = document.getElementById('emptyRoomMessage');
        logContainer.innerHTML = '<div class="text-center text-gray-400 py-8" id="emptyLogMessage"><i class="far fa-clipboard text-2xl mb-2 opacity-50"></i><p>No operations yet. Start by initializing the room.</p></div>';
        emptyLogMessage = document.getElementById('emptyLogMessage');
        totalSeatsSpan.textContent = '0';
        occupiedCountSpan.textContent = '0';
        roomSizeInput.value = '10';
        leaveSeatInput.value = '';
        seatBtn.disabled = true;
        
        // Reset algorithm highlights
        document.querySelectorAll('#algorithmVisualization div').forEach(step => {
            step.classList.remove('highlight-step');
        });
        
        addLogEntry('Reset the simulation', 'reset');
        
        // Confetti for reset
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
        });
    });

    // Show hint modal
    showSolutionBtn.addEventListener('click', function() {
        hintModal.classList.remove('hidden');
        hintModal.classList.add('animate__fadeIn');
    });

    // Close hint modal
    closeHintModal.addEventListener('click', function() {
        hintModal.classList.add('hidden');
    });

    // View full solution from hint modal
    viewFullSolutionBtn.addEventListener('click', function() {
        hintModal.classList.add('hidden');
        codeModal.classList.remove('hidden');
        codeModal.classList.add('animate__fadeIn');
    });

    // Close modals when clicking outside
    [codeModal, hintModal].forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Exam Room class
    class ExamRoom {
        constructor(n) {
            this.n = n;
            this.seats = new Set();
        }

        seat() {
            let seatNumber = 0;
            
            if (this.seats.size > 0) {
                let maxDist = 0;
                let prev = -1;
                
                // Check distance before first seat
                if (!this.seats.has(0)) {
                    const firstSeat = Math.min(...this.seats);
                    if (firstSeat > maxDist) {
                        maxDist = firstSeat;
                        seatNumber = 0;
                    }
                }
                
                // Check distances between seats
                const sortedSeats = Array.from(this.seats).sort((a, b) => a - b);
                for (const seat of sortedSeats) {
                    if (prev === -1) {
                        prev = seat;
                        continue;
                    }
                    const distance = Math.floor((seat - prev) / 2);
                    if (distance > maxDist) {
                        maxDist = distance;
                        seatNumber = prev + distance;
                    }
                    prev = seat;
                }
                
                // Check distance after last seat
                if (!this.seats.has(this.n - 1)) {
                    const lastSeat = Math.max(...this.seats);
                    const distance = (this.n - 1) - lastSeat;
                    if (distance > maxDist) {
                        maxDist = distance;
                        seatNumber = this.n - 1;
                    }
                }
            }
            
            this.seats.add(seatNumber);
            return seatNumber;
        }

        leave(p) {
            this.seats.delete(p);
        }
    }

    // Helper functions
    function renderRoom() {
        if (!examRoom) return;

        roomContainer.innerHTML = '';
        
        for (let i = 0; i < examRoom.n; i++) {
            const seat = document.createElement('div');
            seat.className = `flex flex-col items-center seat-animation ${examRoom.seats.has(i) ? 'occupied-seat' : 'empty-seat'}`;
            
            if (examRoom.seats.has(i)) {
                seat.innerHTML = `
                    <div class="relative">
                        <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md seat-${i}">
                            <i class="fas fa-user text-sm md:text-base"></i>
                        </div>
                        <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold text-gray-700">${i}</div>
                    </div>
                `;
            } else {
                seat.innerHTML = `
                    <div class="relative">
                        <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 seat-${i}">
                            <i class="fas fa-chair text-sm md:text-base"></i>
                        </div>
                        <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-500">${i}</div>
                    </div>
                `;
            }
            
            roomContainer.appendChild(seat);
        }
    }

    function updateStats() {
        if (!examRoom) return;
        
        totalSeatsSpan.textContent = examRoom.n;
        occupiedCountSpan.textContent = examRoom.seats.size;
        
        // Update room stats color based on occupancy
        const roomStats = document.getElementById('roomStats');
        const occupancyRate = examRoom.seats.size / examRoom.n;
        
        if (occupancyRate === 0) {
            roomStats.className = 'text-xs md:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full';
        } else if (occupancyRate < 0.5) {
            roomStats.className = 'text-xs md:text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full';
        } else if (occupancyRate < 0.8) {
            roomStats.className = 'text-xs md:text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full';
        } else {
            roomStats.className = 'text-xs md:text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full';
        }
    }

    function addLogEntry(message, type = 'info') {
        if (emptyLogMessage) emptyLogMessage.remove();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry p-2 rounded-md text-sm ${type === 'seat' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 
                              type === 'leave' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' : 
                              type === 'reset' ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500' : 
                              'bg-blue-50 text-blue-800 border-l-4 border-blue-500'}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `
            <div class="flex justify-between items-start">
                <div>${message}</div>
                <div class="text-xs opacity-70 ml-2">${timestamp}</div>
            </div>
        `;
        
        logContainer.prepend(logEntry);
    }

    function highlightAlgorithmStep(step) {
        // Remove all highlights first
        document.querySelectorAll('#algorithmVisualization div').forEach(el => {
            el.classList.remove('highlight-step');
        });
        
        // Highlight the specific step
        document.querySelectorAll(`[data-step="${step}"]`).forEach(el => {
            el.classList.add('highlight-step');
            
            // Remove highlight after some time
            setTimeout(() => {
                el.classList.remove('highlight-step');
            }, 1500);
        });
    }

    // Initialize with seat button disabled
    seatBtn.disabled = true;
});
