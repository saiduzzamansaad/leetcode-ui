// DOM Elements
const helpBtn = document.getElementById("help-btn");
const closeHelp = document.getElementById("close-help");
const gotItBtn = document.getElementById("got-it-btn");
const helpModal = document.getElementById("help-modal");
const customersInput = document.getElementById("customers-input");
const grumpyInput = document.getElementById("grumpy-input");
const minutesInput = document.getElementById("minutes-input");
const calculateBtn = document.getElementById("calculate-btn");
const randomBtn = document.getElementById("random-btn");
const timeline = document.getElementById("timeline");
const emptyState = document.getElementById("empty-state");
const walkthroughContainer = document.getElementById("walkthrough-container");
const collapseWalkthrough = document.getElementById("collapse-walkthrough");
const walkthrough = document.getElementById("walkthrough");
const scrollTopBtn = document.getElementById("scroll-top");
const statsSummary = document.getElementById("stats-summary");
const baselineStat = document.getElementById("baseline-stat");
const savedStat = document.getElementById("saved-stat");
const totalStat = document.getElementById("total-stat");
const windowInfo = document.getElementById("window-info");
const windowStart = document.getElementById("window-start");
const windowEnd = document.getElementById("window-end");
const ctx = document.getElementById("results-chart").getContext("2d");

// Chart instance
let resultsChart = null;
let isWalkthroughExpanded = true;

// Initialize particles
function initParticles() {
      const particlesContainer = document.getElementById("particles");
      const particleCount = Math.floor(window.innerWidth / 10);

      for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div");
            particle.className = "absolute rounded-full bg-indigo-900/20";

            // Random properties
            const size = Math.random() * 3 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 10;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.opacity = Math.random() * 0.5 + 0.1;

            // Animate with GSAP
            gsap.to(particle, {
                  y: Math.random() * 100 - 50,
                  x: Math.random() * 100 - 50,
                  duration: duration,
                  delay: delay,
                  repeat: -1,
                  yoyo: true,
                  ease: "sine.inOut",
            });

            particlesContainer.appendChild(particle);
      }
}

// Help modal toggle
helpBtn.addEventListener("click", () => {
      gsap.to(helpModal, {
            opacity: 1,
            visibility: "visible",
            duration: 0.3,
      });
      gsap.to(helpModal.querySelector(".premium-card"), {
            scale: 1,
            duration: 0.3,
            ease: "back.out(1.7)",
      });
});

[closeHelp, gotItBtn].forEach((btn) => {
      btn.addEventListener("click", () => {
            gsap.to(helpModal, {
                  opacity: 0,
                  visibility: "hidden",
                  duration: 0.3,
            });
            gsap.to(helpModal.querySelector(".premium-card"), {
                  scale: 0.95,
                  duration: 0.3,
            });
      });
});

// Scroll to top button
window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
            gsap.to(scrollTopBtn, {
                  opacity: 1,
                  visibility: "visible",
                  duration: 0.3,
            });
      } else {
            gsap.to(scrollTopBtn, {
                  opacity: 0,
                  visibility: "hidden",
                  duration: 0.3,
            });
      }
});

scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
            top: 0,
            behavior: "smooth",
      });
});

// Collapse walkthrough
collapseWalkthrough.addEventListener("click", () => {
      isWalkthroughExpanded = !isWalkthroughExpanded;

      if (isWalkthroughExpanded) {
            walkthrough.style.display = "block";
            collapseWalkthrough.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                `;
      } else {
            walkthrough.style.display = "none";
            collapseWalkthrough.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                `;
      }
});

// Generate random scenario
function generateRandomScenario() {
      const length = Math.floor(Math.random() * 15) + 5;
      const customers = Array.from({ length }, () =>
            Math.floor(Math.random() * 10)
      );
      const grumpy = Array.from({ length }, () => Math.floor(Math.random() * 2));
      const minutes = Math.floor(Math.random() * 5) + 1;

      customersInput.value = customers.join(",");
      grumpyInput.value = grumpy.join(",");
      minutesInput.value = minutes;

      calculateOptimalSatisfaction();
}

