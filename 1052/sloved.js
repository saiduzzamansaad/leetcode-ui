var maxSatisfied = function(customers, grumpy, minutes) {
      let totalSatisfied = 0;
      let maxAdditional = 0;
      let currentWindowAdditional = 0;
      
      for (let i = 0; i < customers.length; i++) {
          if (grumpy[i] === 0) {
              totalSatisfied += customers[i];
          } else if (i < minutes) {
              currentWindowAdditional += customers[i];
          }
      }
      maxAdditional = currentWindowAdditional;
      
      for (let i = minutes; i < customers.length; i++) {
          const left = i - minutes;
          if (grumpy[left] === 1) {
              currentWindowAdditional -= customers[left];
          }
          if (grumpy[i] === 1) {
              currentWindowAdditional += customers[i];
          }
          maxAdditional = Math.max(maxAdditional, currentWindowAdditional);
      }
      
      return totalSatisfied + maxAdditional;
  };