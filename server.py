from flask import Flask
import requests

app = Flask(__name__)


@app.route("/proxyapi/<user_id>")
def server(user_id):
    x = requests.get(f"https://cses.fi/problemset/user/{user_id}/")
    print(x.text)
    return x.text


app.run(host="0.0.0.0", port=5001)