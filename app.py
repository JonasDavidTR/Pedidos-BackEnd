from flask import Flask, request, jsonify, render_template
import gspread
import os
from google.oauth2.service_account import Credentials
from datetime import datetime, timedelta

app = Flask(__name__)


# escopo da API
scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]


cred_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

try:
        
    if cred_json:
        # Ambiente de produção
        from io import StringIO
        cred_file = StringIO(cred_json)
        import json
        creds = Credentials.from_service_account_info(json.loads(cred_json), scopes=scope)

    else:
        # Ambiente local (arquivo físico)
        creds = Credentials.from_service_account_file("credenciais.json", scopes=scope)
except Exception as e:
    raise Exception("Credenciais não encontradas ou inválidas. Detalhes: " + str(e))

# Conecta à planilha
client = gspread.authorize(creds)
sheet = client.open("Pedidos_DegustLanches").sheet1

@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")

@app.route("/enviar-pedido", methods=["POST"])
def enviar_pedido():

    referer = request.headers.get("Referer", "")
    if not referer.startswith("https://degustlanches.onrender.com"):
        return jsonify({"status": "erro", "mensagem": "Origem não autorizada"}), 403

    try:
        whatsapp = request.form["whatsapp"]
        pedido = request.form["pedido"]
        endereco = request.form["endereco"]
        pagamento = request.form["pagamento"]

        timestamp = (datetime.utcnow() - timedelta(hours=3)).strftime("%d/%m/%Y %H:%M:%S")
        
        sheet.append_row([timestamp, whatsapp, pedido, endereco, pagamento])
        return jsonify({"status": "sucesso"}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

if __name__ == '__main__':
    from os import environ
    port = int(environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
