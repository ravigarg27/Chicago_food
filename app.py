# -*- coding: utf-8 -*-

from shapely.geometry import Point, shape
import pandas as pd
from flask import Flask
from flask import render_template
import json

data_path = './input/'

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def get_data():
    df = pd.read_csv(data_path + "data_final_1.csv")
    return df.to_json(orient='records')


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
