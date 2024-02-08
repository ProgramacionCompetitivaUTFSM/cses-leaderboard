from flask import Flask, render_template
from bs4 import BeautifulSoup
from datetime import datetime
from dotenv import dotenv_values
import requests
import logging

# Disabling all logs, only show errors
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

env_vars = dotenv_values(".env")

# Variables
cached_user_problem = {}
last_cached = None
delta_interval_recache = 60*5

# Scrap proxy
def get_token(s,url):
    response = s.get(url)
    html = BeautifulSoup(response.text,"html.parser")
    return html.find("input",{"name":"csrf_token"})["value"]

def login(s,username,password):
    URL = "https://cses.fi/login"

    token = get_token(s,URL)
    response = s.post(URL,data={
        "csrf_token": token,
        "nick": username,
        "pass": password
    })
    return response.text

def scrapData(user_id):
    s = requests.Session()
    login(s, env_vars.get("USERNAME"), env_vars.get("PASSWORD"))
    response = s.get(f"https://cses.fi/problemset/user/{user_id}/")
    cached_user_problem[user_id] = (datetime.now(), response.text)
    
# Flask 
app = Flask(__name__)

@app.route("/proxyapi/<user_id>")
def server(user_id):
    # Just scrap and return
    if user_id not in cached_user_problem:
        print(f"[?] User {user_id} not found in cache, generating and returning data ..." )
        scrapData(user_id)
        last_time_checked, user_data = cached_user_problem[user_id]
        return user_data

    print(f"[~] User {user_id} actually cached, checking if it is updated")
    last_time_checked, user_data = cached_user_problem[user_id]
    time_now = datetime.now()

    delta_time = time_now - last_time_checked
    if delta_time.total_seconds() >= delta_interval_recache:
        print(f"[!] Not updated data for user {user_id}, recaching the info")
        scrapData(user_id)
    else:
        print(f"[~] User {user_id} data is actually updated")
        

    print(f"[+] Returning info of {user_id}")
    # Return user_data
    return cached_user_problem[user_id][1]

@app.route("/")
def home():
    return render_template("index.html")

app.run(host="0.0.0.0", debug=True, port=5001)