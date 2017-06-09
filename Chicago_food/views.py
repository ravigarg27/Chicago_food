import pandas as pd
from flask import render_template
from app import app

data_path = './static/input/'

@app.route("/")
def index():
    return render_template("index.html")