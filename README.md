# Sorting & Searching Algorithm Visualizer (Web Edition)

A modern, responsive, browser-native web visualizer for fundamental sorting and searching algorithms, built with pure HTML5, CSS3, and modern JavaScript (ES6+).

## Features

- **Sorting Visualizer**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort.
- **Searching Visualizer**: Linear Search, Binary Search (with automatic sorted dataset handling).
- **Interactive Controls**:
  - Start, Pause, Resume, Step Forward, Step Backward, Reset.
  - Animation speed slider (20ms – 1000ms delay).
  - Array generation presets (Random, Nearly Sorted, Reversed, Few Unique, Custom CSV).
  - Search target input with random picker.
- **Real-Time Analytics**:
  - Comparisons and Swaps/Writes live counters.
  - Elapsed visualization time vs. pure JavaScript algorithm execution time.
  - Step progress indicators.
- **Multi-Algorithm Benchmark Mode**:
  - Run all sorting or searching algorithms simultaneously on datasets from 50 to 1,000 items.
  - Side-by-side performance comparison table and comparative execution-time bar chart.
  - Automated "Fastest Algorithm" detection.
- **Educational Information**:
  - Best, Average, Worst-case Time Complexities.
  - Space Complexity, Stability, and In-Place metrics.
  - Step-by-step logic and pseudo-code viewer.
- **Sound Feedback**:
  - Web Audio API synthesizer generating sinusoidal pitches mapped to bar values.
- **Modern UI**:
  - Dark Mode & Light Mode support.
  - Responsive layout for mobile, tablet, and desktop.

## How to Run

### Method 1: Local HTTP Server (Recommended)
From the project root:
```bash
python -m http.server 8000 --directory web
```
Then open [http://localhost:8000](http://localhost:8000) in your web browser.

### Method 2: Direct File Open
You can also open `web/index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari) using a local web server extension (e.g. VS Code Live Server) or Python HTTP server to support ES6 module imports.
