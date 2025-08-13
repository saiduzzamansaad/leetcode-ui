
        document.addEventListener('DOMContentLoaded', function() {
            let grid = [];
            let maxPath = [];
            let rows = 3, cols = 3;
            let currentStep = 1;
            const totalSteps = 4;
            let history = [];
            
            // Initialize the grid
            function initGrid() {
                const density = parseInt(document.getElementById('gold-density').value) / 100;
                grid = Array.from({ length: rows }, () => 
                    Array.from({ length: cols }, () => Math.random() > density ? 0 : Math.floor(Math.random() * 9) + 1)
                );
                
                renderGrid();
                updateStats();
            }
            
            // Render the grid
            function renderGrid() {
                const gridContainer = document.getElementById('grid-container');
                gridContainer.innerHTML = '';
                
                gridContainer.style.gridTemplateColumns = `repeat(${cols}, minmax(60px, 1fr))`;
                
                let maxGoldValue = 0;
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        if (grid[i][j] > maxGoldValue) maxGoldValue = grid[i][j];
                    }
                }
                
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        const cell = document.createElement('div');
                        const goldValue = grid[i][j];
                        const isEmpty = goldValue === 0;
                        
                        // Calculate opacity based on gold value (for non-zero cells)
                        const opacity = isEmpty ? 1 : 0.3 + (0.7 * (goldValue / maxGoldValue));
                        
                        cell.className = `gold-cell rounded-lg p-3 text-center font-bold cursor-pointer flex items-center justify-center h-14 transition-all ${
                            isEmpty ? 'bg-gray-900 text-gray-600' : 'text-yellow-400 hover:bg-yellow-800'
                        } ${goldValue > 0 && goldValue === maxGoldValue ? 'gold-highlight' : ''}`;
                        
                        cell.style.backgroundColor = isEmpty ? '' : `rgba(180, 83, 9, ${opacity})`;
                        cell.textContent = isEmpty ? '✖' : goldValue;
                        cell.dataset.row = i;
                        cell.dataset.col = j;
                        cell.title = `Cell (${i}, ${j}) - ${isEmpty ? 'Empty' : goldValue + ' gold'}`;
                        
                        cell.addEventListener('click', function() {
                            const r = parseInt(this.dataset.row);
                            const c = parseInt(this.dataset.col);
                            const currentValue = grid[r][c];
                            const newValue = prompt(`Enter new gold value for cell (${r}, ${c}):\n(0 for empty)`, currentValue);
                            
                            if (newValue !== null) {
                                const numValue = parseInt(newValue);
                                if (!isNaN(numValue) ){
                                    grid[r][c] = Math.max(0, numValue);
                                    renderGrid();
                                    updateStats();
                                }
                            }
                        });
                        
                        gridContainer.appendChild(cell);
                    }
                }
            }
            
            // Update statistics
            function updateStats() {
                let totalGold = 0;
                let goldCells = 0;
                
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols; j++) {
                        if (grid[i][j] > 0) {
                            totalGold += grid[i][j];
                            goldCells++;
                        }
                    }
                }
                
                const totalCells = rows * cols;
                const coverage = Math.round((goldCells / totalCells) * 100);
                
                document.getElementById('total-gold').textContent = totalGold;
                document.getElementById('coverage').textContent = `${coverage}%`;
                
                // Update progress bars
                document.getElementById('total-gold-progress').style.width = `${Math.min(100, totalGold / (rows * cols * 9) * 100)}%`;
                document.getElementById('coverage-progress').style.width = `${coverage}%`;
                
                // Update potential max (sum of all gold)
                document.getElementById('potential-max').textContent = totalGold;
            }
            
            // Solve the problem
            function solve() {
                // Show loading indicator
                document.getElementById('grid-loading').classList.remove('hidden');
                document.getElementById('solve-btn').disabled = true;
                
                // Reset any previous path highlighting
                document.querySelectorAll('.gold-cell').forEach(cell => {
                    cell.classList.remove('path-cell', 'bg-yellow-600');
                });
                
                // Make a copy of the grid to work with
                const gridCopy = grid.map(row => [...row]);
                
                let maxGold = 0;
                maxPath = [];
                
                const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                
                function backtrack(i, j, currentGold, path) {
                    if (i < 0 || i >= rows || j < 0 || j >= cols || gridCopy[i][j] === 0) {
                        return;
                    }
                    
                    const goldInCell = gridCopy[i][j];
                    currentGold += goldInCell;
                    const newPath = [...path, [i, j]];
                    
                    if (currentGold > maxGold) {
                        maxGold = currentGold;
                        maxPath = newPath;
                    }
                    
                    const temp = gridCopy[i][j];
                    gridCopy[i][j] = 0; // Mark as visited
                    
                    for (const [di, dj] of directions) {
                        backtrack(i + di, j + dj, currentGold, newPath);
                    }
                    
                    gridCopy[i][j] = temp; // Backtrack
                }
                
                // Use setTimeout to allow UI to update before heavy computation
                setTimeout(() => {
                    for (let i = 0; i < rows; i++) {
                        for (let j = 0; j < cols; j++) {
                            if (gridCopy[i][j] !== 0) {
                                backtrack(i, j, 0, []);
                            }
                        }
                    }
                    
                    // Display results
                    displayResults(maxGold, maxPath);
                    
                    // Hide loading indicator
                    document.getElementById('grid-loading').classList.add('hidden');
                    document.getElementById('solve-btn').disabled = false;
                }, 100);
            }
            
            // Display results
            function displayResults(maxGold, path) {
                document.getElementById('max-gold').textContent = maxGold;
                document.getElementById('max-gold').classList.add('animate__rubberBand');
                
                // Calculate efficiency
                const totalGold = parseInt(document.getElementById('total-gold').textContent);
                const efficiency = totalGold > 0 ? Math.round((maxGold / totalGold) * 100) : 0;
                document.getElementById('efficiency').textContent = `Efficiency: ${efficiency}%`;
                
                if (path.length > 0) {
                    document.getElementById('path').innerHTML = `
                        <span class="text-yellow-200">Path length:</span> ${path.length} cells
                        <span class="text-gray-500 text-sm ml-2">(avg ${(maxGold / path.length).toFixed(1)} gold/cell)</span>
                    `;
                    
                    // Update path start and end
                    const start = path[0];
                    const end = path[path.length - 1];
                    document.getElementById('path-start').textContent = `(${start[0]}, ${start[1]}) [${grid[start[0]][start[1]]}]`;
                    document.getElementById('path-end').textContent = `(${end[0]}, ${end[1]}) [${grid[end[0]][end[1]]}]`;
                    
                    // Update path length stat
                    document.getElementById('path-length').textContent = path.length;
                    document.getElementById('path-length-progress').style.width = `${Math.min(100, (path.length / (rows * cols)) * 100)}%`;
                    
                    // Visualize path
                    const pathVisual = document.getElementById('path-visual');
                    pathVisual.innerHTML = '';
                    
                    path.forEach(([i, j], index) => {
                        const step = document.createElement('div');
                        step.className = 'bg-yellow-600 text-white rounded-lg w-10 h-10 flex flex-col items-center justify-center text-xs font-bold cursor-pointer tooltip transition-all hover:bg-yellow-500';
                        step.innerHTML = `
                            <div class="text-[10px] text-yellow-200">${index+1}</div>
                            <div class="text-sm">${grid[i][j]}</div>
                        `;
                        step.title = `Step ${index + 1}: (${i}, ${j})\nGold: ${grid[i][j]}`;
                        step.addEventListener('click', () => {
                            highlightCell(i, j);
                        });
                        pathVisual.appendChild(step);
                        
                        if (index < path.length - 1) {
                            const arrow = document.createElement('div');
                            arrow.className = 'text-yellow-400 flex items-center text-xs';
                            arrow.innerHTML = '→';
                            pathVisual.appendChild(arrow);
                        }
                    });
                    
                    // Show animate button
                    document.getElementById('animate-path').classList.remove('opacity-0');
                    
                    // Highlight path on grid
                    highlightPath(path);
                } else {
                    document.getElementById('path').textContent = 'No valid path found';
                    document.getElementById('path-visual').innerHTML = '<div class="text-sm text-gray-500 text-center w-full"><i class="fas fa-exclamation-triangle mr-1"></i> No valid path to display</div>';
                    document.getElementById('path-start').textContent = '-';
                    document.getElementById('path-end').textContent = '-';
                    document.getElementById('path-length').textContent = '0';
                    document.getElementById('path-length-progress').style.width = '0%';
                }
                
                // Add to history
                if (path.length > 0) {
                    addToHistory(maxGold, path.length);
                }
                
                // Remove animation class after it completes
                setTimeout(() => {
                    document.getElementById('max-gold').classList.remove('animate__rubberBand');
                }, 1000);
            }
            
            // Highlight a specific cell
            function highlightCell(row, col) {
                // Reset all highlights first
                document.querySelectorAll('.gold-cell').forEach(cell => {
                    cell.classList.remove('ring-2', 'ring-offset-2', 'ring-yellow-400');
                });
                
                // Highlight the selected cell
                const cell = document.querySelector(`.gold-cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add('ring-2', 'ring-offset-2', 'ring-yellow-400');
                    cell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                }
            }
            
            // Highlight the entire path
            function highlightPath(path) {
                path.forEach(([i, j], index) => {
                    setTimeout(() => {
                        const cell = document.querySelector(`.gold-cell[data-row="${i}"][data-col="${j}"]`);
                        if (cell) {
                            cell.classList.add('path-cell', 'bg-yellow-600');
                            
                            // Add coin animation to the cell
                            const coin = document.createElement('div');
                            coin.className = 'coin-animation absolute -top-1 -right-1 text-yellow-300 text-xs';
                            coin.innerHTML = '🪙';
                            cell.appendChild(coin);
                            
                            // Remove coin after animation
                            setTimeout(() => {
                                coin.remove();
                            }, 1000);
                        }
                    }, index * 100);
                });
            }
            
            // Animate the path
            function animatePath() {
                // Reset all path highlights first
                document.querySelectorAll('.gold-cell').forEach(cell => {
                    cell.classList.remove('path-cell', 'bg-yellow-600');
                });
                
                // Animate each cell in sequence
                maxPath.forEach(([i, j], index) => {
                    setTimeout(() => {
                        const cell = document.querySelector(`.gold-cell[data-row="${i}"][data-col="${j}"]`);
                        if (cell) {
                            cell.classList.add('path-cell', 'bg-yellow-600');
                            
                            // Scroll to keep cell visible
                            if (index % 5 === 0) {
                                cell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                            }
                        }
                    }, index * 300);
                });
            }
            
            // Add solution to history
            function addToHistory(gold, length) {
                // Limit history to 3 items
                if (history.length >= 3) {
                    history.pop();
                }
                
                history.unshift({ gold, length, timestamp: new Date() });
                renderHistory();
            }
            
            // Render history list
            function renderHistory() {
                const historyList = document.getElementById('history-list');
                historyList.innerHTML = '';
                
                if (history.length === 0) {
                    historyList.innerHTML = '<div class="text-sm text-gray-500 italic">No history yet</div>';
                    return;
                }
                
                history.forEach((item, index) => {
                    const time = item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const entry = document.createElement('div');
                    entry.className = 'bg-gray-800 p-2 rounded-lg border border-gray-700 flex justify-between items-center';
                    entry.innerHTML = `
                        <div class="flex items-center">
                            <div class="bg-yellow-900 text-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">${index + 1}</div>
                            <div>
                                <div class="text-yellow-400 font-medium">${item.gold} <span class="text-yellow-600 text-xs">gold</span></div>
                                <div class="text-gray-500 text-xs">${item.length} cells</div>
                            </div>
                        </div>
                        <div class="text-gray-500 text-xs">${time}</div>
                    `;
                    historyList.appendChild(entry);
                });
            }
            
            // Tutorial navigation
            function showStep(step) {
                document.querySelectorAll('.tutorial-step').forEach(el => {
                    el.classList.remove('active');
                });
                
                const stepEl = document.querySelector(`.tutorial-step[data-step="${step}"]`);
                if (stepEl) {
                    stepEl.classList.add('active');
                }
                
                currentStep = step;
            }
            
            // Event listeners
            document.getElementById('random-grid').addEventListener('click', initGrid);
            document.getElementById('solve-btn').addEventListener('click', solve);
            document.getElementById('reset-btn').addEventListener('click', function() {
                document.querySelectorAll('.gold-cell').forEach(cell => {
                    cell.classList.remove('path-cell', 'bg-yellow-600', 'ring-2', 'ring-offset-2', 'ring-yellow-400');
                });
                document.getElementById('max-gold').textContent = '0';
                document.getElementById('path').textContent = 'No path calculated yet';
                document.getElementById('path-visual').innerHTML = '<div class="text-sm text-gray-500 text-center w-full"><i class="fas fa-mouse-pointer mr-1"></i> Click "Find Max Path" to visualize</div>';
                document.getElementById('path-start').textContent = '-';
                document.getElementById('path-end').textContent = '-';
                document.getElementById('animate-path').classList.add('opacity-0');
                document.getElementById('path-length').textContent = '0';
                document.getElementById('path-length-progress').style.width = '0%';
                document.getElementById('efficiency').textContent = 'Efficiency: 0%';
            });
            
            document.getElementById('clear-grid').addEventListener('click', function() {
                grid = Array.from({ length: rows }, () => Array(cols).fill(0));
                renderGrid();
                updateStats();
            });
            
            document.getElementById('resize-btn').addEventListener('click', function() {
                rows = parseInt(document.getElementById('rows').value) || 3;
                cols = parseInt(document.getElementById('cols').value) || 3;
                
                // Clamp values between 1 and 15
                rows = Math.max(1, Math.min(15, rows));
                cols = Math.max(1, Math.min(15, cols));
                
                document.getElementById('rows').value = rows;
                document.getElementById('cols').value = cols;
                
                initGrid();
            });
            
            document.getElementById('animate-path').addEventListener('click', animatePath);
            
            document.getElementById('gold-density').addEventListener('input', function() {
                document.getElementById('density-value').textContent = `${this.value}%`;
            });
            
            document.getElementById('sample1-btn').addEventListener('click', function() {
                grid = [
                    [0, 6, 0],
                    [5, 8, 7],
                    [0, 9, 0]
                ];
                rows = 3;
                cols = 3;
                document.getElementById('rows').value = rows;
                document.getElementById('cols').value = cols;
                renderGrid();
                updateStats();
            });
            
            document.getElementById('sample2-btn').addEventListener('click', function() {
                grid = [
                    [1, 0, 7, 0],
                    [2, 0, 6, 0],
                    [3, 4, 5, 0],
                    [0, 3, 0, 9]
                ];
                rows = 4;
                cols = 4;
                document.getElementById('rows').value = rows;
                document.getElementById('cols').value = cols;
                renderGrid();
                updateStats();
            });
            
            document.getElementById('next-step').addEventListener('click', function() {
                if (currentStep < totalSteps) {
                    showStep(currentStep + 1);
                }
            });
            
            document.getElementById('prev-step').addEventListener('click', function() {
                if (currentStep > 1) {
                    showStep(currentStep - 1);
                }
            });
            
            document.getElementById('try-it').addEventListener('click', function() {
                showStep(1);
                document.getElementById('sample1-btn').click();
            });
            
            // Initialize with example grid
            grid = [
                [0, 6, 0],
                [5, 8, 7],
                [0, 9, 0]
            ];
            rows = 3;
            cols = 3;
            document.getElementById('rows').value = rows;
            document.getElementById('cols').value = cols;
            renderGrid();
            updateStats();
            showStep(1);
        });
   