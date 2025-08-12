class Cashier {
      constructor(n, discount, products, prices) {
          this.n = n;
          this.discount = discount;
          this.customerCount = 0;
          this.productPrices = {};
          
          // Create a map of product IDs to prices for quick lookup
          for (let i = 0; i < products.length; i++) {
              this.productPrices[products[i]] = prices[i];
          }
      }
  
      getBill(product, amount) {
          this.customerCount++;
          let subtotal = 0;
          
          // Calculate subtotal
          for (let i = 0; i < product.length; i++) {
              const productId = product[i];
              const quantity = amount[i];
              subtotal += this.productPrices[productId] * quantity;
          }
          
          // Apply discount if it's the nth customer
          let total = subtotal;
          if (this.customerCount % this.n === 0) {
              total = subtotal * (100 - this.discount) / 100;
          }
          
          return total;
      }
  }