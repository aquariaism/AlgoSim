console.log("AlgoSim - Enhanced GA Viewer Loaded");

const API_URL = "http://127.0.0.1:5000";

// Chart setup
const fitnessCtx = document.getElementById("fitnessChart").getContext("2d");
const diversityCtx = document.getElementById("diversityChart").getContext("2d");

const fitnessChart = new Chart(fitnessCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Best Fitness",
        data: [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5
      },
      {
        label: "Average Fitness",
        data: [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5
      },
      {
        label: "Worst Fitness",
        data: [],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 1,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        hidden: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Generation",
          font: { size: 14, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        title: {
          display: true,
          text: "Fitness Value",
          font: { size: 14, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        beginAtZero: false
      }
    }
  }
});

const diversityChart = new Chart(diversityCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Population Diversity",
        data: [],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Generation",
          font: { size: 14, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        title: {
          display: true,
          text: "Diversity (Std Dev)",
          font: { size: 14, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        beginAtZero: true
      }
    }
  }
});

// State management
let isRunning = false;
let pollInterval = null;
let lastDataLength = 0;

// UI Elements
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

// Config inputs
const functionSelect = document.getElementById("functionSelect");
const popSizeInput = document.getElementById("popSize");
const generationsInput = document.getElementById("generations");
const mutationRateInput = document.getElementById("mutationRate");
const crossoverRateInput = document.getElementById("crossoverRate");
const delayInput = document.getElementById("delay");

// Stats
const currentGenElem = document.getElementById("currentGen");
const bestFitnessElem = document.getElementById("bestFitness");
const avgFitnessElem = document.getElementById("avgFitness");
const diversityElem = document.getElementById("diversity");

// Event listeners
startBtn.addEventListener("click", startOptimization);
stopBtn.addEventListener("click", stopOptimization);
resetBtn.addEventListener("click", resetData);

// Load available functions on startup
loadFunctions();

function loadFunctions() {
  fetch(`${API_URL}/functions`)
    .then(res => res.json())
    .then(data => {
      console.log("Available functions:", data.functions);
    })
    .catch(err => console.error("Error loading functions:", err));
}

function getConfig() {
  return {
    popSize: parseInt(popSizeInput.value),
    generations: parseInt(generationsInput.value),
    mutationRate: parseFloat(mutationRateInput.value),
    crossoverRate: parseFloat(crossoverRateInput.value),
    delay: parseInt(delayInput.value),
    function: functionSelect.value,
    minBound: -5.12,
    maxBound: 5.12
  };
}

async function startOptimization() {
  try {
    const config = getConfig();
    
    const response = await fetch(`${API_URL}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(config)
    });

    const result = await response.json();

    if (response.ok) {
      isRunning = true;
      updateUIState();
      startPolling();
      console.log("Optimization started:", result);
    } else {
      console.error("Start failed:", result);
      
      // Show detailed error message
      let errorMsg = result.error || "Failed to start optimization";
      if (result.hint) {
        errorMsg += "\n\n" + result.hint;
      }
      if (result.compile_command) {
        errorMsg += "\n\nCompile with:\n" + result.compile_command;
      }
      
      alert(errorMsg);
    }
  } catch (err) {
    console.error("Error starting optimization:", err);
    alert("Failed to connect to server. Is the Flask app running?\n\nMake sure you started app.py:\npython app.py");
  }
}

async function stopOptimization() {
  try {
    const response = await fetch(`${API_URL}/stop`, {
      method: "POST"
    });

    const result = await response.json();

    if (response.ok) {
      isRunning = false;
      updateUIState();
      stopPolling();
      console.log("Optimization stopped:", result);
    } else {
      alert(result.error || "Failed to stop optimization");
    }
  } catch (err) {
    console.error("Error stopping optimization:", err);
  }
}

async function resetData() {
  if (isRunning) {
    alert("Please stop the optimization first");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/reset`, {
      method: "POST"
    });

    const result = await response.json();

    if (response.ok) {
      clearCharts();
      clearStats();
      lastDataLength = 0;
      console.log("Data reset:", result);
    } else {
      alert(result.error || "Failed to reset data");
    }
  } catch (err) {
    console.error("Error resetting data:", err);
  }
}

function startPolling() {
  // Poll every 300ms for new data
  pollInterval = setInterval(fetchData, 300);
  fetchData(); // Fetch immediately
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

async function fetchData() {
  try {
    const response = await fetch(`${API_URL}/data`);
    const data = await response.json();

    if (data.length > lastDataLength) {
      // Add only new data points
      for (let i = lastDataLength; i < data.length; i++) {
        const point = data[i];
        
        fitnessChart.data.labels.push(point.generation);
        fitnessChart.data.datasets[0].data.push(point.best_fitness);
        fitnessChart.data.datasets[1].data.push(point.avg_fitness);
        fitnessChart.data.datasets[2].data.push(point.worst_fitness);
        
        diversityChart.data.labels.push(point.generation);
        diversityChart.data.datasets[0].data.push(point.diversity);
      }

      lastDataLength = data.length;
      
      fitnessChart.update('none'); // Update without animation for performance
      diversityChart.update('none');

      // Update stats with latest data
      if (data.length > 0) {
        const latest = data[data.length - 1];
        updateStats(latest);
      }
    }

    // Check if optimization finished
    await checkStatus();

  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

async function checkStatus() {
  try {
    const response = await fetch(`${API_URL}/status`);
    const status = await response.json();

    if (isRunning && !status.running) {
      // Optimization finished
      isRunning = false;
      updateUIState();
      stopPolling();
      statusText.textContent = "Completed";
    }
  } catch (err) {
    console.error("Error checking status:", err);
  }
}

function updateStats(data) {
  currentGenElem.textContent = data.generation;
  bestFitnessElem.textContent = data.best_fitness.toFixed(4);
  avgFitnessElem.textContent = data.avg_fitness.toFixed(4);
  diversityElem.textContent = data.diversity.toFixed(4);
}

function clearStats() {
  currentGenElem.textContent = "0";
  bestFitnessElem.textContent = "—";
  avgFitnessElem.textContent = "—";
  diversityElem.textContent = "—";
}

function clearCharts() {
  fitnessChart.data.labels = [];
  fitnessChart.data.datasets[0].data = [];
  fitnessChart.data.datasets[1].data = [];
  fitnessChart.data.datasets[2].data = [];
  fitnessChart.update();

  diversityChart.data.labels = [];
  diversityChart.data.datasets[0].data = [];
  diversityChart.update();
}

function updateUIState() {
  if (isRunning) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    resetBtn.disabled = true;
    statusDot.classList.add("running");
    statusText.textContent = "Running...";
    
    // Disable config inputs
    functionSelect.disabled = true;
    popSizeInput.disabled = true;
    generationsInput.disabled = true;
    mutationRateInput.disabled = true;
    crossoverRateInput.disabled = true;
    delayInput.disabled = true;
  } else {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = false;
    statusDot.classList.remove("running");
    
    if (statusText.textContent !== "Completed") {
      statusText.textContent = "Ready";
    }
    
    // Enable config inputs
    functionSelect.disabled = false;
    popSizeInput.disabled = false;
    generationsInput.disabled = false;
    mutationRateInput.disabled = false;
    crossoverRateInput.disabled = false;
    delayInput.disabled = false;
  }
}

// Initial UI state
updateUIState();

// Check initial status on load
checkStatus();