from flask import Flask, request, jsonify
import gspread
from google.oauth2.service_account import Credentials
import os
import json

app = Flask(__name__)

# Lê o conteúdo da variável de ambiente
cred_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON')
if not cred_json:
    raise Exception("A variável GOOGLE_APPLICATION_CREDENTIALS_JSON não foi encontrada.")

# Salva temporariamente como arquivo
with open("credenciais_temp.json", "w") as f:
    f.write(cred_json)

# Conecta na planilha
scope = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
creds = Credentials.from_service_account_file("credenciais_temp.json", scopes=scope)
client = gspread.authorize(creds)
sheet = client.open("NOME_DA_SUA_PLANILHA").sheet1  # troque pelo nome real

@app.route("/", methods=["GET"])
def home():
    return "Servidor online!"

@app.route("/enviar-pedido", methods=["POST"])
def enviar_pedido():
    try:
        whatsapp = request.form["whatsapp"]
        pedido = request.form["pedido"]
        endereco = request.form["endereco"]
        pagamento = request.form["pagamento"]

        sheet.append_row([whatsapp, pedido, endereco, pagamento])
        return jsonify({"status": "sucesso"}), 200
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500
