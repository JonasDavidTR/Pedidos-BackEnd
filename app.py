from flask import Flask, request, jsonify, render_template
import gspread
import os
from google.oauth2.service_account import Credentials
from datetime import datetime, timedelta
from urllib.parse import quote

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


# Tabela de preços
precos = {
    'pastel': 6.00,
    'coxinha': 4.00,
    'enroladinho': 2.50,
    'hotdog': 5.00,
    'bolo': 5.00,
    'tortilete': 3.00,
    'trufa': 3.00,
    'brigadeiro': 1.00,
    'beijinho': 1.00,
    'sucoLeite': 4.00,
    'sucoAgua': 3.50,
    'coca': {'juininho': 3.00, 'lata': 5.00, '1Litro': 7.00, '2Litros': 12.00},
    'guarana': {'juininho': 2.00, 'lata': 4.00, '1Litro': 6.00, '2Litros': 10.00},
    'outros': {'juininho': 2.00, 'lata': 4.00}  # pepsi/uva/limao
}

@app.route("/calcular-valor", methods=["POST"])
def calcular_valor():
    dados = request.get_json()

    if not dados or not isinstance(dados, dict):
        return jsonify({"status": "erro", "mensagem": "Dados inválidos"}), 400

        
    try:
        pedido = dados.get('pedido', [])
        total = 0.0

        for item in pedido:
            sabor = item.get('sabor', '').lower()
            qtd = int(item.get('qtd', 0))
            leiteOuAgua = item.get('leiteOuAgua', None)
            completo = item.get('completo', None)
            categoria = item.get('categoria', '')
            tamanhoRefri = item.get('tamanhoRefri', '')

            if qtd <= 0 or qtd > 50:
                raise ValueError(f"Quantidade inválida para item: {sabor}")

            # Cálculo do preço
            if sabor in ['queijo', 'carne', 'misto', 'frango', 'catupiry', 'cheddar']:
                preco = precos['pastel']
            elif sabor == 'coxinha':
                preco = precos['coxinha']
            elif sabor == 'enroladinho':
                preco = precos['enroladinho']
            elif sabor == 'hotdog':
                preco = precos['hotdog']
            elif sabor == 'bolo':
                preco = precos['bolo']
            elif sabor == 'tortilete':
                preco = precos['tortilete']
            elif sabor == 'trufa':
                preco = precos['trufa']
            elif sabor == 'brigadeiro':
                preco = precos['brigadeiro']
            elif sabor == 'beijinho':
                preco = precos['beijinho']
            elif categoria == 'sucos':
                if leiteOuAgua == 'leite':
                    preco = precos['sucoLeite']
                elif leiteOuAgua == 'agua':
                    preco = precos['sucoAgua']
                else:
                    raise ValueError("Tipo de suco inválido")
            elif categoria == 'refri':
                if sabor in ['coca', 'fanta']:
                    tabela = precos['coca']
                elif sabor == 'guarana':
                    tabela = precos['guarana']
                else:
                    tabela = precos['outros']
                preco = tabela.get(tamanhoRefri, 0)
            else:
                raise ValueError(f"Item desconhecido: {sabor}")

            total += preco * qtd

        return jsonify({"status": "sucesso", "valorTotal": round(total, 2)}), 200

    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 400


@app.route("/enviar-pedido", methods=["POST"])
def enviar_pedido():
    referer = request.headers.get("Referer", "")
    if not referer.startswith("https://pedidos-backend-0ggt.onrender.com/"):
        return jsonify({"status": "erro", "mensagem": "Origem não autorizada"}), 403

    try:
        whatsapp = request.form["whatsapp"]
        pedido = request.form["pedido"]
        endereco = request.form["endereco"]
        pagamento = request.form["pagamento"]

        timestamp = (datetime.utcnow() - timedelta(hours=3)).strftime("%d/%m/%Y %H:%M:%S")

        # Monta mensagem resumida para WhatsApp
        mensagem = f"Olá! Aqui está o resumo do seu pedido feito em {timestamp}:\n\n"
        mensagem += f"Pedido: {pedido}\n"
        mensagem += f"Endereço: {endereco}\n"
        mensagem += f"Pagamento: {pagamento}\n\n"
        mensagem += "Obrigado pela preferência!🍔🍟\n"
        mensagem += "É só enviar que já está tudo certo."

        # Escapa para URL
        mensagem_url = quote(mensagem)

        # Remove caracteres especiais do número
        numero = '5587981796957'

        # Salva na planilha
        sheet.append_row([timestamp, whatsapp, pedido, endereco, pagamento])

        # Monta link do WhatsApp
        link_whatsapp = f"https://wa.me/{numero}?text={mensagem_url}"

        return jsonify({"status": "sucesso", "whatsapp_link": link_whatsapp}), 200

    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500

if __name__ == '__main__':
    from os import environ
    port = int(environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
