/**
 * performance.js
 * Benchmarking and timing utilities for sorting and searching algorithms.
 */

import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort
} from './sorting.js';

import {
  linearSearch,
  binarySearch
} from './searching.js';

export const SORTING_ALGORITHMS = {
  "Bubble Sort": bubbleSort,
  "Selection Sort": selectionSort,
  "Insertion Sort": insertionSort,
  "Merge Sort": mergeSort,
  "Quick Sort": quickSort
};

export const SEARCHING_ALGORITHMS = {
  "Linear Search": linearSearch,
  "Binary Search": binarySearch
};

/**
 * Measure pure execution time for a single sorting algorithm run
 * Returns execution time in seconds (matching Python perf_counter) and ms
 */
export function measureSortingTime(array, algorithmName) {
  const fn = SORTING_ALGORITHMS[algorithmName];
  if (!fn) return null;

  const testArray = [...array];
  const t0 = performance.now();
  const result = fn(testArray);
  const t1 = performance.now();

  const elapsedMs = t1 - t0;
  return {
    algorithm: algorithmName,
    timeSeconds: elapsedMs / 1000,
    timeMs: elapsedMs,
    comparisons: result.comparisons,
    swaps: result.swaps,
    stepCount: result.steps.length
  };
}

/**
 * Measure pure execution time for a single searching algorithm run
 */
export function measureSearchingTime(array, target, algorithmName) {
  const fn = SEARCHING_ALGORITHMS[algorithmName];
  if (!fn) return null;

  let testArray;
  if (algorithmName === "Binary Search") {
    testArray = [...array].sort((a, b) => a - b);
  } else {
    testArray = [...array];
  }

  const t0 = performance.now();
  const result = fn(testArray, target);
  const t1 = performance.now();

  const elapsedMs = t1 - t0;
  return {
    algorithm: algorithmName,
    timeSeconds: elapsedMs / 1000,
    timeMs: elapsedMs,
    comparisons: result.comparisons,
    foundIndex: result.foundIndex,
    stepCount: result.steps.length
  };
}

/**
 * Benchmark all sorting algorithms on the same input dataset
 */
export function compareSortingAlgorithms(array) {
  const results = [];
  const names = Object.keys(SORTING_ALGORITHMS);

  for (const name of names) {
    const stats = measureSortingTime(array, name);
    results.push(stats);
  }

  // Sort by execution time to determine fastest
  const sortedBySpeed = [...results].sort((a, b) => a.timeMs - b.timeMs);
  const fastest = sortedBySpeed[0]?.algorithm;

  return { results, fastest };
}

/**
 * Benchmark searching algorithms on the same input dataset
 */
export function compareSearchingAlgorithms(array, target) {
  const results = [];
  const names = Object.keys(SEARCHING_ALGORITHMS);

  for (const name of names) {
    const stats = measureSearchingTime(array, target, name);
    results.push(stats);
  }

  const sortedBySpeed = [...results].sort((a, b) => a.timeMs - b.timeMs);
  const fastest = sortedBySpeed[0]?.algorithm;

  return { results, fastest };
}
