from flask import Flask, jsonify, request
from flask_cors import CORS
import csv
import os
import subprocess
import threading
import time

app = Flask(__name__)
CORS(app)

CSV_PATH = "../backend/output.csv"
CONFIG_PATH = "config.txt"

# Auto-detect optimizer executable
import platform
import os.path

if platform.system() == "Windows":
    OPTIMIZER_PATH = "../engine/optimizer.exe"
else:
    OPTIMIZER_PATH = "./optimizer"

# Check if optimizer exists
if not os.path.exists(OPTIMIZER_PATH):
    print(f"WARNING: Optimizer not found at {OPTIMIZER_PATH}")
    print("Please compile optimizer.cpp first:")
    if platform.system() == "Windows":
        print("  g++ optimizer.cpp -o optimizer.exe -std=c++11")
    else:
        print("  g++ optimizer.cpp -o optimizer -std=c++11")

# Process management
optimizer_process = None
optimizer_thread = None
is_running = False
current_config = {
    "popSize": 50,
    "generations": 100,
    "mutationRate": 0.1,
    "crossoverRate": 0.8,
    "eliteRatio": 0.2,
    "delay": 100,
    "function": "rastrigin",
    "minBound": -5.12,
    "maxBound": 5.12
}

def save_config(config):
    """Save configuration to file"""
    with open(CONFIG_PATH, 'w') as f:
        for key, value in config.items():
            f.write(f"{key}={value}\n")

def run_optimizer():
    """Run the optimizer in a separate thread"""
    global optimizer_process, is_running
    try:
        print(f"Starting optimizer: {OPTIMIZER_PATH}")
        
        # Check if optimizer exists
        if not os.path.exists(OPTIMIZER_PATH):
            print(f"ERROR: Optimizer not found at {OPTIMIZER_PATH}")
            print("Current directory:", os.getcwd())
            print("Files in directory:", os.listdir('.'))
            is_running = False
            return
        
        optimizer_process = subprocess.Popen(
            [OPTIMIZER_PATH],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Print output in real-time
        while True:
            output = optimizer_process.stdout.readline()
            if output == '' and optimizer_process.poll() is not None:
                break
            if output:
                print(f"Optimizer: {output.strip()}")
        
        # Wait for process to complete
        optimizer_process.wait()
        print("Optimizer finished")
        
    except Exception as e:
        print(f"Error running optimizer: {e}")
        import traceback
        traceback.print_exc()
    finally:
        is_running = False

@app.route("/data")
def get_data():
    """Get optimization data"""
    data = []
    if os.path.exists(CSV_PATH):
        try:
            with open(CSV_PATH, newline="") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append({
                        "generation": int(row["generation"]),
                        "best_fitness": float(row["best_fitness"]),
                        "avg_fitness": float(row["avg_fitness"]),
                        "worst_fitness": float(row["worst_fitness"]),
                        "diversity": float(row["diversity"])
                    })
        except Exception as e:
            print(f"Error reading CSV: {e}")
    return jsonify(data)

@app.route("/status")
def get_status():
    """Get current status of the optimizer"""
    return jsonify({
        "running": is_running,
        "dataPoints": get_data_count(),
        "config": current_config
    })

def get_data_count():
    """Count number of data points in CSV"""
    if not os.path.exists(CSV_PATH):
        return 0
    try:
        with open(CSV_PATH, 'r') as f:
            return sum(1 for line in f) - 1  # Subtract header
    except:
        return 0

@app.route("/start", methods=["POST"])
def start_optimizer():
    """Start the optimization process"""
    global optimizer_thread, is_running, current_config
    
    if is_running:
        return jsonify({"error": "Optimizer already running"}), 400
    
    # Check if optimizer exists
    if not os.path.exists(OPTIMIZER_PATH):
        return jsonify({
            "error": f"Optimizer not found at {OPTIMIZER_PATH}",
            "hint": "Please compile optimizer.cpp first. See README.md for instructions.",
            "compile_command": "g++ optimizer.cpp -o optimizer.exe -std=c++11" if platform.system() == "Windows" else "g++ optimizer.cpp -o optimizer -std=c++11"
        }), 500
    
    # Update config if provided
    if request.json:
        current_config.update(request.json)
    
    # Save config to file
    save_config(current_config)
    
    # Clear previous data
    if os.path.exists(CSV_PATH):
        os.remove(CSV_PATH)
    
    # Start optimizer in thread
    is_running = True
    optimizer_thread = threading.Thread(target=run_optimizer, daemon=True)
    optimizer_thread.start()
    
    return jsonify({
        "status": "started",
        "config": current_config
    })

@app.route("/stop", methods=["POST"])
def stop_optimizer():
    """Stop the optimization process"""
    global optimizer_process, is_running
    
    if not is_running:
        return jsonify({"error": "Optimizer not running"}), 400
    
    if optimizer_process:
        optimizer_process.terminate()
        optimizer_process.wait()
    
    is_running = False
    
    return jsonify({"status": "stopped"})

@app.route("/reset", methods=["POST"])
def reset_data():
    """Reset/clear all data"""
    global is_running
    
    if is_running:
        return jsonify({"error": "Stop optimizer first"}), 400
    
    if os.path.exists(CSV_PATH):
        os.remove(CSV_PATH)
    
    return jsonify({"status": "reset"})

@app.route("/config", methods=["GET", "POST"])
def handle_config():
    """Get or update configuration"""
    global current_config
    
    if request.method == "POST":
        if is_running:
            return jsonify({"error": "Stop optimizer to change config"}), 400
        
        current_config.update(request.json)
        return jsonify({
            "status": "updated",
            "config": current_config
        })
    
    return jsonify(current_config)

@app.route("/functions")
def get_functions():
    """Get available fitness functions"""
    return jsonify({
        "functions": [
            {
                "name": "rastrigin",
                "description": "Rastrigin function - highly multimodal",
                "bounds": [-5.12, 5.12],
                "optimum": 0
            },
            {
                "name": "sphere",
                "description": "Sphere function - simple convex",
                "bounds": [-100, 100],
                "optimum": 0
            },
            {
                "name": "rosenbrock",
                "description": "Rosenbrock function - narrow valley",
                "bounds": [-5, 10],
                "optimum": 0
            },
            {
                "name": "ackley",
                "description": "Ackley function - many local minima",
                "bounds": [-5, 5],
                "optimum": 0
            }
        ]
    })

if __name__ == "__main__":
    print("Starting AlgoSim API Server...")
    print(f"CSV Path: {CSV_PATH}")
    print(f"Optimizer Path: {OPTIMIZER_PATH}")
    app.run(debug=True, host="0.0.0.0", port=5000)