// Main calculation function
function calculateOptimalSatisfaction() {
      // Parse inputs
      const customers = customersInput.value.split(",").map(Number);
      const grumpy = grumpyInput.value.split(",").map(Number);
      const minutes = parseInt(minutesInput.value);

      // Validate inputs
      if (customers.length !== grumpy.length) {
            showError("Customers and Grumpy arrays must have the same length");
            return;
      }
      if (minutes > customers.length) {
            showError("Technique duration cannot be longer than total minutes");
            return;
      }

      // Hide empty state
      gsap.to(emptyState, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                  emptyState.style.display = "none";
                  timeline.style.display = "flex";
                  gsap.from(timeline, { opacity: 0, y: 20, duration: 0.5 });
            },
      });

      // Show walkthrough
      walkthroughContainer.style.display = "block";
      gsap.from(walkthroughContainer, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            delay: 0.2,
      });

      // Clear previous visualization
      timeline.innerHTML = "";
      walkthrough.innerHTML = "";

      // Calculate baseline satisfaction
      let baselineSatisfied = 0;
      let totalGrumpyCustomers = 0;

      for (let i = 0; i < customers.length; i++) {
            if (grumpy[i] === 0) {
                  baselineSatisfied += customers[i];
            } else {
                  totalGrumpyCustomers += customers[i];
            }
      }

      // Find optimal window
      let maxAdditional = 0;
      let currentWindow = 0;
      let optimalStart = 0;

      // Initialize first window
      for (let i = 0; i < minutes; i++) {
            if (grumpy[i] === 1) {
                  currentWindow += customers[i];
            }
      }
      maxAdditional = currentWindow;

      // Slide the window
      for (let i = minutes; i < customers.length; i++) {
            const left = i - minutes;
            if (grumpy[left] === 1) {
                  currentWindow -= customers[left];
            }
            if (grumpy[i] === 1) {
                  currentWindow += customers[i];
            }

            if (currentWindow > maxAdditional) {
                  maxAdditional = currentWindow;
                  optimalStart = left + 1;
            }
      }

      // Calculate total satisfied customers
      const total = baselineSatisfied + maxAdditional;

      // Update UI
      updateTimeline(customers, grumpy, minutes, optimalStart);
      updateStats(baselineSatisfied, maxAdditional, total);

      if (maxAdditional > 0) {
            windowStart.textContent = optimalStart;
            windowEnd.textContent = optimalStart + minutes - 1;
            windowInfo.classList.remove("hidden");
            gsap.from(windowInfo, {
                  opacity: 0,
                  x: -20,
                  duration: 0.5,
                  delay: 0.4,
            });
      } else {
            windowInfo.classList.add("hidden");
      }

      // Update chart
      updateChart(customers, grumpy, optimalStart, minutes);

      // Generate walkthrough
      generateWalkthrough(
            customers,
            grumpy,
            minutes,
            baselineSatisfied,
            maxAdditional,
            optimalStart,
            total
      );
}

