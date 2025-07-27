// Solution to Case 1
function case1Solution(bands) {
      // Take the first character and sort it
      const bandsWithFirstLetter = bands.map(band => ({
        name: band,
        firstLetter: band[0].toUpperCase()
      }));
      
      // Sorted alphabetically
      const sortedBands = [...bandsWithFirstLetter].sort((a, b) => 
        a.firstLetter.localeCompare(b.firstLetter));
      
      return sortedBands.map(band => band.name);
    }
    
    // Recursive bubble sort for case 2
    function recursiveBubbleSort(arr, n = arr.length, passCount = 0) {
      // Base case
      if (n === 1) return { sortedArray: arr, passCount };
      
      let swapped = false;
      
      // Complete one pass.
      for (let i = 0; i < n - 1; i++) {
        if (arr[i] > arr[i + 1]) {
          // Swap
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          swapped = true;
        }
      }
      
      // If there is no swap then return
      if (!swapped) return { sortedArray: arr, passCount };
      
      // Recursive call for next pass
      return recursiveBubbleSort(arr, n - 1, passCount + 1);
    }
    
    // Solution to Case 2
    function case2Solution(band1, band2) {
      // Take the band name as an array of characters.
      const band1Chars = band1.split('');
      const band2Chars = band2.split('');
      
      // Sort both bands and take the pass number.
      const { passCount: passCount1 } = recursiveBubbleSort([...band1Chars]);
      const { passCount: passCount2 } = recursiveBubbleSort([...band2Chars]);
      
      // Determining the outcome
      if (passCount1 > passCount2) {
        return { firstBand: band2, secondBand: band1 };
      } else {
        return { firstBand: band1, secondBand: band2 };
      }
    }
    
    // Test case
    const bands = ["WARFAZE", "SHUNNO", "ARTCELL", "NEMESIS", "AURTHOHIN", "MEGHDOL", "CHIRKUT", "BLACK"];
    
    // Test for Case 1
    console.log("Case 1 Solution:");
    const case1Result = case1Solution(bands);
    case1Result.forEach((band, index) => {
      console.log(`Slot ${index + 1}: ${band}`);
    });
    
    // Test for Case 2 (Two bands starting with the same letter)
    console.log("\nCase 2 Solution:");
    const bandA = "ARTCELL";
    const bandB = "AURTHOHIN";
    const case2Result = case2Solution(bandA, bandB);
    console.log(`Between ${bandA} and ${bandB}, ${case2Result.firstBand} will perform first because it required less passes to sort.`);