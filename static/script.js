
let tempoInativo = 0;
setInterval(() => {
    tempoInativo += 1;
    if (tempoInativo >= 15) { // 15 minutos
        location.reload(); // atualiza a página
    }
}, 60000); //

document.addEventListener('mousemove', () => tempoInativo = 0);
document.addEventListener('keydown', () => tempoInativo = 0);


let enviandoPedido = false;

document.getElementById("pedido-form").addEventListener("submit", function(event) {
    event.preventDefault();

    if (enviandoPedido) return; // bloqueia envios repetidos
    // Valida campos obrigatórios
    const textareaResumo = document.getElementById('resumo-pedido');
    const whatsapp = document.querySelector("input[name='whatsapp']").value.trim();
    const endereco = document.querySelector("[name='endereco']").value.trim();

    if (textareaResumo.value.trim() === "") {
        alert("⚠️ Você ainda não montou seu pedido. Adicione os itens antes de enviar.");
        return;
    }

    // Se passar em tudo, continua
    enviandoPedido = true;

   
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');

    button.disabled = true;
    button.textContent = "Enviando pedido... Aguarde";

    const formData = new FormData(form);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const linkWppPromise = fetch("https://degust-lanches.onrender.com/enviar-pedido", {
        method: "POST",
        body: formData
    }).then(res => res.json());

    if (isIOS) {
        // iOS: abrir link via click direto no evento submit (interação direta)
        // Criar link com href padrão (vai abrir depois da resposta)

        // Saída simples:
        alert("💬 Para concluir o pedido, clique no botão abaixo. Em seguida, abriremos o WhatsApp para finalizar.");
        
        linkWppPromise.then(data => {
            if (data.status === "sucesso") {
                localStorage.setItem("whatsapp", form.whatsapp.value);
                localStorage.setItem("endereco", form.endereco.value);

                 // cria ou seleciona uma div para exibir o botão
                const div = document.getElementById("confirmacao-pedido") || document.createElement("div");
                if (!div.id) {
                    div.style.marginTop = "20px";
                    form.appendChild(div);
                }
                div.innerHTML = "<p><strong>Pedido enviado!</strong> Clique abaixo para abrir o WhatsApp:</p>";

                // Mostra o link para o usuário clicar
                const botao = document.createElement("button");
                botao.textContent = "Abrir WhatsApp";
                botao.style.backgroundColor = "#25D366";
                botao.style.color = "white";
                botao.style.padding = "10px 15px";
                botao.style.border = "none";
                botao.style.borderRadius = "5px";
                botao.style.fontWeight = "bold";

                
                botao.onclick = () => {
                    window.open(data.whatsapp_link, "_blank");
                    
                };
                
                //div.innerHTML = "<p><strong>Pedido enviado!</strong> Clique abaixo para abrir o WhatsApp:</p>";
                div.appendChild(botao);
                div.scrollIntoView({ behavior: 'smooth' });


                //////////////////
                function esperar(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                

                async function exec() {
                    await esperar(15000); // Espera 15 segundos
                    location.reload();
                }
                exec();
                //////////////////

                calcularTotal();
            } else {
                alert("Erro: " + data.mensagem);
            }
        }).catch(() => {
            alert("Erro ao enviar pedido. Tente novamente.");
        }).finally(() => {
            // button.disabled = false;
            // button.textContent = "Enviar Pedido";
        });


    } else {
        // Android e outros
        linkWppPromise.then(data => {
            if (data.status === "sucesso") {
                localStorage.setItem("whatsapp", form.whatsapp.value);
                localStorage.setItem("endereco", form.endereco.value);

                window.location.href = data.whatsapp_link;

                setTimeout(() => {
                    alert("Pedido enviado com sucesso!");
                    form.reset();
                    calcularTotal();
                }, 60000);
            } else {
                alert("Erro: " + data.mensagem);
            }
        }).catch(() => {
            alert("Erro ao enviar pedido. Tente novamente.");
        }).finally(() => {
            button.disabled = false;
            button.textContent = "Enviar Pedido";
        });
    }
});



document.addEventListener("DOMContentLoaded", () => {
    const whatsappSalvo = localStorage.getItem("whatsapp");
    const enderecoSalvo = localStorage.getItem("endereco");

    if (whatsappSalvo) {
        document.querySelector("input[name='whatsapp']").value = whatsappSalvo;
    }

    if (enderecoSalvo) {
        document.querySelector("[name='endereco']").value = enderecoSalvo;
    }

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
    coca: { Juininho: 3, Lata: 5, '1L': 7, '2L': 12 },
    fanta: { Juininho: 2, Lata: 5, '1L': 7, '2L': 12},
    guarana: { Juininho: 2, Lata: 4, '1L': 6, '2L': 10 },
    outros: { Juininho: 2, Lata: 4, '1L': 6, '2L': 10 }
};

function toggleCategoria(id) {
    const cat = document.getElementById(id);
    if (cat.children.length > 0) return; // Não fecha se tiver itens dentro
    cat.style.display = cat.style.display === 'none' ? 'block' : 'none';
}


let disponibilidadeGlobal = {}; // variável global para armazenar disponibilidade do cardápio
async function carregarDisponibilidade() {
    try {
        const res = await fetch('https://degust-lanches.onrender.com/disponibilidade');
        if (!res.ok) throw new Error('Erro ao buscar disponibilidade');
        disponibilidadeGlobal = await res.json();
    } catch (e) {
        console.error(e);
        disponibilidadeGlobal = {};
    }
}

function aplicarIndisponibilidade(select) {
    for (const opt of select.options) {
        const val = opt.value.toLowerCase().trim();
        if (val === "" || val === "br") continue;

        if (disponibilidadeGlobal[val] === false) {
            opt.disabled = true;
            opt.style.textDecoration = 'line-through';
            opt.style.opacity = '0.5';
            if (!opt.text.includes('(indisponível)')) {
                opt.text += ' (indisponível)';
            }
        } else {
            opt.disabled = false;
            opt.style.textDecoration = '';
            opt.style.opacity = '';
            opt.text = opt.text.replace(' (indisponível)', '');
        }
    }
}


// Área dos refri. Mostra se está ou não disponível no cardápio
function atualizarTamanhos(selectSabor, selectTamanho) {
    const sabor = selectSabor.value;
    for (const opt of selectTamanho.options) {
        const chave = `${sabor}-${opt.value}`.toLowerCase();
        const disponivel = disponibilidadeGlobal[chave];

        if (disponivel === false) {
            opt.disabled = true;
            
            opt.style.opacity = '0.5';
            if (!opt.text.includes('(indisponível)')) {
                opt.text += ' (indisponível)';
            }
        } else {
            opt.disabled = false;
            opt.style.textDecoration = '';
            opt.style.opacity = '';
            opt.text = opt.text.replace(' (indisponível)', '');
        }
    }
}



async function addItem(categoria) {
    const div = document.getElementById(categoria);
    div.style.display = 'block'; // Sempre mostra a categoria

    // Carrega a disponibilidade antes de criar o item
    if (Object.keys(disponibilidadeGlobal).length === 0) {
        await carregarDisponibilidade();
    }

    const item = document.createElement('div');
    item.className = 'item';

    let html = '';

    if (categoria === 'lanches') {
        html = `
            <label>Sabor (selecione):</label>
            <select name="sabor" required>
                <option value="">Escolher sabor</option>
                <option value="hotdog">Cachorro quente</option>
                <option value="Queijo">Queijo</option>
                <option value="Carne">Carne</option>
                <option value="Frango">Frango</option>
                <option value="Misto">Misto</option>
                <option value="fQueijo">Frango com Queijo</option>
                <option value="Catupiry">Frango com Catupiry</option>
                <option value="Cheddar">Frango com Cheddar</option>
            </select>
            <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" max="50" required>
            <label>Completo (molhos e verdura)?</label>
            <select name="completo">
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
            </select>
            <label>Observações:</label><textarea name="obs" placeholder="Ex: 1 com verdura, 1 sem"></textarea>
            <button class="btn-remover" type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>`;
    } else if (categoria === 'salgados') {
        html = `
            <label>Sabor (selecione):</label>
            <select name="sabor" required>
                <option value="">Escolher Salgado</option>
                <option value="Enroladinho">Enroladinho</option>
                <option value="Coxinha">Coxinha</option>
            </select>
            <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" max="50" required>
            <button class="btn-remover" type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>`;
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
            <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" max="50" required>
            <label>Observações:</label><textarea name="obs" placeholder="Ex: Sem talher, sabor da trufa..."></textarea>
            <button class="btn-remover" type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>`;
    } else if (categoria === 'sucos') {
        html = `
            <label>Sabor (selecione):</label>
            <select name="sabor" required>
                <option value="">Escolher sabor</option>
                <option value="Graviola">Graviola</option>
                <option value="Goiaba">Goiaba</option>
                <option value="Acerola">Acerola</option>
                <option value="Maracuja">Maracujá</option>
                <option value="Morango">Morango</option>
                <option value="Manga">Manga</option>
                <option value="Tangerina">Tangerina</option>
                <option value="AbacaxiHortela">Abacaxi com hortelã</option>
                <option value="Abacaxi">Abacaxi</option>
                <option value="Uva">Uva</option>
                <option value="Acai">Açaí</option>
                <option value="Caju">Caju</option>
                <option value="Caja">Cajá</option>
                <option value="Pinha">Pinha</option>
                <option value="Umbu">Umbu</option>
            </select>
            <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" max="50" required>
            <label>Com leite ou água?</label>
            <select name="leiteOuAgua">
                <option value="leite">Leite</option>
                <option value="agua">Água</option>
            </select>
            <label>Observações:</label><textarea name="obs" placeholder="Ex: sem açúcar"></textarea>
            <button class="btn-remover" type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>`;
    } else if (categoria === 'refri') {
        html = `
        <label>Refrigerante (selecione):</label>
        <select name="sabor" required>
            <option value="">Escolher refri</option>
            <option value="Coca">Coca Cola</option>
            <option value="Guarana">Guaraná</option>
            <option value="Fanta">Fanta</option>
            <option value="Pepsi">Pepsi</option>
            <option value="Uva">Uva</option>
            <option value="Limao">Limão</option>
        </select>
        <label>De qual tamanho?</label>
        <select name="tamanho" required>
            <option value="Juininho">Juininho</option>
            <option value="Lata">Lata</option>
            <option value="1L">1 Litro</option>
            <option value="2L">2 Litros</option>
        </select>
        <label>Quantidade:</label><input type="number" name="qtd" value="1" min="1" max="4" required>
        <label>Observações:</label><textarea name="obs" placeholder="Ex: bem gelado"></textarea>
        <button class="btn-remover" type="button" onclick="this.parentElement.remove(); calcularTotal()">Remover</button>
    `;
    }

    item.innerHTML = html;

    
// // Aplica indisponibilidade nas opções de sabor
    const selectSabor = item.querySelector('select[name="sabor"]');
    const selectTamanho = item.querySelector('select[name="tamanho"]');
    if (selectSabor) aplicarIndisponibilidade(selectSabor);
    if (selectTamanho){
        selectSabor.addEventListener('change', () => {
            atualizarTamanhos(selectSabor, selectTamanho);
        });
    }


    // Adiciona event listeners para recalcular total quando qualquer input mudar
    item.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('change', calcularTotal);
    });

    div.appendChild(item);
    calcularTotal();
}

// Gera um resumo em tempo real do pedido
function gerarResumo() {
    let resumo = "";
    let pedido = [];  // armazenamento dos itens

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
        
        const chaveDisponibilidade = `${sabor}-${tamanhoRefri}`;
        const chave = chaveDisponibilidade.toLowerCase();
        const disponivel = categoria === 'refri' ? disponibilidadeGlobal[chave] : true;

        if (qtd > 0 && sabor && disponivel) {
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

// Monta o pedido na tela do usuario
async function atualizarResumoEValor() {
    const { resumo, pedido } = gerarResumo();
    document.getElementById('resumo-pedido').textContent = resumo;

    


    try {
        const resposta = await fetch("/calcular-valor", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pedido }),
        });

        const data = await resposta.json();

        if (data.status === "sucesso") {
            document.getElementById('valor-total').textContent = `Total: R$ ${data.valorTotal.toFixed(2)}`;
        } else {
            // Erro retornado pelo backend (ex: quantidade inválida)
            alert("Erro: " + data.mensagem);

            // Limpa o resumo e o valor total
            document.getElementById('resumo-pedido').textContent = "";
            document.getElementById('valor-total').textContent = "R$ 0.00";
        }
    } catch (error) {
        // Erro de rede ou do servidor
        alert("Erro ao calcular valor. Tente novamente.");
        document.getElementById('resumo-pedido').textContent = "";
        document.getElementById('valor-total').textContent = "R$ 0.00";
    }
}

const calcularTotal = atualizarResumoEValor;
