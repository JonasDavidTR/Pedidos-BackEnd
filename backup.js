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