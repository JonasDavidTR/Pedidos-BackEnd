document.getElementById("pedido-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const form = event.target;
    const button = form.querySelector("button");
    
    // Desativa o botão e muda o texto
    button.disabled = true;
    button.textContent = "Enviando pedido... Aguarde";

    const formData = new FormData(form);
    fetch("https://pedidos-backend-0ggt.onrender.com/enviar-pedido", {
        method: "POST",
    body: formData
})

document.addEventListener("DOMContentLoaded", () => {
    const whatsappSalvo = localStorage.getItem("whatsapp");
    const enderecoSalvo = localStorage.getItem("endereco");

    if (whatsappSalvo) {
        document.querySelector("input[name='whatsapp']").value = whatsappSalvo;
    }

    if (enderecoSalvo) {
        document.querySelector("input[name='endereco']").value = enderecoSalvo;
    }
});


.then(res => res.json())
.then(data => {
    if (data.status === "sucesso") {
        // Salva no localStorage
        localStorage.setItem("whatsapp", form.whatsapp.value);
        localStorage.setItem("endereco", form.endereco.value);

        //window.open(data.whatsapp_link, '_blank');  // Abre WhatsApp com mensagem pronta
        window.location.href = data.whatsapp_link
        
        alert("Pedido enviado com sucesso!");
        form.reset();
        calcularTotal(); // reseta o total
    } else {
        alert("Erro: " + data.mensagem);
    }
})
.catch(() => {
    alert("Erro ao enviar pedido. Tente novamente.");
})
.finally(() => {
    button.disabled = false;
    button.textContent = "Enviar Pedido";
});
});

function abrirLightbox(src) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.src = src;
    lightbox.style.display = "flex";
}

function fecharLightbox() {
    document.getElementById("lightbox").style.display = "none";
}

const precos = {
    pastel: 6.00,
    coxinha: 4.00,
    enroladinho: 2.50,
    hotdog: 5.00,
    bolo: 5.00,
    trufa: 3.00,
    tortilete: 3.00,
    brigadeiro: 1.00,
    beijinho: 1.00,
    sucoLeite: 4.00,
    sucoAgua: 3.50,
    coca: { juininho: 3, lata: 5, '1Litro': 7, '2Litros': 12 },
    guarana: { juininho: 2, lata: 4, '1Litro': 6, '2Litros': 10 },
    outros: { juininho: 2, lata: 4 }
};

function toggleCategoria(id) {
    const cat = document.getElementById(id);
    if (cat.children.length > 0) return; // Não fecha se tiver itens dentro
    cat.style.display = cat.style.display === 'none' ? 'block' : 'none';
}

