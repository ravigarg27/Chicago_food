import pandas as pd
from flask import render_template
from app import app

data_path = './static/input/'

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def get_data():
    df = pd.read_csv(data_path + "data_final_1.csv")
    return df.to_json(orient='records')