/**
 * visualizer.js
 * High-performance, step-driven animation engine for sorting & searching visualizer.
 */

import { sound } from './audio.js';

export class Visualizer {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.statusElement = options.statusElement || null;
    this.speed = options.speed || 300; // delay in ms

    this.array = [];
    this.initialArray = [];
    this.steps = [];
    this.currentStep = 0;
    this.history = []; // Snapshots of array state at each step

    this.running = false;
    this.paused = false;
    this.timerId = null;

    this.mode = 'sorting'; // 'sorting' | 'searching'
    this.algorithm = '';
    this.target = null;

    this.sortedIndices = new Set();
    this.checkedIndices = new Set();
    this.discardedIndices = new Set();
    this.foundIndex = null;
    this.pivotIndex = null;
    this.comparingIndices = [];
    this.swappingIndices = [];
    this.pointers = {}; // { [index]: "i", [index2]: "j" }

    // Live metrics
    this.comparisonsCount = 0;
    this.swapsCount = 0;
    this.startTime = null;
    this.elapsedTimer = null;
    this.elapsedMs = 0;

    // Callbacks
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onMetricsChange = options.onMetricsChange || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
  }

  setArray(newArray) {
    this.reset();
    this.array = [...newArray];
    this.initialArray = [...newArray];
    this.render();
  }

  setSpeed(newSpeedMs) {
    this.speed = Math.max(5, newSpeedMs);
  }

  /**
   * Pre-calculates history snapshots so the user can step backward/forward seamlessly.
   */
  prepareHistory(steps, startArray) {
    this.steps = steps;
    this.history = [];
    let currentArr = [...startArray];
    let sortedSet = new Set();
    let checkedSet = new Set();
    let discardedSet = new Set();
    let found = null;
    let comparisons = 0;
    let swaps = 0;

    // Snapshot at step 0 (initial state)
    this.history.push({
      array: [...currentArr],
      sortedIndices: new Set(sortedSet),
      checkedIndices: new Set(checkedSet),
      discardedIndices: new Set(discardedSet),
      foundIndex: null,
      pivotIndex: null,
      comparingIndices: [],
      swappingIndices: [],
      pointers: {},
      comparisons: 0,
      swaps: 0,
      desc: "Ready to start"
    });

    for (let s of steps) {
      let comparing = [];
      let swapping = [];
      let pivot = null;
      let pointers = {};

      if (s.type === "compare") {
        comparing = [...s.indices];
        comparisons++;
        if (s.indices.length >= 2) {
          pointers[s.indices[0]] = "i";
          pointers[s.indices[1]] = "j";
        }
      } else if (s.type === "swap") {
        swapping = [...s.indices];
        swaps++;
        const [i, j] = s.indices;
        const temp = currentArr[i];
        currentArr[i] = currentArr[j];
        currentArr[j] = temp;
        pointers[i] = "swap";
        pointers[j] = "swap";
      } else if (s.type === "move") {
        swapping = [s.to];
        swaps++;
        currentArr[s.to] = s.value;
        pointers[s.to] = "shift";
      } else if (s.type === "move_value" || s.type === "insert") {
        swapping = [s.index];
        swaps++;
        currentArr[s.index] = s.value;
        pointers[s.index] = "write";
      } else if (s.type === "sorted") {
        sortedSet.add(s.index);
      } else if (s.type === "pivot_select") {
        pivot = s.index;
        pointers[s.index] = "pivot";
      } else if (s.type === "new_min") {
        pointers[s.index] = "min";
      } else if (s.type === "key_select") {
        pointers[s.index] = "key";
      } else if (s.type === "check") {
        comparing = [s.index];
        checkedSet.add(s.index);
        comparisons++;
        pointers[s.index] = "check";
        if (s.low !== undefined && s.high !== undefined) {
          pointers[s.low] = (pointers[s.low] ? pointers[s.low] + "/" : "") + "low";
          pointers[s.high] = (pointers[s.high] ? pointers[s.high] + "/" : "") + "high";
          pointers[s.index] = "mid";
        }
      } else if (s.type === "found") {
        found = s.index;
        pointers[s.index] = "MATCH!";
      } else if (s.type === "discard_left") {
        for (let idx = s.low; idx <= s.middle; idx++) {
          discardedSet.add(idx);
        }
      } else if (s.type === "discard_right") {
        for (let idx = s.middle; idx <= s.high; idx++) {
          discardedSet.add(idx);
        }
      }

      this.history.push({
        array: [...currentArr],
        sortedIndices: new Set(sortedSet),
        checkedIndices: new Set(checkedSet),
        discardedIndices: new Set(discardedSet),
        foundIndex: found,
        pivotIndex: pivot,
        comparingIndices: comparing,
        swappingIndices: swapping,
        pointers,
        comparisons,
        swaps,
        desc: s.desc
      });
    }
  }

  start(mode, algorithmName, stepsResult, target = null) {
    if (this.running) return;

    this.mode = mode;
    this.algorithm = algorithmName;
    this.target = target;
    this.currentStep = 0;
    this.running = true;
    this.paused = false;

    // Prepare steps & history
    this.prepareHistory(stepsResult.steps, this.array);

    this.comparisonsCount = 0;
    this.swapsCount = 0;
    this.startTime = performance.now();
    this.startElapsedTimer();

    this.onStateChange({ running: true, paused: false });
    this.updateFromSnapshot(0);
    this.animate();
  }

  startElapsedTimer() {
    if (this.elapsedTimer) clearInterval(this.elapsedTimer);
    this.elapsedTimer = setInterval(() => {
      if (this.running && !this.paused && this.startTime) {
        this.elapsedMs = performance.now() - this.startTime;
        this.onMetricsChange({
          comparisons: this.comparisonsCount,
          swaps: this.swapsCount,
          elapsedMs: this.elapsedMs,
          currentStep: this.currentStep,
          totalSteps: this.steps.length
        });
      }
    }, 50);
  }

  stopElapsedTimer() {
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
  }

  updateFromSnapshot(stepIndex) {
    const snap = this.history[stepIndex];
    if (!snap) return;

    this.array = [...snap.array];
    this.sortedIndices = new Set(snap.sortedIndices);
    this.checkedIndices = new Set(snap.checkedIndices);
    this.discardedIndices = new Set(snap.discardedIndices);
    this.foundIndex = snap.foundIndex;
    this.pivotIndex = snap.pivotIndex;
    this.comparingIndices = [...snap.comparingIndices];
    this.swappingIndices = [...snap.swappingIndices];
    this.pointers = { ...snap.pointers };
    this.comparisonsCount = snap.comparisons;
    this.swapsCount = snap.swaps;

    // Audio triggers
    if (snap.swappingIndices.length > 0) {
      const idx = snap.swappingIndices[0];
      sound.playNote(this.array[idx] || 50, 1, 100, 0.08, 'triangle');
    } else if (snap.comparingIndices.length > 0) {
      const idx = snap.comparingIndices[0];
      sound.playNote(this.array[idx] || 50, 1, 100, 0.05, 'sine');
    }

    if (snap.foundIndex !== null && stepIndex === this.history.length - 1) {
      sound.playSuccess();
    }

    this.render();
    this.onStatusChange(snap.desc);
    this.onMetricsChange({
      comparisons: this.comparisonsCount,
      swaps: this.swapsCount,
      elapsedMs: this.elapsedMs,
      currentStep: stepIndex,
      totalSteps: this.steps.length
    });
  }

  animate() {
    if (!this.running || this.paused) return;

    if (this.currentStep >= this.steps.length) {
      this.finish();
      return;
    }

    this.currentStep++;
    this.updateFromSnapshot(this.currentStep);

    this.timerId = setTimeout(() => {
      this.animate();
    }, this.speed);
  }

  pause() {
    if (this.running && !this.paused) {
      this.paused = true;
      if (this.timerId) clearTimeout(this.timerId);
      this.onStatusChange("Visualization paused");
      this.onStateChange({ running: true, paused: true });
    }
  }

  resume() {
    if (this.running && this.paused) {
      this.paused = false;
      this.onStatusChange("Resuming visualization...");
      this.onStateChange({ running: true, paused: false });
      this.animate();
    }
  }

  stepForward() {
    if (!this.running) return;
    this.pause();
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
      this.updateFromSnapshot(this.currentStep);
    }
    if (this.currentStep >= this.steps.length) {
      this.finish();
    }
  }

  stepBackward() {
    if (!this.running) return;
    this.pause();
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateFromSnapshot(this.currentStep);
    }
  }

  finish() {
    this.running = false;
    this.paused = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.stopElapsedTimer();

    if (this.mode === 'sorting') {
      // Mark all as sorted
      for (let i = 0; i < this.array.length; i++) {
        this.sortedIndices.add(i);
      }
      this.comparingIndices = [];
      this.swappingIndices = [];
      this.pointers = {};
      this.render();
      sound.playSuccess();
      this.onStatusChange("🎉 Sorting completed successfully!");
    } else if (this.mode === 'searching') {
      if (this.foundIndex !== null) {
        sound.playSuccess();
        this.onStatusChange(`🎯 Target ${this.target} found at index ${this.foundIndex}!`);
      } else {
        sound.playNotFound();
        this.onStatusChange(`❌ Target ${this.target} was not found in the array.`);
      }
    }

    this.onStateChange({ running: false, paused: false });
    this.onComplete();
  }

  reset() {
    this.running = false;
    this.paused = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.stopElapsedTimer();

    this.currentStep = 0;
    this.steps = [];
    this.history = [];
    this.sortedIndices.clear();
    this.checkedIndices.clear();
    this.discardedIndices.clear();
    this.foundIndex = null;
    this.pivotIndex = null;
    this.comparingIndices = [];
    this.swappingIndices = [];
    this.pointers = {};

    this.comparisonsCount = 0;
    this.swapsCount = 0;
    this.elapsedMs = 0;
    this.startTime = null;

    if (this.initialArray.length > 0) {
      this.array = [...this.initialArray];
    }

    this.render();
    this.onStatusChange("Visualizer ready. Click 'Start' to begin.");
    this.onMetricsChange({
      comparisons: 0,
      swaps: 0,
      elapsedMs: 0,
      currentStep: 0,
      totalSteps: 0
    });
    this.onStateChange({ running: false, paused: false });
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = '';
    const n = this.array.length;
    if (n === 0) return;

    const maxVal = Math.max(...this.array, 1);
    const minVal = Math.min(...this.array, 0);

    // Create wrapper
    const barsWrapper = document.createElement('div');
    barsWrapper.className = 'bars-wrapper';

    for (let i = 0; i < n; i++) {
      const val = this.array[i];
      const barCol = document.createElement('div');
      barCol.className = 'bar-col';
      barCol.setAttribute('data-index', i);

      // Pointer badge (e.g. "i", "j", "pivot", "mid")
      const pointerBadge = document.createElement('div');
      pointerBadge.className = 'bar-pointer';
      if (this.pointers[i]) {
        pointerBadge.textContent = this.pointers[i];
        pointerBadge.classList.add('active');
      }
      barCol.appendChild(pointerBadge);

      // Value label
      const valLabel = document.createElement('div');
      valLabel.className = 'bar-value';
      valLabel.textContent = val;
      barCol.appendChild(valLabel);

      // Bar element
      const bar = document.createElement('div');
      bar.className = 'bar-element';

      // Height calculation (min 8% for visibility)
      const heightPercent = Math.max(10, Math.round((val / maxVal) * 94));
      bar.style.height = `${heightPercent}%`;

      // Determine state class
      if (this.foundIndex === i) {
        bar.classList.add('bar-found');
      } else if (this.sortedIndices.has(i)) {
        bar.classList.add('bar-sorted');
      } else if (this.swappingIndices.includes(i)) {
        bar.classList.add('bar-swapping');
      } else if (this.comparingIndices.includes(i)) {
        bar.classList.add('bar-comparing');
      } else if (this.pivotIndex === i) {
        bar.classList.add('bar-pivot');
      } else if (this.discardedIndices.has(i)) {
        bar.classList.add('bar-discarded');
      } else if (this.checkedIndices.has(i)) {
        bar.classList.add('bar-checked');
      } else {
        bar.classList.add('bar-default');
      }

      barCol.appendChild(bar);

      // Index label
      const idxLabel = document.createElement('div');
      idxLabel.className = 'bar-index';
      idxLabel.textContent = i;
      barCol.appendChild(idxLabel);

      barsWrapper.appendChild(barCol);
    }

    this.container.appendChild(barsWrapper);
  }
}