function addItem(categoria) {
    const div = document.getElementById(categoria);
    div.style.display = 'block'; // Sempre abre ao adicionar item

    const item = document.createElement('div');
    item.className = 'item';

    let html = '';

    if (categoria === 'lanches') {
        html = `
            <label>Sabor (selecione):</label>
            <select name="sabor" required>
                <option value="">Escolher sabor</option>
                <option value="Queijo">Queijo</option>
                <option value="Carne">Carne</option>
                <option value="Frango">Frango</option>
                <option value="Misto">Misto</option>
                <option value="Catupiry">Catupiry</option>
                <option value="Cheddar">Cheddar</option>
                <option value="hotdog">Cachorro quente</option>
            </select>
            <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" required>
            <label>Completo (molhos e verdura)?</label>
            <select name="completo">
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
            </select>
            <label>Observações:</label><textarea name="obs" placeholder="Ex: 1 com verdura, 1 sem"></textarea>
            <button type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>`;
    } else if (categoria === 'salgados') {
        html = `
            <label>Sabor (selecione):</label>
            <select name="sabor" required>
                <option value="">Escolher Salgado</option>
                <option value="enroladinho">Enroladinho</option>
                <option value="coxinha">Coxinha</option>
            </select>
            <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" required>
            <button type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>`;
    } else if (categoria === 'doces') {
        html = `
            <label>Doce (selecione):</label>
            <select name="sabor" required>
                <option value="">Escolher doce</option>
                <option value="Bolo">Bolo</option>
                <option value="Trufa">Trufa</option>
                <option value="Tortilete">Tortilete</option>
                <option value="Brigadeiro">Brigadeiro</option>
                <option value="Beijinho">Beijinho</option>
            </select>
            <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" required>
            <label>Observações:</label><textarea name="obs" placeholder="Ex: Sem talher, sabor da trufa..."></textarea>
            <button type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>`;
    } else if (categoria === 'sucos') {
        html = `
            <label>Sabor (selecione):</label>
            <select name="sabor" required>
                <option value="">Escolher sabor</option>
                <option value="Graviola">Graviola</option>
                <option value="Goiaba">Goiaba</option>
                <option value="Acerola">Acerola</option>
                <option value="Maracujá">Maracujá</option>
                <option value="Morango">Morango</option>
                <option value="Manga">Manga</option>
                <option value="Tangerina">Tangerina</option>
                <option value="Abacaxi com Hortelã">Abacaxi com hortelã</option>
                <option value="Abacaxi">Abacaxi</option>
                <option value="Uva">Uva</option>
                <option value="Açaí">Açaí</option>
                <option value="Caju">Caju</option>
                <option value="Pinha">Pinha</option>
                <option value="Umbu">Umbu</option>
            </select>
            <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" required>
            <label>Com leite ou água?</label>
            <select name="leiteOuAgua">
                <option value="leite">Leite</option>
                <option value="agua">Água</option>
            </select>
            <label>Observações:</label><textarea name="obs" placeholder="Ex: sem açúcar"></textarea>
            <button type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>`;
    } else if (categoria === 'refri') {
        html = `
            <label>Refrigerante (selecione):</label>
            <select name="sabor" required>
                <option value="">Escolher refri</option>
                <option value="coca">Coca Cola</option>
                <option value="guarana">Guaraná</option>
                <option value="fanta">Fanta</option>
                <option value="pepsi">Pepsi</option>
                <option value="uva">Uva</option>
                <option value="limao">Limão</option>
            </select>
            <label>De qual tamanho?</label>
            <select name="tamanho" required>
                <option value="juininho">Juininho</option>
                <option value="lata">Lata</option>
                <option value="1Litro">1 Litro</option>
                <option value="2Litros">2 Litros</option>
            </select>
            <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" required>
            <label>Observações:</label><textarea name="obs" placeholder="Ex: bem gelado"></textarea>
            <button type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>`;
    }

    item.innerHTML = html;
    item.querySelectorAll('input, select, textarea').forEach(e =>
        e.addEventListener('change', calcularTotal)
    );
    div.appendChild(item);
    calcularTotal();
}

function gerarResumo() {
    let resumo = "";
    let pedido = [];  // Array que vai armazenar itens para enviar ao backend

    document.querySelectorAll('.categoria .item').forEach((item) => {
        const sabor = item.querySelector('[name=sabor]').value.trim();
        const qtd = parseInt(item.querySelector('[name=qtd]').value) || 0;
        const obs = item.querySelector('[name=obs]')?.value.trim() || "";
        const selectLA = item.querySelector('[name=leiteOuAgua]');
        const leiteOuAgua = selectLA ? selectLA.value : null;
        const selectCompleto = item.querySelector('[name=completo]');
        const completo = selectCompleto ? selectCompleto.value : null;
        const categoria = item.closest('.categoria')?.dataset.categoria || "";
        const selectTamanhoRefri = item.querySelector('[name=tamanho]');
        const tamanhoRefri = selectTamanhoRefri ? selectTamanhoRefri.value : "";

        if (qtd > 0 && sabor) {
            resumo += `${qtd}x ${sabor}`;
            if (completo === 'sim') resumo += " (completo)";
            if (categoria === 'sucos' && leiteOuAgua) {
                resumo += leiteOuAgua === 'leite' ? " (com leite)" : " (com água)";
            }
            if (categoria === 'refri' && tamanhoRefri) {
                resumo += ` (${tamanhoRefri})`;
            }
            if (obs) resumo += ` - Obs: ${obs}`;
            resumo += "\n";

            pedido.push({
                sabor,
                qtd,
                obs,
                leiteOuAgua,
                completo,
                categoria,
                tamanhoRefri
            });
        }
    });

    return { resumo, pedido };
}

// Função para enviar o pedido para backend e pegar o valor total calculado
async function buscarValorTotal(pedido) {
    try {
        const response = await fetch('/calcular-valor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pedido })
        });

        const data = await response.json();
        if (data.status === 'sucesso') {
            return data.valorTotal; // valor retornado pelo backend
        } else {
            alert('Erro ao calcular valor: ' + data.mensagem);
            return 0;
        }
    } catch (error) {
        alert('Erro na comunicação com o servidor.');
        return 0;
    }
}

// Exemplo de uso ao montar o pedido (você pode ligar essa função ao evento de mudança do pedido)
async function atualizarResumoEValor() {
    const { resumo, pedido } = gerarResumo();
    document.getElementById('resumo-pedido').textContent = resumo;

    const valorTotal = await buscarValorTotal(pedido);
    document.getElementById('valor-total').textContent = `R$ ${valorTotal.toFixed(2)}`;
}
const calcularTotal = atualizarResumoEValor;
