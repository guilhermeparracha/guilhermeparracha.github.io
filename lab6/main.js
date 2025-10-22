if (!localStorage.getItem("produtos-selecionados")) {
  localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}


document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos(produtos);
  atualizaCesto();
});

function carregarProdutos(produtos) {
  const secaoProdutos = document.getElementById("produtos");

  produtos.forEach(produto => {
    const artigo = criarProduto(produto);
    secaoProdutos.appendChild(artigo);
  });
}


function criarProduto(produto) {
  const artigo = document.createElement("article");

  const titulo = document.createElement("h2");
  titulo.textContent = produto.title;

  const imagem = document.createElement("img");
  imagem.src = produto.image;
  imagem.alt = produto.title;

  const descricao = document.createElement("p");
  descricao.textContent = produto.description;

  const preco = document.createElement("p");
  preco.textContent = `Preço: €${produto.price}`;

  const botao = document.createElement("button");
  botao.textContent = "+ Adicionar ao cesto";

  botao.addEventListener("click", () => {
    const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];

    lista.push(produto);

    localStorage.setItem("produtos-selecionados", JSON.stringify(lista));
    atualizaCesto();
  });

  artigo.append(titulo, imagem, descricao, preco, botao);

  return artigo;
}

function adicionarAoCarrinho(produto) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  carrinho.push(produto);

  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  console.log("Produto adicionado ao carrinho:", produto.title);
}

function atualizaCesto() {
  const secaoCesto = document.getElementById("cesto");
  secaoCesto.innerHTML = "";

  const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];

  lista.forEach(produto => {
    const artigo = criaProdutoCesto(produto);
    secaoCesto.appendChild(artigo);
  });

  const total = lista.reduce((soma, produto) => soma + produto.price, 0);

  const totalElem = document.createElement("p");
  totalElem.textContent = `Total: €${total.toFixed(2)}`;
  totalElem.style.fontWeight = "bold";
  secaoCesto.appendChild(totalElem);
}

function criaProdutoCesto(produto) {
  const artigo = document.createElement("article");

  const titulo = document.createElement("h3");
  titulo.textContent = produto.title;

  const preco = document.createElement("p");
  preco.textContent = `Preço: €${produto.price}`;

  const botaoRemover = document.createElement("button");
  botaoRemover.textContent = "❌ Remover";

  botaoRemover.addEventListener("click", () => {
    let lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];

    const indice = lista.findIndex(p => p.id === produto.id);

    if (indice !== -1) {
      lista.splice(indice, 1);

      localStorage.setItem("produtos-selecionados", JSON.stringify(lista));

      atualizaCesto();
    }
  });

  artigo.append(titulo, preco, botaoRemover);
  return artigo;
}
