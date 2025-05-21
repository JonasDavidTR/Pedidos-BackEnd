from flask import Flask, request, jsonify
import gspread
import os
from google.oauth2.service_account import Credentials


app = Flask(__name__)

# Configuração do escopo da API
scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]


cred_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

if cred_json:
    # Ambiente de produção
    from io import StringIO
    cred_file = StringIO(cred_json)
    import json
    creds = Credentials.from_service_account_info(json.loads(cred_json), scopes=scope)
else:
    # Ambiente local (arquivo físico)
    creds = Credentials.from_service_account_file("credenciais.json", scopes=scope)

# Conecta à planilha
client = gspread.authorize(creds)
sheet = client.open("Pedidos_DegustLanches").sheet1

@app.route("/", methods=["GET"])
def home():
    return "Servidor online!"

@app.route("/enviar-pedido", methods=["POST"])
def enviar_pedido():
    try:
        print("==========================================")
        whatsapp = request.form["whatsapp"]
        pedido = request.form["pedido"]
        endereco = request.form["endereco"]
        pagamento = request.form["pagamento"]
        
        sheet.append_row([whatsapp, pedido, endereco, pagamento])
        return jsonify({"status": "sucesso"}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
