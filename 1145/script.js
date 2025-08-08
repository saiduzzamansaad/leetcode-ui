document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const treeInput = document.getElementById('treeInput');
    const treePreset = document.getElementById('treePreset');
    const xInput = document.getElementById('xInput');
    const ySelect = document.getElementById('ySelect');
    const solveBtn = document.getElementById('solveBtn');
    const simulateBtn = document.getElementById('simulateBtn');
    const hintBtn = document.getElementById('hintBtn');
    const resetBtn = document.getElementById('resetBtn');
    const treeContainer = document.getElementById('treeContainer');
    const emptyState = document.getElementById('emptyState');
    const resultDiv = document.getElementById('result');
    const exampleBtn = document.getElementById('exampleBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');
    const loadExampleBtns = document.querySelectorAll('.load-example-btn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const setupTab = document.getElementById('setupTab');
    const simulationTab = document.getElementById('simulationTab');
    const analysisTab = document.getElementById('analysisTab');
    const setupContent = document.getElementById('setupContent');
    const simulationContent = document.getElementById('simulationContent');
    const analysisContent = document.getElementById('analysisContent');
    const redProgress = document.getElementById('redProgress');
    const blueProgress = document.getElementById('blueProgress');
    const redCount = document.getElementById('redCount');
    const blueCount = document.getElementById('blueCount');
    const moveCounter = document.getElementById('moveCounter');
    const pauseBtn = document.getElementById('pauseBtn');
    const stepBtn = document.getElementById('stepBtn');
    const speedUpBtn = document.getElementById('speedUpBtn');
    const gameSpeed = document.getElementById('gameSpeed');
    const leftSize = document.getElementById('leftSize');
    const rightSize = document.getElementById('rightSize');
    const parentSize = document.getElementById('parentSize');
    const optimalMoves = document.getElementById('optimalMoves');
    const analysisText = document.getElementById('analysisText');
    const customTreeContainer = document.getElementById('customTreeContainer');

    // Game state
    let tree = null;
    let n = 0;
    let x = 0;
    let y = 0;
    let gameState = {};
    let gameInterval = null;
    let currentSpeed = 500;
    let zoomLevel = 1;
    let gameHistory = JSON.parse(localStorage.getItem('btcgHistory')) || [];

    // Initialize
    renderHistory();
    updateTree();

    // Event listeners
    treeInput.addEventListener('change', updateTree);
    treePreset.addEventListener('change', function() {
        if (this.value === 'custom') {
            customTreeContainer.classList.remove('hidden');
            treeInput.value = '';
        } else {
            customTreeContainer.classList.add('hidden');
            loadPreset(this.value);
        }
        updateTree();
    });
    xInput.addEventListener('change', updateTree);
    solveBtn.addEventListener('click', solveProblem);
    simulateBtn.addEventListener('click', simulateGame);
    hintBtn.addEventListener('click', showHint);
    resetBtn.addEventListener('click', resetGame);
    ySelect.addEventListener('change', function() {
        y = parseInt(this.value);
        updateTreeVisualization();
    });
    exampleBtn.addEventListener('click', loadRandomExample);
    clearHistoryBtn.addEventListener('click', clearHistory);
    zoomInBtn.addEventListener('click', () => zoomTree(1.2));
    zoomOutBtn.addEventListener('click', () => zoomTree(0.8));
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    setupTab.addEventListener('click', () => switchTab('setup'));
    simulationTab.addEventListener('click', () => switchTab('simulation'));
    analysisTab.addEventListener('click', () => switchTab('analysis'));
    pauseBtn.addEventListener('click', pauseGame);
    stepBtn.addEventListener('click', stepGame);
    speedUpBtn.addEventListener('click', speedUpGame);
    gameSpeed.addEventListener('change', function() {
        currentSpeed = parseInt(this.value);
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = setInterval(animateGame, currentSpeed);
        }
    });

    // Load example buttons
    loadExampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const treeData = this.getAttribute('data-tree');
            const xVal = this.getAttribute('data-x');
            const yVal = this.getAttribute('data-y');
            
            treePreset.value = 'custom';
            customTreeContainer.classList.remove('hidden');
            treeInput.value = treeData;
            xInput.value = xVal;
            ySelect.value = yVal;
            
            updateTree();
        });
    });

    // Tree node class
    class TreeNode {
        constructor(val, left = null, right = null) {
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }

    // Build tree from array
    function buildTree(arr, i = 0) {
        if (i >= arr.length || arr[i] === null || arr[i] === 'null') return null;
        const root = new TreeNode(parseInt(arr[i]));
        root.left = buildTree(arr, 2 * i + 1);
        root.right = buildTree(arr, 2 * i + 2);
        return root;
    }

    // Update tree visualization
    function updateTree() {
        try {
            const arr = treeInput.value.split(',').map(item => item.trim() === 'null' ? null : parseInt(item.trim()));
            n = arr.filter(item => item !== null).length;
            x = parseInt(xInput.value);
            tree = buildTree(arr);
            
            // Update y select options
            ySelect.innerHTML = '<option value="">Select a node</option>';
            for (let i = 0; i < arr.length; i++) {
                const val = arr[i];
                if (val !== null && val !== x) {
                    ySelect.innerHTML += `<option value="${val}">${val}</option>`;
                }
            }
            
            y = ySelect.value ? parseInt(ySelect.value) : 0;
            updateTreeVisualization();
            
            // Hide empty state if tree is loaded
            if (tree) {
                emptyState.classList.add('hidden');
            } else {
                emptyState.classList.remove('hidden');
            }
            
            // Reset results
            resultDiv.classList.add('hidden');
            switchTab('setup');
        } catch (e) {
            console.error("Error building tree:", e);
            showResult("Invalid tree input. Please check your node values.", "red");
            emptyState.classList.remove('hidden');
        }
    }

    // Update tree visualization
    function updateTreeVisualization() {
        treeContainer.innerHTML = '';
        if (!tree) return;
        
        // Calculate node positions
        const levels = Math.ceil(Math.log2(n + 1));
        const nodePositions = {};
        const nodeElements = {};
        const containerWidth = treeContainer.clientWidth;
        const containerHeight = treeContainer.clientHeight;
        
        function calculatePositions(node, level, pos, leftOffset, rightOffset) {
            if (!node) return;
            
            const spacing = (rightOffset - leftOffset) / 2;
            const xPos = leftOffset + spacing;
            const yPos = level * (containerHeight / (levels + 1)) + 40;
            
            nodePositions[node.val] = { x: xPos, y: yPos };
            
            calculatePositions(node.left, level + 1, pos * 2, leftOffset, xPos);
            calculatePositions(node.right, level + 1, pos * 2 + 1, xPos, rightOffset);
        }
        
        calculatePositions(tree, 0, 1, 0, containerWidth);
        
        // Draw connectors first
        function drawConnectors(node) {
            if (!node) return;
            
            if (node.left && nodePositions[node.left.val]) {
                const from = nodePositions[node.val];
                const to = nodePositions[node.left.val];
                drawLine(from.x, from.y, to.x, to.y);
                drawConnectors(node.left);
            }
            
            if (node.right && nodePositions[node.right.val]) {
                const from = nodePositions[node.val];
                const to = nodePositions[node.right.val];
                drawLine(from.x, from.y, to.x, to.y);
                drawConnectors(node.right);
            }
        }
        
        drawConnectors(tree);
        
        // Create node elements
        function createNodeElements(node) {
            if (!node) return;
            
            const nodeEl = document.createElement('div');
            nodeEl.className = 'tree-node absolute w-10 h-10 rounded-full flex items-center justify-center font-medium cursor-pointer border-2 border-gray-700 shadow-md';
            nodeEl.textContent = node.val;
            nodeEl.style.left = `${nodePositions[node.val].x - 20}px`;
            nodeEl.style.top = `${nodePositions[node.val].y - 20}px`;
            nodeEl.style.transform = `scale(${zoomLevel})`;
            
            // Set node colors based on game state or initial selection
            if (gameState.redNodes && gameState.redNodes.has(node.val)) {
                nodeEl.classList.add('red');
            } else if (gameState.blueNodes && gameState.blueNodes.has(node.val)) {
                nodeEl.classList.add('blue');
            } else if (node.val === x) {
                nodeEl.classList.add('red', 'highlight');
            } else if (node.val === y) {
                nodeEl.classList.add('blue', 'highlight');
            }
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap';
            tooltip.textContent = `Node ${node.val}`;
            nodeEl.appendChild(tooltip);
            nodeEl.classList.add('has-tooltip', 'relative');
            
            // Add click handler for y selection
            nodeEl.addEventListener('click', function() {
                if (node.val !== x) {
                    ySelect.value = node.val;
                    y = node.val;
                    updateTreeVisualization();
                }
            });
            
            treeContainer.appendChild(nodeEl);
            nodeElements[node.val] = nodeEl;
            
            createNodeElements(node.left);
            createNodeElements(node.right);
        }
        
        createNodeElements(tree);
        
        // Update analysis tab if active
        if (analysisContent.classList.contains('hidden') === false) {
            updateAnalysis();
        }
    }

    // Draw line between nodes
    function drawLine(x1, y1, x2, y2) {
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        const line = document.createElement('div');
        line.className = 'connector';
        line.style.width = `${length}px`;
        line.style.height = '2px';
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}deg) scaleX(${zoomLevel})`;
        
        treeContainer.appendChild(line);
    }

    // Solve the problem
    function solveProblem() {
        if (!tree || !x) {
            showResult("Please select a node for the first player (Red)", "red");
            return;
        }
        
        const result = btreeGameWinningMove(tree, n, x);
        showResult(result ? 
            `Second player (Blue) can win! Choose a node adjacent to ${x} that partitions the tree.` : 
            `Second player (Blue) cannot guarantee a win with x = ${x}.`, 
            result ? "green" : "red");
        
        // Highlight potential winning moves
        highlightWinningMoves();
        
        // Update analysis tab
        updateAnalysis();
        switchTab('analysis');
    }

    // Binary tree game winning move algorithm
    function btreeGameWinningMove(root, n, x) {
        let leftCount = 0, rightCount = 0;
        
        function countNodes(node) {
            if (!node) return 0;
            const left = countNodes(node.left);
            const right = countNodes(node.right);
            if (node.val === x) {
                leftCount = left;
                rightCount = right;
            }
            return left + right + 1;
        }
        
        countNodes(root);
        const parentCount = n - leftCount - rightCount - 1;
        const max = Math.max(parentCount, leftCount, rightCount);
        return max > n / 2;
    }

    // Highlight winning moves
    function highlightWinningMoves() {
        if (!tree || !x) return;
        
        // Find the x node
        const xNode = findNode(tree, x);
        if (!xNode) return;
        
        // Calculate subtree sizes
        const leftSize = countNodes(xNode.left);
        const rightSize = countNodes(xNode.right);
        const parentSize = n - leftSize - rightSize - 1;
        
        // Find parent node
        const parentNode = findParent(tree, x);
        
        // Highlight potential winning moves
        const nodes = treeContainer.querySelectorAll('.tree-node');
        nodes.forEach(nodeEl => {
            const val = parseInt(nodeEl.textContent);
            nodeEl.classList.remove('highlight');
            
            // Highlight parent if it's a winning move
            if (parentNode && val === parentNode.val && parentSize > n / 2) {
                nodeEl.classList.add('highlight');
            }
            
            // Highlight left child if it's a winning move
            if (xNode.left && val === xNode.left.val && leftSize > n / 2) {
                nodeEl.classList.add('highlight');
            }
            
            // Highlight right child if it's a winning move
            if (xNode.right && val === xNode.right.val && rightSize > n / 2) {
                nodeEl.classList.add('highlight');
            }
        });
    }

    // Count nodes in subtree
    function countNodes(node) {
        if (!node) return 0;
        return 1 + countNodes(node.left) + countNodes(node.right);
    }

    // Find node by value
    function findNode(root, val) {
        if (!root) return null;
        if (root.val === val) return root;
        return findNode(root.left, val) || findNode(root.right, val);
    }

    // Find parent of node
    function findParent(root, val, parent = null) {
        if (!root) return null;
        if (root.val === val) return parent;
        return findParent(root.left, val, root) || findParent(root.right, val, root);
    }

    // Show hint
    function showHint() {
        if (!tree || !x) {
            showResult("Please select a node for the first player (Red)", "red");
            return;
        }
        
        const xNode = findNode(tree, x);
        if (!xNode) return;
        
        const leftSize = countNodes(xNode.left);
        const rightSize = countNodes(xNode.right);
        const parentSize = n - leftSize - rightSize - 1;
        
        let hint = "";
        if (parentSize > n / 2) {
            const parentNode = findParent(tree, x);
            hint = `Select node ${parentNode.val} (parent of ${x}) to control ${parentSize} nodes.`;
        } else if (leftSize > n / 2) {
            hint = `Select node ${xNode.left.val} (left child of ${x}) to control ${leftSize} nodes.`;
        } else if (rightSize > n / 2) {
            hint = `Select node ${xNode.right.val} (right child of ${x}) to control ${rightSize} nodes.`;
        } else {
            hint = `No guaranteed winning move. The largest subtree has ${Math.max(parentSize, leftSize, rightSize)} nodes (need > ${Math.floor(n/2)}).`;
        }
        
        showResult(hint, "blue");
        highlightWinningMoves();
    }

    // Show result message
    function showResult(message, type) {
        resultDiv.classList.remove('hidden', 'bg-red-100', 'bg-green-100', 'bg-blue-100');
        resultDiv.className = `mt-4 p-4 rounded-lg animate__animated animate__fadeInUp bg-${type}-100 text-${type}-800`;
        resultDiv.innerHTML = message;
    }

    // Simulate game
    function simulateGame() {
        if (!tree || !x) {
            showResult("Please select a node for the first player (Red)", "red");
            return;
        }
        
        if (!y) {
            showResult("Please select a node for the second player (Blue)", "blue");
            return;
        }
        
        // Initialize game state
        gameState = {
            redNodes: new Set([x]),
            blueNodes: new Set([y]),
            currentPlayer: 'red', // red starts first
            moves: 0,
            gameOver: false,
            lastPassed: false,
            speed: currentSpeed
        };
        
        // Update UI
        updateGameVisualization();
        switchTab('simulation');
        
        // Start game loop
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(animateGame, gameState.speed);
    }

    // Animate game
    function animateGame() {
        if (gameState.gameOver) {
            clearInterval(gameInterval);
            return;
        }
        
        const availableMoves = findAvailableMoves();
        if (availableMoves.length === 0) {
            // Current player must pass
            gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
            
            // Check if both players passed consecutively
            if (gameState.moves > 0 && gameState.lastPassed) {
                endGame();
                return;
            }
            
            gameState.lastPassed = true;
            gameState.moves++;
            updateMoveCounter();
            setTimeout(animateGame, gameState.speed);
            return;
        }
        
        gameState.lastPassed = false;
        
        // For simulation, pick a random available move
        const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        
        // Add to current player's nodes
        if (gameState.currentPlayer === 'red') {
            gameState.redNodes.add(move);
        } else {
            gameState.blueNodes.add(move);
        }
        
        // Update visualization
        updateGameVisualization();
        
        // Switch player
        gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
        gameState.moves++;
        updateMoveCounter();
    }

    // Find available moves
    function findAvailableMoves() {
        const available = [];
        const coloredNodes = gameState.currentPlayer === 'red' ? gameState.redNodes : gameState.blueNodes;
        const allColored = new Set([...gameState.redNodes, ...gameState.blueNodes]);
        
        // Find all uncolored neighbors of colored nodes
        coloredNodes.forEach(val => {
            const node = findNode(tree, val);
            if (!node) return;
            
            // Check parent
            const parent = findParent(tree, val);
            if (parent && !allColored.has(parent.val)) {
                available.push(parent.val);
            }
            
            // Check left child
            if (node.left && !allColored.has(node.left.val)) {
                available.push(node.left.val);
            }
            
            // Check right child
            if (node.right && !allColored.has(node.right.val)) {
                available.push(node.right.val);
            }
        });
        
        return [...new Set(available)]; // Remove duplicates
    }

    // Update game visualization
    function updateGameVisualization() {
        const nodes = treeContainer.querySelectorAll('.tree-node');
        nodes.forEach(nodeEl => {
            const val = parseInt(nodeEl.textContent);
            nodeEl.className = 'tree-node absolute w-10 h-10 rounded-full flex items-center justify-center font-medium cursor-pointer border-2 border-gray-700 shadow-md';
            nodeEl.style.transform = `scale(${zoomLevel})`;
            
            if (gameState.redNodes.has(val)) {
                nodeEl.classList.add('red');
            } else if (gameState.blueNodes.has(val)) {
                nodeEl.classList.add('blue');
            }
            
            // Highlight the last move
            if (val === [...gameState.redNodes].pop() || val === [...gameState.blueNodes].pop()) {
                nodeEl.classList.add('highlight');
            } else {
                nodeEl.classList.remove('highlight');
            }
        });
        
        // Update progress bars
        const redCount = gameState.redNodes.size;
        const blueCount = gameState.blueNodes.size;
        const total = redCount + blueCount;
        
        redProgress.style.width = `${(redCount / total) * 100}%`;
        blueProgress.style.width = `${(blueCount / total) * 100}%`;
        
        // Update counts
        document.getElementById('redCount').textContent = `${redCount} nodes`;
        document.getElementById('blueCount').textContent = `${blueCount} nodes`;
    }

    // Update move counter
    function updateMoveCounter() {
        moveCounter.textContent = `Move ${gameState.moves} (${gameState.currentPlayer === 'red' ? 'Red' : 'Blue'}'s turn)`;
    }

    // End game
    function endGame() {
        gameState.gameOver = true;
        
        const redCount = gameState.redNodes.size;
        const blueCount = gameState.blueNodes.size;
        
        // Add to history
        addToHistory(redCount, blueCount);
        
        // Show result
        resultDiv.classList.remove('hidden');
        
        if (blueCount > redCount) {
            resultDiv.className = 'mt-4 p-4 rounded-lg bg-blue-100 text-blue-800 animate__animated animate__bounceIn';
            resultDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-trophy text-yellow-600 mr-2"></i>
                    <strong>Second player (Blue) wins!</strong>
                </div>
                <p class="mt-1">Blue colored ${blueCount} nodes vs Red's ${redCount} nodes.</p>
            `;
        } else if (redCount > blueCount) {
            resultDiv.className = 'mt-4 p-4 rounded-lg bg-red-100 text-red-800 animate__animated animate__bounceIn';
            resultDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-trophy text-yellow-600 mr-2"></i>
                    <strong>First player (Red) wins!</strong>
                </div>
                <p class="mt-1">Red colored ${redCount} nodes vs Blue's ${blueCount} nodes.</p>
            `;
        } else {
            resultDiv.className = 'mt-4 p-4 rounded-lg bg-yellow-100 text-yellow-800 animate__animated animate__bounceIn';
            resultDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-handshake text-yellow-600 mr-2"></i>
                    <strong>It's a tie!</strong>
                </div>
                <p class="mt-1">Both players colored ${redCount} nodes.</p>
            `;
        }
    }

    // Pause game
    function pauseGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
            pauseBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Resume';
        } else {
            gameInterval = setInterval(animateGame, gameState.speed);
            pauseBtn.innerHTML = '<i class="fas fa-pause mr-2"></i> Pause';
        }
    }

    // Step through game
    function stepGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
            pauseBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Resume';
        }
        animateGame();
    }

    // Speed up game
    function speedUpGame() {
        gameState.speed = Math.max(100, gameState.speed - 100);
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = setInterval(animateGame, gameState.speed);
        }
        showResult(`Game speed increased to ${1000/gameState.speed}x`, "indigo");
    }

    // Reset game
    function resetGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        gameState = {};
        ySelect.value = '';
        y = 0;
        updateTreeVisualization();
        resultDiv.classList.add('hidden');
        switchTab('setup');
        
        // Reset progress bars
        redProgress.style.width = '0%';
        blueProgress.style.width = '0%';
        redCount.textContent = '0 nodes';
        blueCount.textContent = '0 nodes';
        moveCounter.textContent = 'Move 0';
    }

    // Add game to history
    function addToHistory(redCount, blueCount) {
        const winner = blueCount > redCount ? 'blue' : redCount > blueCount ? 'red' : 'tie';
        const treeStr = treeInput.value;
        const xVal = xInput.value;
        const yVal = ySelect.value;
        
        const historyItem = {
            date: new Date().toLocaleString(),
            tree: treeStr,
            x: xVal,
            y: yVal,
            redCount,
            blueCount,
            winner
        };
        
        gameHistory.unshift(historyItem);
        if (gameHistory.length > 10) gameHistory.pop();
        
        localStorage.setItem('btcgHistory', JSON.stringify(gameHistory));
        renderHistory();
    }

    // Render history
    function renderHistory() {
        if (gameHistory.length === 0) {
            emptyHistory.classList.remove('hidden');
            historyList.innerHTML = '';
            return;
        }
        
        emptyHistory.classList.add('hidden');
        historyList.innerHTML = '';
        
        gameHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition history-item cursor-pointer';
            historyItem.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                        <div class="w-6 h-6 rounded-full ${item.winner === 'blue' ? 'bg-blue-100 text-blue-600' : item.winner === 'red' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'} flex items-center justify-center mr-2">
                            <i class="fas ${item.winner === 'blue' ? 'fa-check' : item.winner === 'red' ? 'fa-times' : 'fa-equals'} text-xs"></i>
                        </div>
                        <span class="text-sm font-medium">Game ${index + 1}</span>
                    </div>
                    <span class="text-xs text-gray-500">${item.date}</span>
                </div>
                <div class="flex justify-between text-xs mb-2">
                    <span class="text-red-500">Red: ${item.x}</span>
                    <span class="text-blue-500">Blue: ${item.y}</span>
                </div>
                <div class="flex justify-between text-xs mb-3">
                    <span>${item.redCount} nodes</span>
                    <span>${item.blueCount} nodes</span>
                </div>
                <button class="load-history-btn w-full py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition" 
                        data-tree="${item.tree}" data-x="${item.x}" data-y="${item.y}">
                    <i class="fas fa-redo mr-1"></i> Replay
                </button>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Add event listeners to history items
        document.querySelectorAll('.load-history-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const treeData = this.getAttribute('data-tree');
                const xVal = this.getAttribute('data-x');
                const yVal = this.getAttribute('data-y');
                
                treePreset.value = 'custom';
                customTreeContainer.classList.remove('hidden');
                treeInput.value = treeData;
                xInput.value = xVal;
                ySelect.value = yVal;
                
                updateTree();
            });
        });
    }

    // Clear history
    function clearHistory() {
        gameHistory = [];
        localStorage.setItem('btcgHistory', JSON.stringify(gameHistory));
        renderHistory();
    }

    // Zoom tree
    function zoomTree(factor) {
        zoomLevel = Math.max(0.5, Math.min(2, zoomLevel * factor));
        updateTreeVisualization();
    }

    // Toggle fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            treeContainer.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Switch tabs
    function switchTab(tab) {
        setupTab.classList.remove('tab-active');
        simulationTab.classList.remove('tab-active');
        analysisTab.classList.remove('tab-active');
        setupContent.classList.add('hidden');
        simulationContent.classList.add('hidden');
        analysisContent.classList.add('hidden');
        
        switch(tab) {
            case 'setup':
                setupTab.classList.add('tab-active');
                setupContent.classList.remove('hidden');
                break;
            case 'simulation':
                simulationTab.classList.add('tab-active');
                simulationContent.classList.remove('hidden');
                break;
            case 'analysis':
                analysisTab.classList.add('tab-active');
                analysisContent.classList.remove('hidden');
                updateAnalysis();
                break;
        }
    }

    // Update analysis tab
    function updateAnalysis() {
        if (!tree || !x) return;
        
        const xNode = findNode(tree, x);
        if (!xNode) return;
        
        const leftCount = countNodes(xNode.left);
        const rightCount = countNodes(xNode.right);
        const parentCount = n - leftCount - rightCount - 1;
        
        leftSize.textContent = leftCount;
        rightSize.textContent = rightCount;
        parentSize.textContent = parentCount;
        
        const max = Math.max(parentCount, leftCount, rightCount);
        const canWin = max > n / 2;
        
        // Update optimal moves
        optimalMoves.innerHTML = '';
        const parentNode = findParent(tree, x);
        
        if (parentNode && parentCount > n / 2) {
            addOptimalMove(parentNode.val, 'parent', parentCount);
        }
        
        if (xNode.left && leftCount > n / 2) {
            addOptimalMove(xNode.left.val, 'left child', leftCount);
        }
        
        if (xNode.right && rightCount > n / 2) {
            addOptimalMove(xNode.right.val, 'right child', rightCount);
        }
        
        if (optimalMoves.children.length === 0) {
            optimalMoves.innerHTML = '<div class="text-gray-500 text-sm py-2">No guaranteed winning moves</div>';
        }
        
        // Update analysis text
        analysisText.innerHTML = canWin ?
            `Second player can win by selecting a node that partitions the tree such that they control > ${Math.floor(n/2)} nodes.` :
            `Second player cannot guarantee a win. The largest subtree has ${max} nodes (needs > ${Math.floor(n/2)}).`;
    }

    // Add optimal move to analysis
    function addOptimalMove(val, relation, count) {
        const moveEl = document.createElement('div');
        moveEl.className = 'flex items-center justify-between py-2 border-b border-gray-100';
        moveEl.innerHTML = `
            <div class="flex items-center">
                <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <i class="fas fa-arrow-right text-blue-600 text-xs"></i>
                </div>
                <div>
                    <div class="font-medium">Node ${val}</div>
                    <div class="text-xs text-gray-500">${relation} of ${x}</div>
                </div>
            </div>
            <div class="text-sm font-medium">${count} nodes</div>
        `;
        optimalMoves.appendChild(moveEl);
    }

    // Load preset tree
    function loadPreset(preset) {
        switch(preset) {
            case 'balanced':
                treeInput.value = '1,2,3,4,5,6,7';
                xInput.value = '3';
                break;
            case 'left-heavy':
                treeInput.value = '1,2,3,4,5,null,null,8,9';
                xInput.value = '2';
                break;
            case 'right-heavy':
                treeInput.value = '1,null,3,null,null,6,7';
                xInput.value = '3';
                break;
            case 'large':
                treeInput.value = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15';
                xInput.value = '7';
                break;
        }
    }

    // Load random example
    function loadRandomExample() {
        const examples = [
            {tree: '1,2,3,4,5,6,7', x: '3', y: '1'},
            {tree: '1,2,3,4,5,null,null,8,9', x: '2', y: '4'},
            {tree: '1,null,3,null,null,6,7', x: '3', y: '6'},
            {tree: '1,2,3,4,5,6,7,8,9,10,11', x: '3', y: '2'}
        ];
        
        const example = examples[Math.floor(Math.random() * examples.length)];
        treePreset.value = 'custom';
        customTreeContainer.classList.remove('hidden');
        treeInput.value = example.tree;
        xInput.value = example.x;
        ySelect.value = example.y;
        
        updateTree();
    }
});
