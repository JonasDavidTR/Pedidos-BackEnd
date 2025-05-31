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

.then(res => res.json())
.then(data => {
    if (data.status === "sucesso") {
        // Salva no localStorage
        localStorage.setItem("whatsapp", form.whatsapp.value);
        localStorage.setItem("endereco", form.endereco.value);
        
        // Abre WhatsApp com mensagem pronta (o comentado só funciona em android, já o em execução
        // é para a maioria dos dispositivos)
        // window.location.href = data.whatsapp_link;
        if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")) {
            const a = document.createElement('a');
            a.href = data.whatsapp_link;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
        } else {
            window.location.href = data.whatsapp_link;
        }
        
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









// body {
//   font-family: sans-serif;
//   background-color: #e6d395d7;
//   color: #333;
//   padding: 10px;
//   max-width: 600px;
//   margin: auto;
// }

// .container {
//   padding: 20px;
// }

// h1 {
//   text-align: center;
//   color: #d4a017;
// }

// h2 {
//   background-color: #ffeaa7;
//   padding: 10px;
//   border-radius: 8px;
//   cursor: pointer;
//   margin-top: 15px;
// }

// .cardapio {
//   display: flex;
//   gap: 10px;
//   justify-content: center;
//   flex-wrap: wrap;
//   margin-bottom: 20px;
// }

// .cardapio img {
//   width: 45%;
//   cursor: pointer;
//   border-radius: 8px;
//   transition: transform 0.2s;
// }

// .cardapio img:hover {
//   transform: scale(1.05);
// }

// @media (max-width: 600px) {
//   .cardapio img {
//     width: 100%;
//   }
// }

// /* Lightbox */
// .lightbox {
//   display: none;
//   position: fixed;
//   z-index: 10;
//   left: 0;
//   top: 0;
//   width: 100vw;
//   height: 100vh;
//   background: rgba(0, 0, 0, 0.8);
//   justify-content: center;
//   align-items: center;
// }

// .lightbox img {
//   max-width: 90%;
//   max-height: 90%;
//   border-radius: 10px;
// }

// form {
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
// }

// label {
//   font-weight: bold;
// }

// input,
// textarea,
// select {
//   width: 100%;
//   margin-top: 5px;
//   padding: 10px;
//   border: 1px solid #ccc;
//   border-radius: 8px;
//   font-size: 16px;
//   box-sizing: border-box;
// }

// .item {
//   border: 1px solid #ccc;
//   padding: 8px;
//   border-radius: 6px;
//   margin-top: 10px;
// }

// .categoria {
//   margin-top: 10px;
//   padding-left: 10px;
//   display: none;
// }

// .flex {
//   display: flex;
//   gap: 10px;
// }

// .flex > div {
//   flex: 1;
// }


// button {
//   background-color: #d4a017;
//   color: white;
//   border: none;
//   padding: 10px;
//   border-radius: 8px;
//   font-size: 16px;
//   cursor: pointer;
//   transition: background 0.3s;
//   margin-top: 5px;
// }

// button:hover {
//   background-color: #b98b14;
// }

// .remover{
//   background-color: #dc3545;
// }

// .remover:hover{
//   background-color: #bd2130;
// }

// .total {
//   text-align: center;
//   font-weight: bold;
//   font-size: 1.2em;
//   margin-top: 20px;
// }





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// body {
//   margin: 0;
//   font-family: 'Segoe UI', sans-serif;
//   background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); /* azul escuro a roxo */
//   color: #f0f0f0;
//   min-height: 100vh;
//   padding-bottom: 40px;
// }

// h1, h2 {
//   text-align: center;
//   margin-top: 20px;
//   color: #ffdd57;
// }

// .container, form, .categoria {
//   background: rgba(255, 255, 255, 0.05);
//   backdrop-filter: blur(5px);
//   border-radius: 12px;
//   box-shadow: 0 0 10px rgba(0,0,0,0.3);
//   padding: 20px;
//   margin: 20px auto;
//   max-width: 90%;
// }

// .container button{
//   margin-top: 15px;
//   padding: 10px 20px;
//   font-size: 1rem;
//   font-weight: bold;
//   border: none;
//   border-radius: 10px;
//   cursor: pointer;
//   transition: all 0.3s ease-in-out; 
// }

// label {
//   display: block;
//   margin-top: 12px;
//   font-weight: bold;
//   color: #ffffffcc;
// }

// select, input, textarea {
//   background-color: rgba(255, 255, 255, 0.9); /* fundo quase branco, mas com leve transparência */
//   color: #222; /* texto escuro */
//   border: 1px solid #ccc;
//   border-radius: 8px;
//   padding: 10px;
//   font-size: 1rem;
//   width: 100%;
//   box-sizing: border-box;
//   margin-bottom: 10px;
//   transition: border 0.3s, box-shadow 0.3s;
// }

// select:focus, input:focus, textarea:focus {
//   outline: none;
//   border: 1px solid #ff8800; /* cor do foco */
//   box-shadow: 0 0 5px rgba(255, 136, 0, 0.5);
// }



// textarea::placeholder, input::placeholder {
//   color: #cccccc;
// }


// button {
//   margin-top: 15px;
//   padding: 10px 20px;
//   font-size: 1rem;
//   font-weight: bold;
//   border: none;
//   border-radius: 10px;
//   cursor: pointer;
//   transition: all 0.3s ease-in-out;
// }

// button[type="submit"] {
//   margin-top: 15px;
//   padding: 10px 20px;
//   font-size: 1rem;
//   font-weight: bold;
//   border: none;
//   border-radius: 10px;
//   cursor: pointer;
//   transition: all 0.3s ease-in-out;
//   background-color: #ffdd57;
//   color: #333;
// }

// button[type="submit"]:hover {
//   background-color: #ffcc00;
// }

// button[class="btn-remover"] {
//   background-color: #e63946;
//   color: white;
// }

// button[class="btn-remover"]:hover {
//   background-color: #c0292e;
// }

// .cardapio {
//   display: flex;
//   flex-wrap: wrap;
//   justify-content: center; /* Centraliza horizontalmente */
//   gap: 10px;
//   margin-top: 20px;
// }

// .cardapio img {
//   width: 48%;
//   max-width: 300px;
//   border-radius: 10px;
//   cursor: pointer;
//   transition: transform 0.2s;
//   box-shadow: 0 2px 6px rgba(0,0,0,0.3);
// }

// .cardapio img:hover {
//   transform: scale(1.03);
// }

// .total {
//   text-align: center;
//   font-size: 1.2rem;
//   margin-top: 20px;
//   background-color: #1d3557;
//   padding: 10px;
//   border-radius: 10px;
//   color: #f1faee;
//   font-weight: bold;
// }

// .lightbox {
//   position: fixed;
//   top: 0; left: 0; right: 0; bottom: 0;
//   background: rgba(0, 0, 0, 0.85);
//   display: none;
//   justify-content: center;
//   align-items: center;
//   z-index: 999;
// }

// .lightbox img {
//   max-width: 90%;
//   max-height: 90%;
//   border-radius: 10px;
//   box-shadow: 0 0 15px #000;
// }
