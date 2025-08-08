class TreeNode {
      constructor(val, left = null, right = null) {
          this.val = val;
          this.left = left;
          this.right = right;
      }
  }
  
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
  
  // Utility function to build tree from array
  function buildTree(arr, i = 0) {
      if (i >= arr.length || arr[i] === null) return null;
      const root = new TreeNode(arr[i]);
      root.left = buildTree(arr, 2 * i + 1);
      root.right = buildTree(arr, 2 * i + 2);
      return root;
  }