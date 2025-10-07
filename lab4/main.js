let contador = 0;


function aumentarContador() {
  contador++;
  document.getElementById("contador").textContent = contador;
}


function resetarContador() {
  contador = 0;
  document.getElementById("contador").textContent = contador;
}

function mudarCorFundo() {
  document.body.style.backgroundColor = "#d6eaf8";
}

function voltarCorFundo() {
  document.body.style.backgroundColor = "#e8dfd0";
}

function mudarTexto() {
  document.getElementById("mensagem").textContent = "Budapeste é uma cidade incrível!";
}

function aumentarImagem() {
  document.querySelector("img").style.transform = "scale(1.1)";
}

function diminuirImagem() {
  document.querySelector("img").style.transform = "scale(1)";
}
