
        // Global variables
        let cashier;
        let products = [];
        let prices = [];
        let cart = [];
        let transactionHistory = [];
        let stats = {
            totalRevenue: 0,
            totalDiscounts: 0,
            totalProductsSold: 0,
            totalTransactions: 0
        };
        
        // DOM Elements
        const productListEl = document.getElementById('productList');
        const inventoryItemsEl = document.getElementById('inventoryItems');
        const cartItemsEl = document.getElementById('cartItems');
        const emptyCartMessageEl = document.getElementById('emptyCartMessage');
        const subtotalEl = document.getElementById('subtotal');
        const discountAmountEl = document.getElementById('discountAmount');
        const totalAmountEl = document.getElementById('totalAmount');
        const customerCounterEl = document.getElementById('customerCounter');
        const discountProgressEl = document.getElementById('discountProgress');
        const discountStatusEl = document.getElementById('discountStatus');
        const transactionHistoryEl = document.getElementById('transactionHistory');
        const checkoutButtonEl = document.getElementById('checkoutButton');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const totalDiscountsEl = document.getElementById('totalDiscounts');
        const avgOrderValueEl = document.getElementById('avgOrderValue');
        const productsSoldEl = document.getElementById('productsSold');
        const confettiContainer = document.getElementById('confetti-container');
        
        // Audio elements
        const scanSound = document.getElementById('scanSound');
        const discountSound = document.getElementById('discountSound');
        const checkoutSound = document.getElementById('checkoutSound');
        
        // Initialize with sample data
        function initializeSampleData() {
            // Sample products
            products = [1, 2, 3, 4, 5, 6, 7];
            prices = [100, 200, 300, 400, 300, 200, 100];
            
            // Render product list
            renderProductList();
            renderInventory();
            
            // Initialize cashier with sample data
            const n = parseInt(document.getElementById('discountFrequency').value);
            const discount = parseInt(document.getElementById('discountPercentage').value);
            cashier = new Cashier(n, discount, products, prices);
        }
        
        // Initialize system with current configuration
        function initializeSystem() {
            const n = parseInt(document.getElementById('discountFrequency').value);
            const discount = parseInt(document.getElementById('discountPercentage').value);
            
            if (products.length === 0) {
                alert("Please add at least one product to initialize the system");
                return;
            }
            
            cashier = new Cashier(n, discount, products, prices);
            
            // Reset counters
            cart = [];
            updateCartUI();
            updateStatsUI();
            
            // Show success message
            showNotification("Quantum Checkout System Initialized!", "System is ready to process transactions with discount every " + n + " customers.", "success");
            
            // Enable checkout button
            checkoutButtonEl.disabled = false;
            
            // Play sound
            checkoutSound.play();
        }
        
        // Add product to the system
        function addProduct() {
            const productId = parseInt(document.getElementById('newProductId').value);
            const productPrice = parseInt(document.getElementById('newProductPrice').value);
            
            if (isNaN(productId) || isNaN(productPrice) || productId <= 0 || productPrice <= 0) {
                alert("Please enter valid product ID and price");
                return;
            }
            
            if (products.includes(productId)) {
                alert("Product ID already exists");
                return;
            }
            
            products.push(productId);
            prices.push(productPrice);
            
            // Clear inputs
            document.getElementById('newProductId').value = '';
            document.getElementById('newProductPrice').value = '';
            
            // Update UI
            renderProductList();
            renderInventory();
            
            // Show notification
            showNotification("Product Added", "Product ID: " + productId + " with price $" + productPrice + " has been added to the system.", "info");
            
            // Play sound
            scanSound.play();
        }
        
        // Render product list in configuration panel
        function renderProductList() {
            productListEl.innerHTML = '';
            
            if (products.length === 0) {
                productListEl.innerHTML = '<p class="text-gray-400 text-center py-4">No products added yet</p>';
                return;
            }
            
            for (let i = 0; i < products.length; i++) {
                const productEl = document.createElement('div');
                productEl.className = 'flex justify-between items-center bg-gray-800 p-3 rounded-lg';
                productEl.innerHTML = `
                    <div>
                        <span class="font-medium text-purple-300">ID: ${products[i]}</span>
                        <span class="text-gray-400 ml-2">Price: $${prices[i]}</span>
                    </div>
                    <button onclick="removeProduct(${i})" class="text-red-400 hover:text-red-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                `;
                productListEl.appendChild(productEl);
            }
        }
        
        // Render inventory items
        function renderInventory() {
            inventoryItemsEl.innerHTML = '';
            
            if (products.length === 0) {
                inventoryItemsEl.innerHTML = '<p class="text-gray-400 text-center py-4 col-span-full">No products in inventory</p>';
                return;
            }
            
            for (let i = 0; i < products.length; i++) {
                const inventoryItemEl = document.createElement('div');
                inventoryItemEl.className = 'bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer group floating';
                inventoryItemEl.innerHTML = `
                    <div class="flex flex-col items-center text-center">
                        <div class="w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-800 transition-colors">
                            <span class="orbitron text-xl text-purple-300">${products[i]}</span>
                        </div>
                        <h3 class="font-medium">Product ${products[i]}</h3>
                        <p class="text-emerald-400 font-bold mt-1">$${prices[i]}</p>
                        <button onclick="addToCart(${products[i]})" class="mt-3 bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            Add to Cart
                        </button>
                    </div>
                `;
                inventoryItemsEl.appendChild(inventoryItemEl);
            }
        }
        
        // Remove product from system
        function removeProduct(index) {
            products.splice(index, 1);
            prices.splice(index, 1);
            renderProductList();
            renderInventory();
            
            // Play sound
            scanSound.play();
        }
        
        // Add product to cart
        function addToCart(productId) {
            // Check if product already in cart
            const existingItem = cart.find(item => item.productId === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    productId: productId,
                    quantity: 1
                });
            }
            
            updateCartUI();
            
            // Play sound
            scanSound.play();
        }
        
        // Update cart quantity
        function updateCartItem(productId, newQuantity) {
            const item = cart.find(item => item.productId === productId);
            
            if (item) {
                if (newQuantity <= 0) {
                    // Remove item if quantity is 0 or less
                    cart = cart.filter(item => item.productId !== productId);
                } else {
                    item.quantity = newQuantity;
                }
            }
            
            updateCartUI();
        }
        
        // Update cart UI
        function updateCartUI() {
            cartItemsEl.innerHTML = '';
            
            if (cart.length === 0) {
                emptyCartMessageEl.style.display = 'block';
                subtotalEl.textContent = '$0.00';
                discountAmountEl.textContent = '$0.00';
                totalAmountEl.textContent = '$0.00';
                return;
            }
            
            emptyCartMessageEl.style.display = 'none';
            
            let subtotal = 0;
            
            for (const item of cart) {
                const productIndex = products.indexOf(item.productId);
                if (productIndex === -1) continue;
                
                const price = prices[productIndex];
                const itemTotal = price * item.quantity;
                subtotal += itemTotal;
                
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'flex justify-between items-center bg-gray-800 p-3 rounded-lg';
                cartItemEl.innerHTML = `
                    <div class="flex items-center">
                        <span class="font-medium text-purple-300 mr-3">ID: ${item.productId}</span>
                        <span class="text-gray-400">$${price} each</span>
                    </div>
                    <div class="flex items-center">
                        <button onclick="updateCartItem(${item.productId}, ${item.quantity - 1})" class="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 flex items-center justify-center rounded-l-md transition-colors">
                            -
                        </button>
                        <span class="bg-gray-800 px-3 py-1">${item.quantity}</span>
                        <button onclick="updateCartItem(${item.productId}, ${item.quantity + 1})" class="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 flex items-center justify-center rounded-r-md transition-colors">
                            +
                        </button>
                        <span class="ml-4 font-medium w-20 text-right">$${itemTotal.toFixed(2)}</span>
                    </div>
                `;
                cartItemsEl.appendChild(cartItemEl);
            }
            
            // Calculate totals
            subtotalEl.textContent = '$' + subtotal.toFixed(2);
            discountAmountEl.textContent = '$0.00';
            totalAmountEl.textContent = '$' + subtotal.toFixed(2);
        }
        
        // Process checkout
        function processCheckout() {
            if (!cashier) {
                alert("Please initialize the system first");
                return;
            }
            
            if (cart.length === 0) {
                alert("Your cart is empty");
                return;
            }
            
            // Prepare data for getBill
            const productIds = cart.map(item => item.productId);
            const amounts = cart.map(item => item.quantity);
            
            // Process bill
            const total = cashier.getBill(productIds, amounts);
            const subtotal = parseFloat(subtotalEl.textContent.substring(1));
            const discountAmount = subtotal - total;
            
            // Update UI with discount if applied
            discountAmountEl.textContent = '-$' + discountAmount.toFixed(2);
            totalAmountEl.textContent = '$' + total.toFixed(2);
            
            // Update customer counter
            customerCounterEl.textContent = cashier.customerCount;
            
            // Update discount progress
            const progress = (cashier.customerCount % cashier.n) / cashier.n * 100;
            discountProgressEl.style.width = progress + '%';
            
            // Update discount status
            if (cashier.customerCount % cashier.n === 0) {
                discountStatusEl.textContent = 'Discount applied!';
                discountStatusEl.className = 'text-sm text-emerald-400 mt-1';
                
                // Play discount sound
                discountSound.play();
                
                // Show confetti
                createConfetti();
                
                // Update stats
                stats.totalDiscounts += 1;
            } else {
                discountStatusEl.textContent = `${cashier.n - (cashier.customerCount % cashier.n)} more customers until next discount`;
                discountStatusEl.className = 'text-sm text-gray-400 mt-1';
            }
            
            // Add to transaction history
            const transaction = {
                customerNumber: cashier.customerCount,
                subtotal: subtotal,
                discount: discountAmount,
                total: total,
                timestamp: new Date(),
                products: [...cart]
            };
            
            transactionHistory.unshift(transaction);
            renderTransactionHistory();
            
            // Update stats
            stats.totalRevenue += total;
            stats.totalProductsSold += amounts.reduce((sum, amount) => sum + amount, 0);
            stats.totalTransactions += 1;
            updateStatsUI();
            
            // Clear cart
            cart = [];
            updateCartUI();
            
            // Play checkout sound
            checkoutSound.play();
            
            // Show notification
            showNotification(
                `Checkout Complete #${cashier.customerCount}`,
                cashier.customerCount % cashier.n === 0 
                    ? `Congratulations! You received a ${cashier.discount}% discount.` 
                    : 'Thank you for your purchase!',
                'success'
            );
        }
        
        // Render transaction history
        function renderTransactionHistory() {
            transactionHistoryEl.innerHTML = '';
            
            if (transactionHistory.length === 0) {
                transactionHistoryEl.innerHTML = '<div class="text-center py-4 text-gray-400">No transactions yet</div>';
                return;
            }
            
            for (const transaction of transactionHistory.slice(0, 5)) {
                const transactionEl = document.createElement('div');
                transactionEl.className = 'bg-gray-700 p-3 rounded-lg animate__animated animate__fadeIn';
                
                const discountApplied = transaction.discount > 0;
                
                transactionEl.innerHTML = `
                    <div class="flex justify-between items-start mb-1">
                        <div class="font-medium">#${transaction.customerNumber}</div>
                        <div class="text-sm text-gray-400">${transaction.timestamp.toLocaleTimeString()}</div>
                    </div>
                    <div class="flex justify-between text-sm mb-1">
                        <span>Subtotal:</span>
                        <span>$${transaction.subtotal.toFixed(2)}</span>
                    </div>
                    ${discountApplied ? `
                    <div class="flex justify-between text-sm mb-1 text-emerald-400">
                        <span>Discount (${cashier.discount}%):</span>
                        <span>-$${transaction.discount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="flex justify-between font-medium mt-2 pt-2 border-t border-gray-600">
                        <span>Total:</span>
                        <span class="${discountApplied ? 'text-purple-300' : ''}">$${transaction.total.toFixed(2)}</span>
                    </div>
                `;
                
                transactionHistoryEl.appendChild(transactionEl);
            }
        }
        
        // Update statistics UI
        function updateStatsUI() {
            totalRevenueEl.textContent = '$' + stats.totalRevenue.toFixed(2);
            totalDiscountsEl.textContent = stats.totalDiscounts;
            productsSoldEl.textContent = stats.totalProductsSold;
            
            const avgOrderValue = stats.totalTransactions > 0 
                ? stats.totalRevenue / stats.totalTransactions 
                : 0;
            avgOrderValueEl.textContent = '$' + avgOrderValue.toFixed(2);
        }
        
        // Show notification
        function showNotification(title, message, type) {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm animate__animated animate__fadeInRight ${type === 'success' ? 'bg-emerald-800' : type === 'error' ? 'bg-red-800' : 'bg-purple-800'}`;
            notification.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        ${type === 'success' ? `
                        <svg class="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ` : type === 'error' ? `
                        <svg class="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ` : `
                        <svg class="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        `}
                    </div>
                    <div class="ml-3">
                        <h3 class="font-medium orbitron ${type === 'success' ? 'text-emerald-200' : type === 'error' ? 'text-red-200' : 'text-purple-200'}">${title}</h3>
                        <p class="mt-1 text-sm ${type === 'success' ? 'text-emerald-100' : type === 'error' ? 'text-red-100' : 'text-purple-100'}">${message}</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 ${type === 'success' ? 'text-emerald-200 hover:bg-emerald-700' : type === 'error' ? 'text-red-200 hover:bg-red-700' : 'text-purple-200 hover:bg-purple-700'}">
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.classList.remove('animate__fadeInRight');
                notification.classList.add('animate__fadeOutRight');
                setTimeout(() => notification.remove(), 500);
            }, 5000);
        }
        
        // Create confetti effect
        function createConfetti() {
            confettiContainer.innerHTML = '';
            
            // Create particles
            for (let i = 0; i < 100; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random properties
                const size = Math.random() * 10 + 5;
                const posX = Math.random() * window.innerWidth;
                const posY = Math.random() * window.innerHeight - window.innerHeight;
                const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
                const delay = Math.random() * 5;
                const duration = Math.random() * 3 + 2;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${posX}px`;
                particle.style.top = `${posY}px`;
                particle.style.backgroundColor = color;
                particle.style.animation = `fall ${duration}s ease-in ${delay}s forwards`;
                
                // Add to container
                confettiContainer.appendChild(particle);
            }
            
            // Add styles for animation
            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes fall {
                    to {
                        transform: translateY(${window.innerHeight + 100}px) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            confettiContainer.appendChild(style);
            
            // Remove after animation completes
            setTimeout(() => {
                confettiContainer.innerHTML = '';
            }, 8000);
        }
        
        // Initialize on page load
        window.onload = function() {
            initializeSampleData();
            
            // Add typing animation to title
            const title = document.querySelector('header h1');
            title.classList.add('typing-animation');
        };

    
  // Define Cashier class FIRST
  class Cashier {
    constructor(n, discount, products, prices) {
      this.n = n;
      this.discount = discount;
      this.count = 0;
      this.priceMap = new Map();
      for (let i = 0; i < products.length; i++) this.priceMap.set(products[i], prices[i]);
    }
    getBill(product, amount) {
      this.count++;
      let total = 0;
      for (let i = 0; i < product.length; i++) {
        total += this.priceMap.get(product[i]) * amount[i];
      }
      if (this.count % this.n === 0) total = total * ((100 - this.discount) / 100);
      return total;
    }
  }

 
   