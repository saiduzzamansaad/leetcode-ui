document.addEventListener('DOMContentLoaded', function() {
      const calculateBtn = document.getElementById('calculateBtn');
      const sampleBtn = document.getElementById('sampleBtn');
      const resultContainer = document.getElementById('resultContainer');
      const emptyState = document.getElementById('emptyState');
      const maxProfitElement = document.getElementById('maxProfit');
      const scheduleElement = document.getElementById('schedule');
      const timelineElement = document.getElementById('timeline');
  
      // Add animation to buttons on hover
      calculateBtn.addEventListener('mouseenter', () => {
          calculateBtn.classList.add('pulse');
      });
      calculateBtn.addEventListener('mouseleave', () => {
          calculateBtn.classList.remove('pulse');
      });
  
      // Load sample data with animation
      sampleBtn.addEventListener('click', function() {
          sampleBtn.classList.add('animate__animated', 'animate__pulse');
          setTimeout(() => {
              sampleBtn.classList.remove('animate__animated', 'animate__pulse');
          }, 1000);
  
          document.getElementById('startTime').value = '1, 2, 3, 3';
          document.getElementById('endTime').value = '3, 4, 5, 6';
          document.getElementById('profit').value = '50, 10, 40, 70';
      });
  
      // Calculate maximum profit with animations
      calculateBtn.addEventListener('click', function() {
          // Add loading animation
          calculateBtn.innerHTML = `
              <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating...
          `;
          calculateBtn.disabled = true;
  
          // Parse input values
          const startTime = document.getElementById('startTime').value.split(',').map(item => parseInt(item.trim()));
          const endTime = document.getElementById('endTime').value.split(',').map(item => parseInt(item.trim()));
          const profit = document.getElementById('profit').value.split(',').map(item => parseInt(item.trim()));
  
          // Validate inputs
          if (startTime.length !== endTime.length || startTime.length !== profit.length) {
              showError('All input arrays must have the same number of values');
              resetCalculateButton();
              return;
          }
  
          if (startTime.some(isNaN) || endTime.some(isNaN) || profit.some(isNaN)) {
              showError('Please enter valid numbers only');
              resetCalculateButton();
              return;
          }
  
          // Process after a small delay for animation
          setTimeout(() => {
              try {
                  const result = jobScheduling(startTime, endTime, profit);
                  displayResults(result);
              } catch (error) {
                  showError('An error occurred during calculation');
                  console.error(error);
              } finally {
                  resetCalculateButton();
              }
          }, 800);
      });
  
      function resetCalculateButton() {
          calculateBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Calculate
          `;
          calculateBtn.disabled = false;
      }
  
      function showError(message) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg animate__animated animate__fadeInRight';
          errorDiv.innerHTML = `
              <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>${message}</span>
              </div>
          `;
          document.body.appendChild(errorDiv);
          
          setTimeout(() => {
              errorDiv.classList.add('animate__fadeOutRight');
              setTimeout(() => errorDiv.remove(), 500);
          }, 3000);
      }
  
      function jobScheduling(startTime, endTime, profit) {
          // Combine the data into an array of job objects
          const jobs = startTime.map((start, index) => ({
              start,
              end: endTime[index],
              profit: profit[index],
              index
          }));
          
          // Sort jobs by end time
          jobs.sort((a, b) => a.end - b.end);
          
          // Initialize DP array
          const dp = new Array(jobs.length).fill(0);
          dp[0] = jobs[0].profit;
          
          // To keep track of selected jobs
          const selected = new Array(jobs.length);
          selected[0] = [0];
          
          for (let i = 1; i < jobs.length; i++) {
              let currentProfit = jobs[i].profit;
              let lastNonOverlappingJobIndex = binarySearch(jobs, i);
              let currentSelected = [i];
              
              if (lastNonOverlappingJobIndex !== -1) {
                  currentProfit += dp[lastNonOverlappingJobIndex];
                  if (selected[lastNonOverlappingJobIndex]) {
                      currentSelected = [...selected[lastNonOverlappingJobIndex], i];
                  }
              }
              
              if (currentProfit > dp[i - 1]) {
                  dp[i] = currentProfit;
                  selected[i] = currentSelected;
              } else {
                  dp[i] = dp[i - 1];
                  selected[i] = selected[i - 1];
              }
          }
          
          // Get the selected jobs
          const selectedIndices = selected[jobs.length - 1] || [];
          const selectedJobs = selectedIndices.map(idx => jobs[idx]);
          
          return {
              maxProfit: dp[jobs.length - 1],
              selectedJobs,
              selectedIndices
          };
      }
      
      function binarySearch(jobs, currentIndex) {
          let low = 0;
          let high = currentIndex - 1;
          let result = -1;
          
          while (low <= high) {
              const mid = Math.floor((low + high) / 2);
              if (jobs[mid].end <= jobs[currentIndex].start) {
                  result = mid;
                  low = mid + 1;
              } else {
                  high = mid - 1;
              }
          }
          
          return result;
      }
  
      function displayResults(result) {
          // Show results with animation
          emptyState.classList.add('animate__fadeOut');
          setTimeout(() => {
              emptyState.classList.add('hidden');
              emptyState.classList.remove('animate__fadeOut');
              
              resultContainer.classList.remove('hidden');
              resultContainer.classList.add('animate__fadeIn');
              
              // Format the profit with commas
              maxProfitElement.textContent = result.maxProfit.toLocaleString();
              
              // Display selected jobs
              scheduleElement.innerHTML = '';
              result.selectedJobs.forEach((job, i) => {
                  const jobElement = document.createElement('div');
                  jobElement.className = 'bg-white p-4 rounded-lg border border-gray-200 shadow-sm job-bar hover:border-indigo-300 transition-all duration-300';
                  jobElement.style.animationDelay = `${i * 100}ms`;
                  jobElement.classList.add('animate__animated', 'animate__fadeInUp');
                  jobElement.innerHTML = `
                      <div class="flex justify-between items-start">
                          <div>
                              <span class="font-medium text-gray-900">Job ${job.index + 1}</span>
                              <span class="block text-sm text-gray-500 mt-1">${job.start} → ${job.end}</span>
                          </div>
                          <span class="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-semibold">$${job.profit.toLocaleString()}</span>
                      </div>
                      <div class="mt-2 flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Selected in optimal schedule
                      </div>
                  `;
                  scheduleElement.appendChild(jobElement);
              });
              
              // Render timeline
              renderTimeline(
                  result.selectedJobs.map(j => j.start),
                  result.selectedJobs.map(j => j.end),
                  result.selectedJobs.map(j => j.profit),
                  result.selectedJobs.map(j => j.index)
              );
          }, 300);
      }
  
      function renderTimeline(startTime, endTime, profit, selectedIndices) {
          timelineElement.innerHTML = '';
          
          // Find the max end time for scaling
          const maxTime = Math.max(...endTime, 10); // Minimum 10 units
          const containerWidth = Math.max(timelineElement.offsetWidth, 600); // Minimum width
          
          // Create a scale factor
          const scale = (containerWidth - 40) / maxTime;
          
          // Create timeline axis container
          const axisContainer = document.createElement('div');
          axisContainer.className = 'mb-8 overflow-x-auto pb-4';
          
          // Create timeline axis
          const axis = document.createElement('div');
          axis.className = 'h-12 flex items-end relative border-b border-gray-200 min-w-full';
          axis.style.minWidth = `${maxTime * scale + 40}px`;
          
          // Add time markers
          for (let i = 0; i <= maxTime; i++) {
              if (i % Math.ceil(maxTime / 10) === 0 || i === maxTime) {
                  const marker = document.createElement('div');
                  marker.className = 'absolute text-xs text-gray-500';
                  marker.style.left = `${i * scale + 20}px`;
                  marker.style.bottom = '-20px';
                  marker.textContent = i;
                  axis.appendChild(marker);
                  
                  // Vertical line at marker
                  const line = document.createElement('div');
                  line.className = 'absolute h-2 w-px bg-gray-300';
                  line.style.left = `${i * scale + 20}px`;
                  line.style.bottom = '0';
                  axis.appendChild(line);
              }
          }
          
          axisContainer.appendChild(axis);
          timelineElement.appendChild(axisContainer);
          
          // Create job bars container
          const jobsContainer = document.createElement('div');
          jobsContainer.className = 'relative min-w-full';
          jobsContainer.style.minWidth = `${maxTime * scale + 40}px`;
          jobsContainer.style.height = `${Math.max(selectedIndices.length * 50, 150)}px`;
          
          // Create job bars
          startTime.forEach((start, index) => {
              const jobIndex = selectedIndices[index];
              const jobBar = document.createElement('div');
              jobBar.className = `absolute rounded-lg job-bar ${index % 2 === 0 ? 'bg-indigo-500' : 'bg-indigo-600'} shadow-md`;
              jobBar.style.left = `${start * scale + 20}px`;
              jobBar.style.width = `${(endTime[index] - start) * scale}px`;
              jobBar.style.top = `${index * 50 + 20}px`;
              jobBar.style.height = '30px';
              jobBar.title = `Job ${jobIndex + 1}: ${start}-${endTime[index]} ($${profit[index]})`;
              jobBar.style.transitionDelay = `${index * 50}ms`;
              jobBar.classList.add('animate__animated', 'animate__fadeInRight');
              
              // Add profit label inside bar
              const label = document.createElement('div');
              label.className = 'absolute text-white text-xs font-medium flex items-center h-full px-2 truncate';
              label.textContent = `$${profit[index]}`;
              jobBar.appendChild(label);
              
              // Add job number indicator
              const jobNumber = document.createElement('div');
              jobNumber.className = 'absolute -top-5 left-0 text-xs font-medium text-gray-700';
              jobNumber.textContent = `Job ${jobIndex + 1}`;
              jobBar.appendChild(jobNumber);
              
              jobsContainer.appendChild(jobBar);
          });
          
          timelineElement.appendChild(jobsContainer);
          
          // Add animation to job bars on hover
          document.querySelectorAll('.job-bar').forEach(bar => {
              bar.addEventListener('mouseenter', () => {
                  bar.classList.add('shadow-lg');
                  bar.style.transform = 'translateY(-3px)';
              });
              bar.addEventListener('mouseleave', () => {
                  bar.classList.remove('shadow-lg');
                  bar.style.transform = '';
              });
          });
      }
  });