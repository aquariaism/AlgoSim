console.log("script.js loaded");

const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Cost Value",
      data: [],
      borderWidth: 2,
      tension: 0.3
    }]
  },
  options: {
    animation: false,
    scales: {
      x: {
        title: { display: true, text: "Iteration" }
      },
      y: {
        title: { display: true, text: "f(x)" },
        beginAtZero: true
      }
    }
  }
});

setInterval(() => {
  fetch("http://127.0.0.1:5000/data")
    .then(res => res.json())
    .then(data => {
      console.log("Fetched points:", data.length);

      if (data.length === 0) return;

      chart.data.labels = data.map(d => d.step);
      chart.data.datasets[0].data = data.map(d => d.value);
      chart.update();
    })
    .catch(err => {
      console.error("Fetch failed:", err);
    });
}, 500);