// Show error message
function showError(message) {
      const errorEl = document.createElement("div");
      errorEl.className =
            "fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center";
      errorEl.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ${message}
            `;

      document.body.appendChild(errorEl);

      gsap.from(errorEl, {
            y: -50,
            opacity: 0,
            duration: 0.3,
      });

      setTimeout(() => {
            gsap.to(errorEl, {
                  y: -50,
                  opacity: 0,
                  duration: 0.3,
                  onComplete: () => errorEl.remove(),
            });
      }, 3000);
}

// Update timeline visualization
function updateTimeline(customers, grumpy, minutes, optimalStart) {
      const optimalEnd = optimalStart + minutes;

      // Animate each minute element
      customers.forEach((count, i) => {
            const minuteDiv = document.createElement("div");
            minuteDiv.className = `flex flex-col items-center w-20 p-3 rounded-xl border-2 ${i >= optimalStart && i < optimalEnd
                        ? "tech-active window-highlight"
                        : "border-gray-800"
                  }`;
            minuteDiv.style.opacity = "0";
            minuteDiv.style.transform = "translateY(20px)";

            const minuteLabel = document.createElement("div");
            minuteLabel.className = "text-xs font-medium mb-2 text-gray-400";
            minuteLabel.textContent = `Min ${i}`;
            minuteDiv.appendChild(minuteLabel);

            const customerDiv = document.createElement("div");
            customerDiv.className = "flex flex-wrap justify-center gap-1 mb-2";

            // Create customer indicators
            for (let j = 0; j < count; j++) {
                  const customer = document.createElement("div");
                  customer.className = `w-3 h-3 rounded-full customer-bubble ${grumpy[i] === 1 ? "bg-red-500" : "bg-green-500"
                        }`;

                  // If in optimal window and grumpy, show as saved (blue)
                  if (grumpy[i] === 1 && i >= optimalStart && i < optimalEnd) {
                        customer.className = "w-3 h-3 rounded-full bg-blue-500 customer-bubble";
                  }

                  // Stagger animation
                  customer.style.animationDelay = `${j * 0.1}s`;
                  customerDiv.appendChild(customer);
            }

            minuteDiv.appendChild(customerDiv);

            const ownerDiv = document.createElement("div");
            ownerDiv.className = `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${grumpy[i] === 1 ? "bg-red-600 text-white" : "bg-green-600 text-white"
                  } grumpy-toggle`;
            ownerDiv.textContent = grumpy[i] === 1 ? "😠" : "😊";

            // If in optimal window, show happy regardless of original state
            if (i >= optimalStart && i < optimalEnd) {
                  ownerDiv.className =
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-600 text-white grumpy-toggle";
                  ownerDiv.textContent = "😊";
            }

            minuteDiv.appendChild(ownerDiv);

            timeline.appendChild(minuteDiv);

            // Animate in with delay
            gsap.to(minuteDiv, {
                  opacity: 1,
                  y: 0,
                  duration: 0.5,
                  delay: i * 0.05,
                  ease: "back.out(1.2)",
            });
      });
}

// Update stats
function updateStats(baseline, saved, total) {
      statsSummary.style.display = "block";

      // Animate counting up
      gsap.to(
            {},
            {
                  duration: 1,
                  onUpdate: function () {
                        const progress = this.progress();
                        baselineStat.textContent = Math.floor(baseline * progress);
                        savedStat.textContent = Math.floor(saved * progress);
                        totalStat.textContent = Math.floor(total * progress);
                  },
                  ease: "power2.out",
            }
      );
}

// Update chart
function updateChart(customers, grumpy, optimalStart, minutes) {
      const labels = customers.map((_, i) => `Min ${i}`);
      const optimalEnd = optimalStart + minutes;

      const originalData = customers.map((count, i) =>
            grumpy[i] === 0 ? count : 0
      );
      const potentialData = customers.map((count, i) =>
            i >= optimalStart && i < optimalEnd ? count : grumpy[i] === 0 ? count : 0
      );

      if (resultsChart) {
            resultsChart.destroy();
      }

      resultsChart = new Chart(ctx, {
            type: "bar",
            data: {
                  labels: labels,
                  datasets: [
                        {
                              label: "Original Satisfied",
                              data: originalData,
                              backgroundColor: "#10B981",
                              borderColor: "#047857",
                              borderWidth: 1,
                              borderRadius: 4,
                              barPercentage: 0.8,
                        },
                        {
                              label: "With Technique",
                              data: potentialData,
                              backgroundColor: "#6366F1",
                              borderColor: "#4F46E5",
                              borderWidth: 1,
                              borderRadius: 4,
                              barPercentage: 0.8,
                        },
                  ],
            },
            options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                        y: {
                              beginAtZero: true,
                              grid: {
                                    color: "rgba(255, 255, 255, 0.05)",
                              },
                              ticks: {
                                    color: "#94A3B8",
                              },
                        },
                        x: {
                              grid: {
                                    display: false,
                              },
                              ticks: {
                                    color: "#94A3B8",
                              },
                        },
                  },
                  plugins: {
                        tooltip: {
                              backgroundColor: "rgba(15, 23, 42, 0.9)",
                              borderColor: "rgba(255, 255, 255, 0.1)",
                              borderWidth: 1,
                              titleColor: "#E2E8F0",
                              bodyColor: "#CBD5E1",
                              callbacks: {
                                    label: function (context) {
                                          let label = context.dataset.label || "";
                                          if (label) {
                                                label += ": ";
                                          }
                                          label += context.raw;
                                          return label;
                                    },
                              },
                        },
                        legend: {
                              labels: {
                                    color: "#E2E8F0",
                                    usePointStyle: true,
                                    boxWidth: 6,
                                    padding: 20,
                              },
                        },
                  },
                  animation: {
                        duration: 1000,
                        easing: "easeOutQuart",
                  },
            },
      });
}

// Generate solution walkthrough
function generateWalkthrough(
      customers,
      grumpy,
      minutes,
      baseline,
      maxAdditional,
      optimalStart,
      total
) {
      // Step 1: Problem Understanding
      addWalkthroughStep(
            `
                <div class="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <h3 class="font-semibold text-white mb-2">Understanding the Problem</h3>
                    <p class="text-sm text-gray-300">We have a bookstore open for ${customers.length} minutes with varying customer counts. The owner is grumpy during certain minutes, causing customer dissatisfaction. We can use a special technique to keep the owner non-grumpy for ${minutes} consecutive minutes.</p>
                </div>
            `,
            0.1
      );

      // Step 2: Baseline Calculation
      addWalkthroughStep(
            `
                <div class="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <h3 class="font-semibold text-white mb-2">Calculating Baseline Satisfaction</h3>
                    <p class="text-sm text-gray-300 mb-3">Without using the technique, only customers arriving during non-grumpy minutes are satisfied:</p>
                    <div class="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                        ${customers
                  .map(
                        (count, i) => `
                            <div class="text-xs p-1 rounded text-center ${grumpy[i] === 0
                                    ? "bg-green-900/50 text-green-400 border border-green-800"
                                    : "bg-gray-800/50 text-gray-400"
                              }">
                                Min ${i}: ${grumpy[i] === 0 ? count : "0"}
                            </div>
                        `
                  )
                  .join("")}
                    </div>
                    <p class="text-sm font-medium text-green-400">Total Baseline Satisfaction: ${baseline}</p>
                </div>
            `,
            0.2
      );

      // Step 3: Finding Optimal Window
      addWalkthroughStep(
            `
                <div class="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <h3 class="font-semibold text-white mb-2">Finding Optimal ${minutes}-Minute Window</h3>
                    <p class="text-sm text-gray-300 mb-3">We slide a ${minutes}-minute window across the timeline to find where applying the technique saves the most customers:</p>
                    <div class="relative h-20 bg-gray-900/50 rounded-lg mb-3 overflow-hidden">
                        <div class="absolute inset-0 flex">
                            ${customers
                  .map(
                        (_, i) => `
                                <div class="h-full ${i >= optimalStart &&
                                    i < optimalStart + minutes
                                    ? "bg-blue-900/50 border-r border-blue-700"
                                    : "border-r border-gray-800"
                              }" style="width: ${100 / customers.length
                              }%"></div>
                            `
                  )
                  .join("")}
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-xs bg-blue-900/80 text-blue-200 px-2 py-1 rounded">Best Window: Minutes ${optimalStart}-${optimalStart + minutes - 1
            }</span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-300 mb-1">This window saves ${maxAdditional} additional customers that would otherwise be dissatisfied.</p>
                </div>
            `,
            0.3
      );

      // Step 4: Final Calculation
      addWalkthroughStep(
            `
                <div class="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <h3 class="font-semibold text-white mb-2">Calculating Total Satisfaction</h3>
                    <div class="flex items-center justify-center space-x-4">
                        <div class="text-center">
                            <div class="text-sm text-gray-400">Baseline</div>
                            <div class="text-2xl font-bold text-green-400">${baseline}</div>
                        </div>
                        <div class="text-2xl text-gray-400">+</div>
                        <div class="text-center">
                            <div class="text-sm text-gray-400">Saved</div>
                            <div class="text-2xl font-bold text-blue-400">${maxAdditional}</div>
                        </div>
                        <div class="text-2xl text-gray-400">=</div>
                        <div class="text-center">
                            <div class="text-sm text-gray-400">Total</div>
                            <div class="text-3xl font-bold text-white">${total}</div>
                        </div>
                    </div>
                </div>
            `,
            0.4
      );
}

function addWalkthroughStep(html, delay) {
      const step = document.createElement("div");
      step.innerHTML = html;
      step.style.opacity = "0";
      step.style.transform = "translateY(20px)";
      walkthrough.appendChild(step);

      gsap.to(step, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: delay,
            ease: "back.out(1.2)",
      });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
      initParticles();

      // Event listeners
      calculateBtn.addEventListener("click", calculateOptimalSatisfaction);
      randomBtn.addEventListener("click", generateRandomScenario);

      // Animate initial elements
      gsap.from(".slide-in", {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)",
      });
});
