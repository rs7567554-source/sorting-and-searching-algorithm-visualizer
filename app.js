/**
 * app.js
 * Main application coordinator for Sorting & Searching Algorithm Visualizer
 */

import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort } from './sorting.js';
import { linearSearch, binarySearch } from './searching.js';
import {
  measureSortingTime,
  measureSearchingTime,
  compareSortingAlgorithms,
  compareSearchingAlgorithms,
  SORTING_ALGORITHMS,
  SEARCHING_ALGORITHMS
} from './performance.js';
import { sound } from './audio.js';
import { Visualizer } from './visualizer.js';

// Algorithm Metadata & Information Database
const ALGORITHM_INFO = {
  "Bubble Sort": {
    category: "Sorting",
    timeBest: "O(n)",
    timeAvg: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
    stable: "Yes",
    inPlace: "Yes",
    summary: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Larger elements bubble up to the end with each pass.",
    stepsDesc: [
      "1. Compare adjacent pairs from left to right.",
      "2. Swap if left element is greater than right element.",
      "3. Lock the largest unsorted element at the end.",
      "4. Repeat until no swaps are needed."
    ],
    pseudocode: `procedure bubbleSort(A : list of sortable items)
    n = length(A)
    repeat
        swapped = false
        for i = 1 to n-1 inclusive do
            if A[i-1] > A[i] then
                swap(A[i-1], A[i])
                swapped = true
            end if
        end for
        n = n - 1
    until not swapped
end procedure`
  },
  "Selection Sort": {
    category: "Sorting",
    timeBest: "O(n²)",
    timeAvg: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
    stable: "No",
    inPlace: "Yes",
    summary: "Divides the array into a sorted and unsorted region. Repeatedly finds the minimum element in the unsorted region and swaps it to the end of the sorted region.",
    stepsDesc: [
      "1. Find the smallest element in the remaining unsorted subarray.",
      "2. Swap it with the first unsorted element.",
      "3. Expand the sorted boundary by one position.",
      "4. Repeat until the whole array is partitioned and sorted."
    ],
    pseudocode: `procedure selectionSort(A : list of sortable items)
    n = length(A)
    for i = 0 to n-1 do
        min_idx = i
        for j = i+1 to n do
            if A[j] < A[min_idx] then
                min_idx = j
            end if
        end for
        if min_idx != i then
            swap(A[i], A[min_idx])
        end if
    end for
end procedure`
  },
  "Insertion Sort": {
    category: "Sorting",
    timeBest: "O(n)",
    timeAvg: "O(n²)",
    timeWorst: "O(n²)",
    space: "O(1)",
    stable: "Yes",
    inPlace: "Yes",
    summary: "Builds the final sorted array one item at a time. It iterates through the input elements and grows a sorted output list by shifting larger elements.",
    stepsDesc: [
      "1. Pick the next element (key) from the unsorted portion.",
      "2. Compare the key with elements in the sorted portion from right to left.",
      "3. Shift all larger elements one position to the right.",
      "4. Insert the key into its correct vacant position."
    ],
    pseudocode: `procedure insertionSort(A : list of sortable items)
    for i = 1 to length(A) - 1 do
        key = A[i]
        j = i - 1
        while j >= 0 and A[j] > key do
            A[j + 1] = A[j]
            j = j - 1
        end while
        A[j + 1] = key
    end for
end procedure`
  },
  "Merge Sort": {
    category: "Sorting",
    timeBest: "O(n log n)",
    timeAvg: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
    stable: "Yes",
    inPlace: "No",
    summary: "A divide-and-conquer algorithm that recursively splits the array in half until single elements remain, then merges sorted halves back together in order.",
    stepsDesc: [
      "1. Divide the unsorted list into n sublists of size 1.",
      "2. Repeatedly merge sublists to produce new sorted sublists.",
      "3. Compare front elements of both halves and insert the smaller value.",
      "4. Continue until only 1 full sorted list remains."
    ],
    pseudocode: `procedure mergeSort(A : list of sortable items)
    if length(A) <= 1 then return A
    mid = length(A) / 2
    left = mergeSort(A[0..mid])
    right = mergeSort(A[mid..end])
    return merge(left, right)
end procedure`
  },
  "Quick Sort": {
    category: "Sorting",
    timeBest: "O(n log n)",
    timeAvg: "O(n log n)",
    timeWorst: "O(n²)",
    space: "O(log n)",
    stable: "No",
    inPlace: "Yes",
    summary: "A divide-and-conquer algorithm that selects a 'pivot' element and partitions the array into elements smaller than the pivot and elements greater than the pivot.",
    stepsDesc: [
      "1. Select a pivot element (last element in Lomuto scheme).",
      "2. Partition the array: reorder so elements < pivot are left, elements > pivot are right.",
      "3. Place pivot in its final sorted index.",
      "4. Recursively apply Quick Sort to sub-arrays left and right of pivot."
    ],
    pseudocode: `procedure quickSort(A, low, high)
    if low < high then
        p = partition(A, low, high)
        quickSort(A, low, p - 1)
        quickSort(A, p + 1, high)
    end if
end procedure`
  },
  "Linear Search": {
    category: "Searching",
    timeBest: "O(1)",
    timeAvg: "O(n)",
    timeWorst: "O(n)",
    space: "O(1)",
    stable: "N/A",
    inPlace: "Yes",
    summary: "A sequential search algorithm that starts at one end and inspects every element until the desired target is found or the end of the list is reached.",
    stepsDesc: [
      "1. Start at the first element (index 0).",
      "2. Compare current element with the target value.",
      "3. If equal, return current index as found.",
      "4. Otherwise advance to the next index; if end reached, target is not found."
    ],
    pseudocode: `procedure linearSearch(A, target)
    for i = 0 to length(A) - 1 do
        if A[i] == target then
            return i
        end if
    end for
    return -1 // Not found
end procedure`
  },
  "Binary Search": {
    category: "Searching",
    timeBest: "O(1)",
    timeAvg: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(1)",
    stable: "N/A",
    inPlace: "Yes",
    summary: "A fast search algorithm that operates on a sorted array by repeatedly dividing the search interval in half. Compares target to the middle element.",
    stepsDesc: [
      "1. Ensure the array is sorted (automatically sorted if needed).",
      "2. Calculate middle index: mid = floor((low + high) / 2).",
      "3. If arr[mid] == target, item is found.",
      "4. If arr[mid] < target, narrow search to right half (low = mid + 1).",
      "5. If arr[mid] > target, narrow search to left half (high = mid - 1)."
    ],
    pseudocode: `procedure binarySearch(A : sorted array, target)
    low = 0, high = length(A) - 1
    while low <= high do
        mid = floor((low + high) / 2)
        if A[mid] == target then return mid
        else if A[mid] < target then low = mid + 1
        else high = mid - 1
    end while
    return -1 // Not found
end procedure`
  }
};

