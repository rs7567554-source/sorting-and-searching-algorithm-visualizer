/**
 * searching.js
 * Implements searching algorithms matching the Python project logic,
 * recording granular step objects for the visualizer.
 * 
 * Step types:
 * - "check": { type: "check", index: i, value: arr[i], target: t, desc: string }
 * - "found": { type: "found", index: i, value: arr[i], target: t, desc: string }
 * - "discard_left": { type: "discard_left", low: l, middle: m, desc: string }
 * - "discard_right": { type: "discard_right", middle: m, high: h, desc: string }
 * - "not_found": { type: "not_found", target: t, desc: string }
 */

export function linearSearch(array, target) {
  const steps = [];
  let comparisons = 0;

  for (let i = 0; i < array.length; i++) {
    comparisons++;
    steps.push({
      type: "check",
      index: i,
      value: array[i],
      target: target,
      desc: `Checking index ${i}: Is element ${array[i]} equal to target ${target}?`
    });

    if (array[i] === target) {
      steps.push({
        type: "found",
        index: i,
        value: array[i],
        target: target,
        desc: `Target ${target} successfully found at index ${i}!`
      });
      return { foundIndex: i, steps, comparisons };
    }
  }

  steps.push({
    type: "not_found",
    target: target,
    desc: `Target ${target} was not found in the array.`
  });

  return { foundIndex: -1, steps, comparisons };
}

export function binarySearch(array, target) {
  const steps = [];
  let comparisons = 0;
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    comparisons++;

    steps.push({
      type: "check",
      index: middle,
      value: array[middle],
      target: target,
      low: low,
      high: high,
      desc: `Checking middle index ${middle} (low=${low}, high=${high}): Is ${array[middle]} equal to target ${target}?`
    });

    if (array[middle] === target) {
      steps.push({
        type: "found",
        index: middle,
        value: array[middle],
        target: target,
        desc: `Target ${target} successfully found at middle index ${middle}!`
      });
      return { foundIndex: middle, steps, comparisons };
    }

    if (array[middle] < target) {
      steps.push({
        type: "discard_left",
        low: low,
        middle: middle,
        desc: `Since ${array[middle]} < ${target}, discarding left partition [${low}..${middle}]`
      });
      low = middle + 1;
    } else {
      steps.push({
        type: "discard_right",
        middle: middle,
        high: high,
        desc: `Since ${array[middle]} > ${target}, discarding right partition [${middle}..${high}]`
      });
      high = middle - 1;
    }
  }

  steps.push({
    type: "not_found",
    target: target,
    desc: `Target ${target} was not found in the array.`
  });

  return { foundIndex: -1, steps, comparisons };
}
