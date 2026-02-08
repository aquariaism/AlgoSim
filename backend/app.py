from flask import Flask, jsonify
from flask_cors import CORS
import csv
import os

app = Flask(__name__)
CORS(app)  

CSV_PATH = "../engine/output.csv"

@app.route("/data")
def get_data():
    data = []
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, newline="") as f:
            reader = csv.reader(f)
            for row in reader:
                data.append({
                    "step": int(row[0]),
                    "value": float(row[2])
                })
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
