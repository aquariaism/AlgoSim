#  AlgoSim - Genetic Algorithm Visualizer

A real-time genetic algorithm visualization system with an interactive web interface. Watch optimization algorithms evolve and converge to find optimal solutions!

##  Features

### ✨Enhanced Features
- **Start/Stop/Reset Controls** - Full control over optimization execution
- **Multiple Fitness Functions** - Choose from 4 different optimization problems:
  - Rastrigin (highly multimodal)
  - Sphere (simple convex)
  - Rosenbrock (narrow valley)
  - Ackley (many local minima)
- **Real-time Statistics** - Live updates of generation, fitness, and diversity metrics
- **Dual Charts** - Separate visualization for fitness evolution and population diversity
- **Configurable Parameters** - Adjust population size, mutation rate, crossover rate, and more
- **Modern UI** - Beautiful, responsive interface with gradient backgrounds

### Performance Optimizations
- **Adaptive Mutation** - Mutation strength decreases over generations for better convergence
- **Tournament Selection** - Better parent selection than simple ranking
- **Elitism** - Preserves top performers across generations
- **Efficient Data Handling** - Only new data points are added to charts
- **Multi-threaded Backend** - Non-blocking API server
- **Configurable Delay** - Control visualization speed without recompiling

## 📁 Project Structure

```
algosim/
├── optimizer.cpp       # C++ genetic algorithm engine
├── app.py             # Flask API server
├── index.html         # Web interface
├── script.js          # Frontend logic
├── config.txt         # Runtime configuration (auto-generated)
└── output.csv         # Optimization data (auto-generated)
```

## Quick Start (3 Steps!)

### Option A: Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
bash setup.sh
```

### Option B: Manual Setup

**Step 1:** Compile the optimizer
```bash
# Windows
g++ optimizer.cpp -o optimizer.exe -std=c++11

# Linux/Mac
g++ optimizer.cpp -o optimizer -std=c++11
```

**Step 2:** Install Python packages
```bash
pip install flask flask-cors
```

**Step 3:** Start the server and open the UI
```bash
# Terminal 1: Start Flask server
python app.py

# Then open index.html in your web browser
```

That's it! Click the **Start** button to begin optimization.

---

##  Setup Instructions

### Prerequisites
- **C++ Compiler** (g++ or MSVC)
- **Python 3.7+**
- **pip** (Python package manager)

### Step 1: Compile the C++ Optimizer

**On Windows:**
```bash
g++ optimizer.cpp -o optimizer.exe -std=c++11
```

**On Linux/Mac:**
```bash
g++ optimizer.cpp -o optimizer -std=c++11
```

### Step 2: Install Python Dependencies

```bash
pip install flask flask-cors
```

### Step 3: Update the Optimizer Path

Edit `app.py` and update the `OPTIMIZER_PATH` variable:

**Windows:**
```python
OPTIMIZER_PATH = "./optimizer.exe"
```

**Linux/Mac:**
```python
OPTIMIZER_PATH = "./optimizer"
```

### Step 4: Start the Flask Server

```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

### Step 5: Open the Web Interface

Simply open `index.html` in your web browser, or serve it with:

```bash
# Using Python's built-in server
python -m http.server 8000
```

Then navigate to `http://localhost:8000`

## 🎮 How to Use

1. **Configure Parameters** (optional)
   - Select a fitness function
   - Adjust population size, generations, mutation rate, etc.
   - Set update delay for visualization speed

2. **Start Optimization**
   - Click the "▶ Start" button
   - Watch the algorithm evolve in real-time

3. **Monitor Progress**
   - View live statistics (generation, best/avg fitness, diversity)
   - Observe convergence in the fitness chart
   - Track population diversity over time

4. **Stop When Needed**
   - Click "⏹ Stop" to halt the optimization
   - Data is preserved for analysis

5. **Reset for New Run**
   - Click "🔄 Reset" to clear all data
   - Configure new parameters and start again

## 📊 Understanding the Charts

### Fitness Evolution Chart
- **Best Fitness (Green)**: The best solution found so far
- **Average Fitness (Blue)**: Mean fitness across the population
- **Worst Fitness (Red)**: Worst individual in the population

Lower values are better (minimization problem).

### Population Diversity Chart
- Shows the standard deviation of the population
- High diversity = exploration phase
- Low diversity = convergence/exploitation phase
- Helps diagnose premature convergence

## ⚙️ Configuration Options

| Parameter | Description | Default | Range |
|-----------|-------------|---------|-------|
| Population Size | Number of individuals | 50 | 10-200 |
| Generations | Number of evolution cycles | 100 | 10-500 |
| Mutation Rate | Probability of mutation | 0.1 | 0.0-1.0 |
| Crossover Rate | Probability of crossover | 0.8 | 0.0-1.0 |
| Elite Ratio | Top % preserved | 0.2 | 0.0-0.5 |
| Update Delay | Visualization speed (ms) | 100 | 10-1000 |

## 🔧 API Endpoints

The Flask server provides these endpoints:

- `GET /data` - Get optimization data
- `GET /status` - Get current status
- `POST /start` - Start optimization
- `POST /stop` - Stop optimization
- `POST /reset` - Clear all data
- `GET /config` - Get configuration
- `POST /config` - Update configuration
- `GET /functions` - List available fitness functions

## 🐛 Troubleshooting

### "Failed to connect to server"
- Ensure Flask server is running (`python app.py`)
- Check that port 5000 is not in use

### "Optimizer not found"
- Verify the optimizer is compiled
- Check `OPTIMIZER_PATH` in `app.py`
- Ensure the executable has proper permissions

### Charts not updating
- Check browser console for errors
- Verify the CSV file is being created
- Ensure CORS is enabled in `app.py`

### Optimization runs too fast
- Increase the "Update Delay" parameter
- This adds sleep time between generations

## 🎓 Educational Value

This project demonstrates:
- **Genetic Algorithms**: Selection, crossover, mutation, elitism
- **Optimization**: Local vs global optima, convergence behavior
- **Full-stack Development**: C++, Python, JavaScript integration
- **Real-time Visualization**: Live data streaming and charting
- **API Design**: RESTful endpoints and state management

## 🔮 Future Enhancements

Potential additions:
- Multi-dimensional optimization (2D/3D visualization)
- Comparison mode (run multiple algorithms simultaneously)
- Export results to PDF/Excel
- Custom fitness function upload
- Parameter auto-tuning
- Historical run comparison
- Machine learning for parameter optimization

## 📝 License

Free to use for educational and personal projects.

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

**Enjoy exploring genetic algorithms!** 🧬✨