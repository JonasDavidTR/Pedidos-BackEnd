document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById('abrir-btn-cardapio');
  const cardapio = document.getElementById('cardapio-container');

  if (!btn || !cardapio) return;

  btn.addEventListener('click', () => {
    if (cardapio.style.maxHeight && cardapio.style.maxHeight !== '0px') {
      cardapio.style.maxHeight = '0';
      btn.textContent = 'Mostrar Cardápio';
    } else {
      cardapio.style.maxHeight = cardapio.scrollHeight + 'px';
      btn.textContent = 'Esconder Cardápio';
    }
  });
});