class App {
  constructor() {
    this.currentMode = 'sorting'; // 'sorting' | 'searching' | 'benchmark'
    this.currentAlgorithm = 'Bubble Sort';
    this.arraySize = 10;
    this.arrayType = 'random';
    this.array = [];
    this.target = null;
    this.speed = 400; // ms

    this.cacheDOMElements();
    this.initVisualizer();
    this.bindEvents();
    this.initTheme();
    this.generateArray();
    this.updateAlgorithmDetails();
  }

  cacheDOMElements() {
    // Nav tabs
    this.navBtns = document.querySelectorAll('.nav-tab');
    this.views = {
      visualizer: document.getElementById('visualizerView'),
      benchmark: document.getElementById('benchmarkView')
    };

    // Controls
    this.algorithmSelect = document.getElementById('algorithmSelect');
    this.arraySizeSelect = document.getElementById('arraySizeSelect');
    this.arrayTypeSelect = document.getElementById('arrayTypeSelect');
    this.customArrayInput = document.getElementById('customArrayInput');
    this.customArrayGroup = document.getElementById('customArrayGroup');
    this.targetInputGroup = document.getElementById('targetInputGroup');
    this.targetInput = document.getElementById('targetInput');
    this.pickRandomTargetBtn = document.getElementById('pickRandomTargetBtn');
    this.speedSlider = document.getElementById('speedSlider');
    this.speedDisplay = document.getElementById('speedDisplay');

    // Buttons
    this.generateBtn = document.getElementById('generateBtn');
    this.startBtn = document.getElementById('startBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.resumeBtn = document.getElementById('resumeBtn');
    this.stepBackBtn = document.getElementById('stepBackBtn');
    this.stepForwardBtn = document.getElementById('stepForwardBtn');
    this.resetBtn = document.getElementById('resetBtn');

    // Visualizer container & status
    this.canvasContainer = document.getElementById('visualizerCanvas');
    this.statusText = document.getElementById('statusText');
    this.statComparisons = document.getElementById('statComparisons');
    this.statSwaps = document.getElementById('statSwaps');
    this.statTime = document.getElementById('statTime');
    this.statExecTime = document.getElementById('statExecTime');
    this.statStepProgress = document.getElementById('statStepProgress');

    // Algorithm Info Cards
    this.infoTitle = document.getElementById('infoTitle');
    this.infoBadge = document.getElementById('infoBadge');
    this.infoSummary = document.getElementById('infoSummary');
    this.infoSteps = document.getElementById('infoSteps');
    this.infoTimeBest = document.getElementById('infoTimeBest');
    this.infoTimeAvg = document.getElementById('infoTimeAvg');
    this.infoTimeWorst = document.getElementById('infoTimeWorst');
    this.infoSpace = document.getElementById('infoSpace');
    this.infoStable = document.getElementById('infoStable');
    this.infoInPlace = document.getElementById('infoInPlace');
    this.infoPseudocode = document.getElementById('infoPseudocode');

    // Header buttons
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');

    // Benchmark view elements
    this.runBenchmarkBtn = document.getElementById('runBenchmarkBtn');
    this.benchmarkTypeSelect = document.getElementById('benchmarkTypeSelect');
    this.benchmarkSizeSelect = document.getElementById('benchmarkSizeSelect');
    this.benchmarkTableBody = document.getElementById('benchmarkTableBody');
    this.benchmarkFastestAlert = document.getElementById('benchmarkFastestAlert');
    this.benchmarkChartContainer = document.getElementById('benchmarkChartContainer');
  }

  initVisualizer() {
    this.visualizer = new Visualizer(this.canvasContainer, {
      speed: this.speed,
      onStatusChange: (status) => {
        this.statusText.textContent = status;
      },
      onMetricsChange: (metrics) => {
        this.statComparisons.textContent = metrics.comparisons;
        this.statSwaps.textContent = metrics.swaps;
        this.statTime.textContent = `${(metrics.elapsedMs / 1000).toFixed(2)}s`;
        if (metrics.totalSteps > 0) {
          this.statStepProgress.textContent = `${metrics.currentStep} / ${metrics.totalSteps}`;
        } else {
          this.statStepProgress.textContent = '--';
        }
      },
      onStateChange: (state) => {
        this.updateControlButtonsState(state);
      },
      onComplete: () => {
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resumeBtn.disabled = true;
      }
    });
  }

  bindEvents() {
    // Mode Switching
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = btn.dataset.tab;
        this.switchMode(mode);
      });
    });

    // Algorithm Change
    this.algorithmSelect.addEventListener('change', () => {
      this.currentAlgorithm = this.algorithmSelect.value;
      this.updateAlgorithmDetails();
      this.checkTargetInputVisibility();
      this.resetVisualizer();
    });

    // Array Size Change
    this.arraySizeSelect.addEventListener('change', () => {
      this.arraySize = parseInt(this.arraySizeSelect.value, 10);
      this.generateArray();
    });

    // Array Type Change
    this.arrayTypeSelect.addEventListener('change', () => {
      this.arrayType = this.arrayTypeSelect.value;
      if (this.arrayType === 'custom') {
        this.customArrayGroup.style.display = 'flex';
      } else {
        this.customArrayGroup.style.display = 'none';
        this.generateArray();
      }
    });

    this.customArrayInput.addEventListener('change', () => {
      this.generateArray();
    });

    // Generate Array Button
    this.generateBtn.addEventListener('click', () => {
      this.generateArray();
    });

    // Pick Random Target Button
    this.pickRandomTargetBtn.addEventListener('click', () => {
      if (this.array.length > 0) {
        const randomElement = this.array[Math.floor(Math.random() * this.array.length)];
        this.targetInput.value = randomElement;
      }
    });

    // Speed Slider
    this.speedSlider.addEventListener('input', () => {
      const sliderVal = parseInt(this.speedSlider.value, 10);
      // Map 100-1000 slider to speed delay
      this.speed = sliderVal;
      this.speedDisplay.textContent = `${sliderVal}ms`;
      this.visualizer.setSpeed(sliderVal);
    });

    // Playback Controls
    this.startBtn.addEventListener('click', () => this.startAlgorithm());
    this.pauseBtn.addEventListener('click', () => this.visualizer.pause());
    this.resumeBtn.addEventListener('click', () => this.visualizer.resume());
    this.stepBackBtn.addEventListener('click', () => this.visualizer.stepBackward());
    this.stepForwardBtn.addEventListener('click', () => this.visualizer.stepForward());
    this.resetBtn.addEventListener('click', () => this.resetVisualizer());

    // Header Controls
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    this.soundToggleBtn.addEventListener('click', () => this.toggleSound());

    // Benchmark Controls
    this.runBenchmarkBtn.addEventListener('click', () => this.runBenchmark());
    this.benchmarkTypeSelect.addEventListener('change', () => this.runBenchmark());
    this.benchmarkSizeSelect.addEventListener('change', () => this.runBenchmark());
  }

  initTheme() {
    const savedTheme = localStorage.getItem('algo_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButton(savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('algo_theme', newTheme);
    this.updateThemeButton(newTheme);
  }

  updateThemeButton(theme) {
    if (theme === 'light') {
      this.themeToggleBtn.innerHTML = '🌙 <span>Dark Mode</span>';
    } else {
      this.themeToggleBtn.innerHTML = '☀️ <span>Light Mode</span>';
    }
  }

  toggleSound() {
    const enabled = sound.toggle();
    if (enabled) {
      this.soundToggleBtn.innerHTML = '🔊 <span>Sound: ON</span>';
      this.soundToggleBtn.classList.add('btn-sound-on');
    } else {
      this.soundToggleBtn.innerHTML = '🔇 <span>Sound: OFF</span>';
      this.soundToggleBtn.classList.remove('btn-sound-on');
    }
  }

  switchMode(mode) {
    this.currentMode = mode;

    this.navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === mode);
    });

    if (mode === 'benchmark') {
      this.views.visualizer.style.display = 'none';
      this.views.benchmark.style.display = 'block';
      this.runBenchmark();
    } else {
      this.views.visualizer.style.display = 'block';
      this.views.benchmark.style.display = 'none';

      // Repopulate algorithm select based on mode
      this.populateAlgorithmDropdown(mode);
      this.checkTargetInputVisibility();
      this.resetVisualizer();
    }
  }

  populateAlgorithmDropdown(mode) {
    this.algorithmSelect.innerHTML = '';

    if (mode === 'sorting') {
      const sortingAlgos = [
        "Bubble Sort",
        "Selection Sort",
        "Insertion Sort",
        "Merge Sort",
        "Quick Sort"
      ];
      sortingAlgos.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        this.algorithmSelect.appendChild(opt);
      });
      this.currentAlgorithm = sortingAlgos[0];
    } else if (mode === 'searching') {
      const searchingAlgos = [
        "Linear Search",
        "Binary Search"
      ];
      searchingAlgos.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        this.algorithmSelect.appendChild(opt);
      });
      this.currentAlgorithm = searchingAlgos[0];
    }

    this.algorithmSelect.value = this.currentAlgorithm;
    this.updateAlgorithmDetails();
  }

  checkTargetInputVisibility() {
    const isSearching = this.currentAlgorithm === 'Linear Search' || this.currentAlgorithm === 'Binary Search';
    this.targetInputGroup.style.display = isSearching ? 'flex' : 'none';

    // If binary search, ensure user knows the array is automatically sorted
    if (this.currentAlgorithm === 'Binary Search' && this.array.length > 0) {
      this.array = [...this.array].sort((a, b) => a - b);
      this.visualizer.setArray(this.array);
    }
  }

  generateArray() {
    const size = this.arraySize;

    if (this.arrayType === 'custom') {
      const raw = this.customArrayInput.value.trim();
      if (raw) {
        const parsed = raw.split(/[\s,]+/).map(x => parseInt(x, 10)).filter(x => !isNaN(x));
        if (parsed.length > 0) {
          this.array = parsed.slice(0, 100);
        } else {
          this.array = this.createRandomArray(size);
        }
      } else {
        this.array = this.createRandomArray(size);
      }
    } else if (this.arrayType === 'reversed') {
      this.array = Array.from({ length: size }, (_, i) => Math.round(((size - i) / size) * 90 + 10));
    } else if (this.arrayType === 'nearly_sorted') {
      this.array = Array.from({ length: size }, (_, i) => Math.round(((i + 1) / size) * 85 + 10));
      // Swap 2 random pairs
      if (size > 3) {
        const i1 = Math.floor(Math.random() * (size - 1));
        const temp = this.array[i1];
        this.array[i1] = this.array[i1 + 1];
        this.array[i1 + 1] = temp;
      }
    } else if (this.arrayType === 'few_unique') {
      const uniqueValues = [15, 35, 60, 85];
      this.array = Array.from({ length: size }, () => uniqueValues[Math.floor(Math.random() * uniqueValues.length)]);
    } else {
      // Default: random array (matching Python randint(10, 100))
      this.array = this.createRandomArray(size);
    }

    if (this.currentAlgorithm === 'Binary Search') {
      this.array.sort((a, b) => a - b);
    }

    // Default target suggestion if empty
    if (!this.targetInput.value || !this.array.includes(parseInt(this.targetInput.value, 10))) {
      this.targetInput.value = this.array[Math.floor(Math.random() * this.array.length)];
    }

    this.visualizer.setArray(this.array);
    this.statExecTime.textContent = '--';
    this.statusText.textContent = `New ${this.arrayType} dataset of size ${this.array.length} generated.`;
  }

  createRandomArray(size) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 91) + 10);
  }

  updateAlgorithmDetails() {
    const info = ALGORITHM_INFO[this.currentAlgorithm];
    if (!info) return;

    this.infoTitle.textContent = this.currentAlgorithm;
    this.infoBadge.textContent = info.category;
    this.infoSummary.textContent = info.summary;

    this.infoTimeBest.textContent = info.timeBest;
    this.infoTimeAvg.textContent = info.timeAvg;
    this.infoTimeWorst.textContent = info.timeWorst;
    this.infoSpace.textContent = info.space;
    this.infoStable.textContent = info.stable;
    this.infoInPlace.textContent = info.inPlace;

    this.infoSteps.innerHTML = '';
    info.stepsDesc.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      this.infoSteps.appendChild(li);
    });

    this.infoPseudocode.textContent = info.pseudocode;
  }

  startAlgorithm() {
    const isSearching = this.currentAlgorithm === 'Linear Search' || this.currentAlgorithm === 'Binary Search';

    if (isSearching) {
      const targetStr = this.targetInput.value.trim();
      if (!targetStr) {
        this.statusText.textContent = "⚠️ Please enter a search target.";
        this.targetInput.focus();
        return;
      }
      const targetVal = parseInt(targetStr, 10);
      if (isNaN(targetVal)) {
        this.statusText.textContent = "⚠️ Search target must be a valid integer.";
        return;
      }
      this.target = targetVal;

      // Measure pure execution time
      const perf = measureSearchingTime(this.array, this.target, this.currentAlgorithm);
      this.statExecTime.textContent = `${(perf.timeSeconds).toFixed(8)} s (${perf.timeMs.toFixed(3)} ms)`;

      // If Binary Search, ensure array is sorted for visualization
      if (this.currentAlgorithm === 'Binary Search') {
        this.array = [...this.array].sort((a, b) => a - b);
        this.visualizer.array = [...this.array];
      }

      const searchFn = SEARCHING_ALGORITHMS[this.currentAlgorithm];
      const result = searchFn(this.array, this.target);
      this.visualizer.start('searching', this.currentAlgorithm, result, this.target);

    } else {
      // Sorting
      const perf = measureSortingTime(this.array, this.currentAlgorithm);
      this.statExecTime.textContent = `${(perf.timeSeconds).toFixed(8)} s (${perf.timeMs.toFixed(3)} ms)`;

      const sortFn = SORTING_ALGORITHMS[this.currentAlgorithm];
      const result = sortFn(this.array);
      this.visualizer.start('sorting', this.currentAlgorithm, result);
    }
  }

  resetVisualizer() {
    this.visualizer.reset();
    this.statExecTime.textContent = '--';
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.resumeBtn.disabled = true;
    this.stepBackBtn.disabled = true;
    this.stepForwardBtn.disabled = true;
  }

  updateControlButtonsState(state) {
    if (state.running) {
      this.startBtn.disabled = true;
      this.generateBtn.disabled = true;
      this.arraySizeSelect.disabled = true;
      this.arrayTypeSelect.disabled = true;
      this.algorithmSelect.disabled = true;

      if (state.paused) {
        this.pauseBtn.disabled = true;
        this.resumeBtn.disabled = false;
        this.stepBackBtn.disabled = false;
        this.stepForwardBtn.disabled = false;
      } else {
        this.pauseBtn.disabled = false;
        this.resumeBtn.disabled = true;
        this.stepBackBtn.disabled = true;
        this.stepForwardBtn.disabled = true;
      }
    } else {
      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.resumeBtn.disabled = true;
      this.stepBackBtn.disabled = true;
      this.stepForwardBtn.disabled = true;
      this.generateBtn.disabled = false;
      this.arraySizeSelect.disabled = false;
      this.arrayTypeSelect.disabled = false;
      this.algorithmSelect.disabled = false;
    }
  }

  // Performance Benchmarking View
  runBenchmark() {
    const type = this.benchmarkTypeSelect.value;
    const size = parseInt(this.benchmarkSizeSelect.value, 10);
    const testArray = Array.from({ length: size }, () => Math.floor(Math.random() * 500) + 1);

    this.benchmarkTableBody.innerHTML = '';
    this.benchmarkChartContainer.innerHTML = '';

    if (type === 'sorting') {
      const benchmarkData = compareSortingAlgorithms(testArray);
      this.renderSortingBenchmark(benchmarkData, size);
    } else {
      const target = testArray[Math.floor(Math.random() * testArray.length)];
      const benchmarkData = compareSearchingAlgorithms(testArray, target);
      this.renderSearchingBenchmark(benchmarkData, size, target);
    }
  }

  renderSortingBenchmark(data, size) {
    this.benchmarkFastestAlert.innerHTML = `
      <div class="alert-icon">⚡</div>
      <div>
        <strong>Fastest Algorithm:</strong> <span class="badge badge-success">${data.fastest}</span> on dataset size N = ${size}.
      </div>
    `;

    const maxTime = Math.max(...data.results.map(r => r.timeMs), 0.001);

    data.results.forEach(res => {
      const isFastest = res.algorithm === data.fastest;
      const tr = document.createElement('tr');
      if (isFastest) tr.className = 'fastest-row';

      tr.innerHTML = `
        <td><strong>${res.algorithm}</strong> ${isFastest ? '<span class="badge-mini">FASTEST</span>' : ''}</td>
        <td><code>${res.timeMs.toFixed(4)} ms</code></td>
        <td><code>${res.timeSeconds.toFixed(8)} s</code></td>
        <td>${res.comparisons.toLocaleString()}</td>
        <td>${res.swaps.toLocaleString()}</td>
        <td>${res.stepCount.toLocaleString()}</td>
      `;
      this.benchmarkTableBody.appendChild(tr);

      // Add to comparative visual bar chart
      const chartRow = document.createElement('div');
      chartRow.className = 'benchmark-chart-row';
      const widthPct = Math.max(4, Math.round((res.timeMs / maxTime) * 100));

      chartRow.innerHTML = `
        <div class="chart-label">${res.algorithm}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill ${isFastest ? 'chart-bar-fastest' : ''}" style="width: ${widthPct}%">
            <span>${res.timeMs.toFixed(3)} ms</span>
          </div>
        </div>
      `;
      this.benchmarkChartContainer.appendChild(chartRow);
    });
  }

  renderSearchingBenchmark(data, size, target) {
    this.benchmarkFastestAlert.innerHTML = `
      <div class="alert-icon">⚡</div>
      <div>
        <strong>Fastest Algorithm:</strong> <span class="badge badge-success">${data.fastest}</span> searching for target <code>${target}</code> in dataset size N = ${size}.
      </div>
    `;

    const maxTime = Math.max(...data.results.map(r => r.timeMs), 0.0001);

    data.results.forEach(res => {
      const isFastest = res.algorithm === data.fastest;
      const tr = document.createElement('tr');
      if (isFastest) tr.className = 'fastest-row';

      tr.innerHTML = `
        <td><strong>${res.algorithm}</strong> ${isFastest ? '<span class="badge-mini">FASTEST</span>' : ''}</td>
        <td><code>${res.timeMs.toFixed(4)} ms</code></td>
        <td><code>${res.timeSeconds.toFixed(8)} s</code></td>
        <td>${res.comparisons.toLocaleString()}</td>
        <td>N/A</td>
        <td>${res.stepCount.toLocaleString()}</td>
      `;
      this.benchmarkTableBody.appendChild(tr);

      const chartRow = document.createElement('div');
      chartRow.className = 'benchmark-chart-row';
      const widthPct = Math.max(4, Math.round((res.timeMs / maxTime) * 100));

      chartRow.innerHTML = `
        <div class="chart-label">${res.algorithm}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill ${isFastest ? 'chart-bar-fastest' : ''}" style="width: ${widthPct}%">
            <span>${res.timeMs.toFixed(4)} ms</span>
          </div>
        </div>
      `;
      this.benchmarkChartContainer.appendChild(chartRow);
    });
  }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.algoApp = new App();
});
