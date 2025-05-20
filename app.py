from flask import Flask, request, jsonify
import gspread
from oauth2client.service_account import ServiceAccountCredentials

app = Flask(__name__)

# Conecta com a planilha
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name("credenciais.json", scope)
client = gspread.authorize(creds)
sheet = client.open("NOME_DA_SUA_PLANILHA").sheet1  # troque pelo nome da sua planilha

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
