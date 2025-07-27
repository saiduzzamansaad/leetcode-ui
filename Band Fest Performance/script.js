document.addEventListener("DOMContentLoaded", function () {
  const bands = [
    "WARFAZE",
    "SHUNNO",
    "ARTCELL",
    "NEMESIS",
    "AURTHOHIN",
    "MEGHDOL",
    "CHIRKUT",
    "BLACK",
  ];

  // Display original bands
  const originalBandsContainer = document.getElementById("originalBands");
  bands.forEach((band, index) => {
    const bandCard = document.createElement("div");
    bandCard.className = "bg-indigo-50 p-3 rounded-lg flex items-center";
    bandCard.innerHTML = `
                    <div class="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">${
                      index + 1
                    }</div>
                    <div class="flex-1 font-medium">${band}</div>
                    <div class="bg-white rounded-full w-8 h-8 flex items-center justify-center border border-indigo-200 font-bold text-indigo-700">${
                      band[0]
                    }</div>
                `;
    originalBandsContainer.appendChild(bandCard);
  });

  // Display final order for Case 1 in summary
  const finalOrderCase1 = document.getElementById("finalOrderCase1");
  const sortedBandsCase1 = sortBandsByFirstLetter([...bands]);
  sortedBandsCase1.forEach((band, index) => {
    const bandCard = document.createElement("div");
    bandCard.className = "bg-indigo-100 p-3 rounded-lg flex items-center";
    bandCard.innerHTML = `
                    <div class="bg-indigo-700 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">${
                      index + 1
                    }</div>
                    <div class="flex-1 font-medium">${band}</div>
                    <div class="text-sm text-gray-600">${band[0]}</div>
                `;
    finalOrderCase1.appendChild(bandCard);
  });

  // Case 1 Solution
  document.getElementById("solveCase1").addEventListener("click", function () {
    const button = this;
    button.disabled = true;
    button.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                `;

    // Clear previous results
    document.getElementById("case1Steps").classList.add("hidden");
    document.getElementById("case1StepDetails").innerHTML = "";
    document.getElementById("case1Result").innerHTML = "";

    setTimeout(() => {
      const { sortedBands, steps } = selectionSortWithSteps([...bands]);
      displayCase1Steps(steps);
      displayCase1Result(sortedBands);
      button.disabled = false;
      button.innerHTML = `
                        <i class="fas fa-play-circle mr-2"></i>
                        Determine Performance Order
                    `;
    }, 500);
  });

  // Case 2 Solution
  document.getElementById("solveCase2").addEventListener("click", function () {
    const button = this;
    button.disabled = true;
    button.innerHTML = `
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Analyzing...
                `;

    setTimeout(() => {
      const band1 = document.getElementById("band1Select").value;
      const band2 = document.getElementById("band2Select").value;
      compareBandsWithAnimation(band1, band2);
      button.disabled = false;
      button.innerHTML = `
                        <i class="fas fa-exchange-alt mr-2"></i>
                        Compare Bands
                    `;
    }, 500);
  });

  // Animation controls
  let currentStep = 0;
  let animationSteps = [];
  let currentPass = 0;

  document.getElementById("prevStep").addEventListener("click", function () {
    if (currentStep > 0) {
      currentStep--;
      updateAnimationStep();
    }
  });

  document.getElementById("nextStep").addEventListener("click", function () {
    if (currentStep < animationSteps.length - 1) {
      currentStep++;
      updateAnimationStep();
    }
  });

  function updateAnimationStep() {
    const step = animationSteps[currentStep];
    document.getElementById("stepInfo").textContent = `Step ${
      currentStep + 1
    } of ${animationSteps.length}`;

    // Update pass information
    if (step.pass !== currentPass) {
      currentPass = step.pass;
      document.getElementById("passInfo").textContent = `Pass: ${
        currentPass + 1
      }`;
    }

    // Update band 1 display
    const band1Container = document.getElementById("band1Animation");
    band1Container.innerHTML = "";
    step.band1.chars.forEach((char, index) => {
      const charElement = document.createElement("div");
      charElement.className = `sort-step w-8 h-8 flex items-center justify-center rounded border font-medium ${
        step.band1.highlight === index ? "highlight bg-yellow-200" : "bg-white"
      }`;
      charElement.textContent = char;
      band1Container.appendChild(charElement);
    });

    // Update band 2 display
    const band2Container = document.getElementById("band2Animation");
    band2Container.innerHTML = "";
    step.band2.chars.forEach((char, index) => {
      const charElement = document.createElement("div");
      charElement.className = `sort-step w-8 h-8 flex items-center justify-center rounded border font-medium ${
        step.band2.highlight === index ? "highlight bg-yellow-200" : "bg-white"
      }`;
      charElement.textContent = char;
      band2Container.appendChild(charElement);
    });

    // Update pass counters
    document.getElementById("band1Passes").innerHTML =
      step.band1.pass !== undefined
        ? `<span class="pass-badge bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Pass ${
            step.band1.pass + 1
          }</span>`
        : "";
    document.getElementById("band2Passes").innerHTML =
      step.band2.pass !== undefined
        ? `<span class="pass-badge bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Pass ${
            step.band2.pass + 1
          }</span>`
        : "";

    // Highlight swaps
    if (step.swap1) {
      const elements = band1Container.children;
      if (elements[step.swap1.index] && elements[step.swap1.index + 1]) {
        elements[step.swap1.index].classList.add("swap-animation");
        elements[step.swap1.index + 1].classList.add("swap-animation");
      }
    }

    if (step.swap2) {
      const elements = band2Container.children;
      if (elements[step.swap2.index] && elements[step.swap2.index + 1]) {
        elements[step.swap2.index].classList.add("swap-animation");
        elements[step.swap2.index + 1].classList.add("swap-animation");
      }
    }
  }

  function selectionSortWithSteps(bands) {
    const steps = [];
    const bandLetters = bands.map((band) => ({
      name: band,
      firstLetter: band[0].toUpperCase(),
    }));

    // Selection Sort implementation with steps recording
    for (let i = 0; i < bandLetters.length - 1; i++) {
      let minIndex = i;

      // Record initial state
      steps.push({
        type: "find_min_start",
        currentIndex: i,
        array: [...bandLetters.map((item) => item.name)],
        minIndex: minIndex,
      });

      for (let j = i + 1; j < bandLetters.length; j++) {
        // Record comparison
        steps.push({
          type: "compare",
          currentIndex: i,
          compareIndex: j,
          array: [...bandLetters.map((item) => item.name)],
          minIndex: minIndex,
        });

        if (bandLetters[j].firstLetter < bandLetters[minIndex].firstLetter) {
          minIndex = j;

          // Record new min found
          steps.push({
            type: "new_min",
            currentIndex: i,
            newMinIndex: minIndex,
            array: [...bandLetters.map((item) => item.name)],
          });
        }
      }

      if (minIndex !== i) {
        // Record before swap
        steps.push({
          type: "before_swap",
          currentIndex: i,
          minIndex: minIndex,
          array: [...bandLetters.map((item) => item.name)],
        });

        [bandLetters[i], bandLetters[minIndex]] = [
          bandLetters[minIndex],
          bandLetters[i],
        ];

        // Record after swap
        steps.push({
          type: "after_swap",
          currentIndex: i,
          minIndex: minIndex,
          array: [...bandLetters.map((item) => item.name)],
        });
      } else {
        // Record no swap needed
        steps.push({
          type: "no_swap",
          currentIndex: i,
          array: [...bandLetters.map((item) => item.name)],
        });
      }
    }

    return {
      sortedBands: bandLetters.map((item) => item.name),
      steps: steps,
    };
  }

  function displayCase1Steps(steps) {
    const stepsContainer = document.getElementById("case1StepDetails");
    const container = document.getElementById("case1Steps");
    container.classList.remove("hidden");

    steps.forEach((step, index) => {
      const stepElement = document.createElement("div");
      stepElement.className =
        "bg-white p-3 rounded-lg border border-gray-200 text-sm";

      let content = "";
      let icon = "";
      let iconColor = "";

      switch (step.type) {
        case "find_min_start":
          icon = "search";
          iconColor = "text-blue-500";
          content = `Starting to find minimum from position ${
            step.currentIndex + 1
          }`;
          break;
        case "compare":
          icon = "equals";
          iconColor = "text-gray-500";
          content = `Comparing ${step.array[step.compareIndex][0]} (${
            step.array[step.compareIndex]
          }) with current minimum ${step.array[step.minIndex][0]} (${
            step.array[step.minIndex]
          })`;
          break;
        case "new_min":
          icon = "arrow-down";
          iconColor = "text-yellow-500";
          content = `New minimum found: ${step.array[step.newMinIndex][0]} (${
            step.array[step.newMinIndex]
          }) at position ${step.newMinIndex + 1}`;
          break;
        case "before_swap":
          icon = "exchange-alt";
          iconColor = "text-purple-500";
          content = `Swapping ${step.array[step.currentIndex][0]} (${
            step.array[step.currentIndex]
          }) with ${step.array[step.minIndex][0]} (${
            step.array[step.minIndex]
          })`;
          break;
        case "after_swap":
          icon = "check-circle";
          iconColor = "text-green-500";
          content = `After swap: ${step.array[step.currentIndex][0]} (${
            step.array[step.currentIndex]
          }) now at position ${step.currentIndex + 1}`;
          break;
        case "no_swap":
          icon = "times-circle";
          iconColor = "text-gray-400";
          content = `No swap needed for ${step.array[step.currentIndex][0]} (${
            step.array[step.currentIndex]
          }) at position ${step.currentIndex + 1}`;
          break;
      }

      stepElement.innerHTML = `
                        <div class="flex items-start">
                            <div class="flex-shrink-0 mt-1">
                                <i class="fas fa-${icon} ${iconColor} mr-2"></i>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Step ${
                                  index + 1
                                }:</span> ${content}
                                <div class="mt-1 flex flex-wrap gap-1">
                                    ${step.array
                                      .map(
                                        (band, i) => `
                                        <span class="px-2 py-1 rounded ${
                                          i === step.currentIndex
                                            ? "bg-blue-100 text-blue-800"
                                            : i === step.minIndex
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                        }">
                                            ${band[0]}:${band}
                                        </span>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>
                        </div>
                    `;

      stepsContainer.appendChild(stepElement);
    });
  }

  function displayCase1Result(sortedBands) {
    const resultContainer = document.getElementById("case1Result");
    resultContainer.innerHTML = "";

    sortedBands.forEach((band, index) => {
      const bandCard = document.createElement("div");
      bandCard.className = "bg-indigo-50 p-3 rounded-lg flex items-center";
      bandCard.innerHTML = `
                        <div class="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 font-bold">${
                          index + 1
                        }</div>
                        <div class="flex-1">
                            <div class="font-medium">${band}</div>
                            <div class="text-sm text-gray-600">First letter: ${
                              band[0]
                            }</div>
                        </div>
                        <div class="bg-white rounded-full w-8 h-8 flex items-center justify-center border border-indigo-200 font-bold text-indigo-700">${
                          band[0]
                        }</div>
                    `;
      resultContainer.appendChild(bandCard);
    });
  }

  function sortBandsByFirstLetter(bands) {
    const bandLetters = bands.map((band) => ({
      name: band,
      firstLetter: band[0].toUpperCase(),
    }));

    // Selection Sort implementation
    for (let i = 0; i < bandLetters.length - 1; i++) {
      let minIndex = i;
      for (let j = i + 1; j < bandLetters.length; j++) {
        if (bandLetters[j].firstLetter < bandLetters[minIndex].firstLetter) {
          minIndex = j;
        }
      }
      if (minIndex !== i) {
        [bandLetters[i], bandLetters[minIndex]] = [
          bandLetters[minIndex],
          bandLetters[i],
        ];
      }
    }

    return bandLetters.map((item) => item.name);
  }

  function compareBandsWithAnimation(band1, band2) {
    const resultDiv = document.getElementById("case2Result");
    const animationContainer = document.getElementById(
      "sortAnimationContainer"
    );

    resultDiv.innerHTML = "";
    animationContainer.classList.add("hidden");

    if (band1[0] !== band2[0]) {
      resultDiv.innerHTML = `
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3"></i>
                                </div>
                                <div>
                                    <p class="text-sm text-yellow-700">
                                        These bands have different first letters (<span class="font-bold">${band1[0]}</span> and <span class="font-bold">${band2[0]}</span>). 
                                        The <span class="font-bold">Case 1</span> solution applies to determine performance order.
                                    </p>
                                </div>
                            </div>
                        </div>
                    `;
      return;
    }

    // Prepare animation data
    animationSteps = [];
    const arr1 = band1.toUpperCase().split("");
    const arr2 = band2.toUpperCase().split("");

    // Sort and collect steps for band 1
    const steps1 = [];
    recursiveBubbleSortWithSteps([...arr1], arr1.length, steps1);

    // Sort and collect steps for band 2
    const steps2 = [];
    recursiveBubbleSortWithSteps([...arr2], arr2.length, steps2);

    // Combine steps for animation
    const maxSteps = Math.max(steps1.length, steps2.length);
    for (let i = 0; i < maxSteps; i++) {
      const step1 =
        i < steps1.length
          ? steps1[i]
          : {
              chars: [...steps1[steps1.length - 1].chars],
              highlight: -1,
              swap: null,
              pass: steps1[steps1.length - 1].pass,
            };

      const step2 =
        i < steps2.length
          ? steps2[i]
          : {
              chars: [...steps2[steps2.length - 1].chars],
              highlight: -1,
              swap: null,
              pass: steps2[steps2.length - 1].pass,
            };

      animationSteps.push({
        band1: step1,
        band2: step2,
        swap1: i < steps1.length ? steps1[i].swap : null,
        swap2: i < steps2.length ? steps2[i].swap : null,
        pass: Math.max(step1.pass || 0, step2.pass || 0),
      });
    }

    // Display results
    resultDiv.innerHTML = `
                    <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <i class="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            </div>
                            <div>
                                <p class="text-sm text-green-700">
                                    Both bands start with the letter <span class="font-bold">${
                                      band1[0]
                                    }</span>. 
                                    Using recursive bubble sort to determine performance order.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white p-4 rounded-lg border border-blue-200">
                            <h4 class="font-medium text-center mb-2">${band1}</h4>
                            <div class="text-center text-2xl font-bold text-blue-600 mb-1">${
                              steps1.length
                            } passes</div>
                            <div class="text-center">
                                <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">${
                                  steps1.length > steps2.length
                                    ? "More complex"
                                    : "Less complex"
                                }</span>
                            </div>
                            <div class="mt-2 text-sm text-gray-600 text-center">to fully sort the name</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg border border-green-200">
                            <h4 class="font-medium text-center mb-2">${band2}</h4>
                            <div class="text-center text-2xl font-bold text-green-600 mb-1">${
                              steps2.length
                            } passes</div>
                            <div class="text-center">
                                <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">${
                                  steps2.length > steps1.length
                                    ? "More complex"
                                    : "Less complex"
                                }</span>
                            </div>
                            <div class="mt-2 text-sm text-gray-600 text-center">to fully sort the name</div>
                        </div>
                    </div>
                    
                    <div class="mt-4 p-4 ${
                      steps1.length > steps2.length
                        ? "bg-green-50 border-l-4 border-green-400"
                        : "bg-blue-50 border-l-4 border-blue-400"
                    } rounded-r-lg">
                        <h4 class="font-medium ${
                          steps1.length > steps2.length
                            ? "text-green-800"
                            : "text-blue-800"
                        } mb-2">
                            <i class="fas fa-trophy mr-2"></i> Performance Order Decision
                        </h4>
                        <p class="${
                          steps1.length > steps2.length
                            ? "text-green-700"
                            : "text-blue-700"
                        }">
                            ${
                              steps1.length > steps2.length
                                ? `"<span class="font-bold">${band2}</span>" will perform <span class="font-bold">first</span> (requires fewer passes to sort - ${steps2.length} vs ${steps1.length})`
                                : `"<span class="font-bold">${band1}</span>" will perform <span class="font-bold">first</span> (requires fewer passes to sort - ${steps1.length} vs ${steps2.length})`
                            }
                        </p>
                    </div>
                `;

    // Setup animation
    document.getElementById("band1Name").textContent = band1;
    document.getElementById("band2Name").textContent = band2;
    animationContainer.classList.remove("hidden");
    currentStep = 0;
    currentPass = 0;
    document.getElementById(
      "stepInfo"
    ).textContent = `Step 1 of ${animationSteps.length}`;
    document.getElementById("passInfo").textContent = `Pass: 1`;
    updateAnimationStep();
  }

  function recursiveBubbleSortWithSteps(arr, n, steps, passCount = 0) {
    if (n === 1) {
      steps.push({
        chars: [...arr],
        highlight: -1,
        swap: null,
        pass: passCount,
      });
      return;
    }

    let swapped = false;
    const currentStep = {
      chars: [...arr],
      highlight: -1,
      swap: null,
      pass: passCount,
    };

    for (let i = 0; i < n - 1; i++) {
      currentStep.highlight = i;
      steps.push({ ...currentStep });

      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;

        // Record swap
        const swapStep = { ...currentStep };
        swapStep.swap = { index: i, value1: arr[i], value2: arr[i + 1] };
        steps.push(swapStep);
      }
    }

    // Final step of this pass
    currentStep.highlight = -1;
    steps.push({ ...currentStep });

    if (!swapped) return;

    return recursiveBubbleSortWithSteps(arr, n - 1, steps, passCount + 1);
  }
});

