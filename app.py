from flask import Flask 
from flask import render_template
from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app=Flask(__name__,
    static_folder="public",
    static_url_path="/") #建立 Application 物件)
app.secret_key="any string but secret" #設定 Session 的密鑰    
app.config["JSON_AS_ASCII"]=False
app.config["JSON_SORT_KEYS"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

# Pages
@app.route("/")
def index():
	return render_template("index.html")

app.run(port=3030, debug=True)
