/**
 * sorting.js
 * Implements sorting algorithms matching the Python project logic,
 * recording granular step objects for the visualizer.
 * 
 * Step types:
 * - "compare": { type: "compare", indices: [i, j], values: [arr[i], arr[j]], desc: string }
 * - "swap": { type: "swap", indices: [i, j], values: [arr[i], arr[j]], desc: string }
 * - "move": { type: "move", from: i, to: j, value: v, desc: string }
 * - "move_value": { type: "move_value", index: k, value: v, desc: string }
 * - "insert": { type: "insert", index: k, value: v, desc: string }
 * - "sorted": { type: "sorted", index: i, desc: string }
 * - "pivot_select": { type: "pivot_select", index: p, value: v, desc: string }
 * - "new_min": { type: "new_min", index: m, value: v, desc: string }
 * - "key_select": { type: "key_select", index: k, value: v, desc: string }
 */

export function bubbleSort(array) {
  const arr = [...array];
  const steps = [];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      steps.push({
        type: "compare",
        indices: [j, j + 1],
        values: [arr[j], arr[j + 1]],
        desc: `Comparing element at index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]})`
      });

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swaps++;

        steps.push({
          type: "swap",
          indices: [j, j + 1],
          values: [arr[j], arr[j + 1]],
          desc: `Swapping ${arr[j + 1]} and ${arr[j]} since ${arr[j + 1]} > ${arr[j]}`
        });
      }
    }

    steps.push({
      type: "sorted",
      index: n - i - 1,
      desc: `Element at index ${n - i - 1} (${arr[n - i - 1]}) is now in its sorted position`
    });
  }

  return { sortedArray: arr, steps, comparisons, swaps };
}

export function selectionSort(array) {
  const arr = [...array];
  const steps = [];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n; i++) {
    let minimum = i;

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      steps.push({
        type: "compare",
        indices: [minimum, j],
        values: [arr[minimum], arr[j]],
        desc: `Comparing current minimum at index ${minimum} (${arr[minimum]}) with element at index ${j} (${arr[j]})`
      });

      if (arr[j] < arr[minimum]) {
        minimum = j;
        steps.push({
          type: "new_min",
          index: minimum,
          value: arr[minimum],
          desc: `Found new minimum value ${arr[minimum]} at index ${minimum}`
        });
      }
    }

    if (minimum !== i) {
      const temp = arr[i];
      arr[i] = arr[minimum];
      arr[minimum] = temp;
      swaps++;

      steps.push({
        type: "swap",
        indices: [i, minimum],
        values: [arr[i], arr[minimum]],
        desc: `Swapping minimum element (${arr[i]}) into position ${i}`
      });
    }

    steps.push({
      type: "sorted",
      index: i,
      desc: `Element at index ${i} (${arr[i]}) is now sorted`
    });
  }

  return { sortedArray: arr, steps, comparisons, swaps };
}

export function insertionSort(array) {
  const arr = [...array];
  const steps = [];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      type: "key_select",
      index: i,
      value: key,
      desc: `Selected key ${key} at index ${i} to insert into sorted prefix`
    });

    while (j >= 0) {
      comparisons++;
      steps.push({
        type: "compare",
        indices: [j, j + 1],
        values: [arr[j], key],
        desc: `Comparing prefix element at index ${j} (${arr[j]}) with key (${key})`
      });

      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        swaps++;
        steps.push({
          type: "move",
          from: j,
          to: j + 1,
          value: arr[j],
          desc: `Shifting ${arr[j]} from index ${j} to ${j + 1}`
        });
        j -= 1;
      } else {
        break;
      }
    }

    arr[j + 1] = key;
    steps.push({
      type: "insert",
      index: j + 1,
      value: key,
      desc: `Inserting key ${key} at index ${j + 1}`
    });
  }

  for (let i = 0; i < n; i++) {
    steps.push({
      type: "sorted",
      index: i,
      desc: `Element at index ${i} is sorted`
    });
  }

  return { sortedArray: arr, steps, comparisons, swaps };
}

export function mergeSort(array) {
  const arr = [...array];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  function merge(left, middle, right) {
    const leftPart = arr.slice(left, middle + 1);
    const rightPart = arr.slice(middle + 1, right + 1);

    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftPart.length && j < rightPart.length) {
      const leftIndex = left + i;
      const rightIndex = middle + 1 + j;
      comparisons++;

      steps.push({
        type: "compare",
        indices: [leftIndex, rightIndex],
        values: [leftPart[i], rightPart[j]],
        desc: `Comparing left sub-array element (${leftPart[i]}) and right sub-array element (${rightPart[j]})`
      });

      if (leftPart[i] <= rightPart[j]) {
        arr[k] = leftPart[i];
        i++;
      } else {
        arr[k] = rightPart[j];
        j++;
      }

      swaps++;
      steps.push({
        type: "move_value",
        index: k,
        value: arr[k],
        desc: `Writing merged value ${arr[k]} to index ${k}`
      });
      k++;
    }

    while (i < leftPart.length) {
      arr[k] = leftPart[i];
      swaps++;
      steps.push({
        type: "move_value",
        index: k,
        value: arr[k],
        desc: `Copying remaining left sub-array value ${arr[k]} to index ${k}`
      });
      i++;
      k++;
    }

    while (j < rightPart.length) {
      arr[k] = rightPart[j];
      swaps++;
      steps.push({
        type: "move_value",
        index: k,
        value: arr[k],
        desc: `Copying remaining right sub-array value ${arr[k]} to index ${k}`
      });
      j++;
      k++;
    }
  }

  function divide(left, right) {
    if (left < right) {
      const middle = Math.floor((left + right) / 2);
      divide(left, middle);
      divide(middle + 1, right);
      merge(left, middle, right);
    }
  }

  divide(0, arr.length - 1);

  for (let i = 0; i < arr.length; i++) {
    steps.push({
      type: "sorted",
      index: i,
      desc: `Element at index ${i} is sorted`
    });
  }

  return { sortedArray: arr, steps, comparisons, swaps };
}

export function quickSort(array) {
  const arr = [...array];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  function partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      type: "pivot_select",
      index: high,
      value: pivot,
      desc: `Selected pivot ${pivot} at index ${high}`
    });

    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({
        type: "compare",
        indices: [j, high],
        values: [arr[j], pivot],
        desc: `Comparing element at index ${j} (${arr[j]}) with pivot (${pivot})`
      });

      if (arr[j] <= pivot) {
        i++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        swaps++;

        steps.push({
          type: "swap",
          indices: [i, j],
          values: [arr[i], arr[j]],
          desc: `Swapping ${arr[i]} at ${i} and ${arr[j]} at ${j}`
        });
      }
    }

    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    swaps++;

    steps.push({
      type: "swap",
      indices: [i + 1, high],
      values: [arr[i + 1], arr[high]],
      desc: `Placing pivot ${arr[i + 1]} into its correct sorted index ${i + 1}`
    });

    steps.push({
      type: "sorted",
      index: i + 1,
      desc: `Pivot at index ${i + 1} (${arr[i + 1]}) is now sorted`
    });

    return i + 1;
  }

  function quickSortRecursive(low, high) {
    if (low < high) {
      const pivotIndex = partition(low, high);
      quickSortRecursive(low, pivotIndex - 1);
      quickSortRecursive(pivotIndex + 1, high);
    }
  }

  quickSortRecursive(0, arr.length - 1);

  for (let i = 0; i < arr.length; i++) {
    steps.push({
      type: "sorted",
      index: i,
      desc: `Element at index ${i} is sorted`
    });
  }

  return { sortedArray: arr, steps, comparisons, swaps };
}
