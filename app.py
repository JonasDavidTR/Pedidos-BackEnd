from flask import Flask, request, jsonify, render_template, Response
import gspread
import os
from google.oauth2.service_account import Credentials
from datetime import datetime, timedelta
from urllib.parse import quote
from flask_cors import CORS

app = Flask(__name__)

CORS(app, origins=["https://degust-lanches.onrender.com/"])

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


#Atutenticador 
# Usuário e senha que você quer proteger
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWD")

def check_auth(username, password):
    return username == USERNAME and password == PASSWORD

def authenticate():
    # Retorna resposta 401 para disparar o popup de login do navegador
    return Response(
        'Acesso negado. Favor autenticar.', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'}
    )

def requires_auth(f):
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    # Preserve nome e docstring da função original
    decorated.__name__ = f.__name__
    decorated.__doc__ = f.__doc__
    return decorated
#///////////////////////////////



# Conecta à planilha de pedidos
client = gspread.authorize(creds)
sheet = client.open("Pedidos_DegustLanches").sheet1

# Conecta à planilha do cardápio
sheet_disponibilidade = client.open("Cardapio_BancoDeDados").sheet1
itens = sheet_disponibilidade.get_all_records()


@app.route("/disponibilidade")
def disponibilidade():
    records = sheet_disponibilidade.get_all_records()

    #Monta um dicionario com o nome do item que está disponivel
    disponibilidade_dict = {}
    for item in records:
        nome = item['Nome'].lower().strip()
        disponivel = item['Disponibilidade'].strip().lower() == 'sim'
        disponibilidade_dict[nome] = disponivel
    return jsonify(disponibilidade_dict)


#admin page
@app.route("/atualizar-disponibilidade", methods=["POST"])
@requires_auth
def atualizar_disponibilidade():
    try:
        dados = request.get_json()
        itens_recebidos = dados.get('itens', [])

        # Lê o conteúdo do JSON diretamente da variável de ambiente
        cred_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
        # cred_json = os.getenv("credenciais.json")
        if not cred_json:
            raise ValueError("Variável de ambiente GOOGLE_APPLICATION_CREDENTIALS_JSON não encontrada")
        info = json.loads(cred_json)
        scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
        creds = Credentials.from_service_account_info(info, scopes=scopes)
        gc = gspread.authorize(creds)

        sh = gc.open('Cardapio_BancoDeDados')
        worksheet = sh.sheet1

        registros = worksheet.get_all_records()

        novas_disponibilidades = []

        for registro in registros:
            nome_item = registro['Nome']
            # Busca o item correspondente recebido
            item = next((item for item in itens_recebidos if item['nome'] == nome_item), None)
            if item:
                nova_disp = 'SIM' if item['disponibilidade'] else 'NÃO'
            else:
                nova_disp = registro['Disponibilidade']  # mantém o que está na planilha

            novas_disponibilidades.append([nova_disp])

        # Atualiza a coluna 3 (Disponibilidade), da linha 2 até o fim, em uma única requisição
        worksheet.update(f'C2:C{len(novas_disponibilidades) + 1}', novas_disponibilidades)

        return jsonify({'mensagem': 'Atualizado com sucesso'})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'erro': str(e)}), 500


#/////////////////////////////////


@app.route("/admin")
@requires_auth
def admin():
    sheet_disponibilidade = client.open("Cardapio_BancoDeDados").sheet1
    itens = sheet_disponibilidade.get_all_records()
    return render_template("admin.html", itens=itens)


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
    'coca': {'Juininho': 3.00, 'Lata': 5.00, '1L': 7.00, '2L': 12.00},
    'fanta': {'Juininho': 2.00, 'Lata': 5.00, '1L': 7.00, '2L': 12.00},
    'guarana': {'Juininho': 2.00, 'Lata': 4.00, '1L': 6.00, '2L': 10.00},
    'outros': {'Juininho': 2.00, 'Lata': 4.00, '1l': 6.00, '2l': 10.00}  # pepsi/uva/limao
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
                raise ValueError(f"Quantidade inválida de: {sabor}")

            # Cálculo do preço
            if sabor in ['queijo', 'carne', 'misto', 'frango','fqueijo', 'catupiry', 'cheddar']:
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
                if sabor == 'coca':
                    tabela = precos['coca']
                elif sabor == 'fanta':
                    tabela = precos['fanta']
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
    if not referer.startswith("https://degust-lanches.onrender.com/"):
    # if not referer.startswith("http://127.0.0.1:5000/"):
        return jsonify({"status": "erro", "mensagem": "Origem não autorizada"}), 403

    try:
        whatsapp = request.form["whatsapp"]
        pedido = request.form["pedido"]
        endereco = request.form["endereco"]
        pagamento = request.form["pagamento"]

        timestamp = (datetime.utcnow() - timedelta(hours=3)).strftime("%d/%m/%Y - %H:%M:%S")

        # Monta mensagem resumida para WhatsApp
        mensagem = f"Resumo do pedido completo {timestamp}:\n"
        mensagem += f'Numero: {whatsapp}\n\n'
        mensagem += f"Pedido:\n{pedido}\n"
        mensagem += f"Endereço: {endereco}\n"
        mensagem += f"Pagamento: {pagamento}"

        # Escapa para URL
        mensagem_url = quote(mensagem)
        #  Numero a para qual a mensagem será mandada
        numero = os.getenv("NUMBER_PHONE")

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
