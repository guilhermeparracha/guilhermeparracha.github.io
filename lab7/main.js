// A URL base para aceder aos dados da loja (produtos e categorias).
const API_URL = "https://deisishop.pythonanywhere.com";

// Garante que o cesto de compras existe no armazenamento local, inicializando-o
// como um array vazio se for a primeira visita do utilizador.
if (!localStorage.getItem("produtos-selecionados")) {
    localStorage.setItem("produtos-selecionados", JSON.stringify([]));
}

// Guarda a lista completa de produtos para ser usada nos filtros.
let todosProdutos = [];

// O código principal da aplicação é executado quando a página está totalmente carregada.
document.addEventListener("DOMContentLoaded", () => {
    // Inicia o carregamento dos dados essenciais.
    carregarCategorias();
    carregarProdutos();
    // Atualiza a visualização do cesto e checkout.
    atualizaCesto();

    // Referências aos elementos de filtragem e ordenação.
    const filtroCategoria = document.getElementById("categoria");
    const ordemSelect = document.getElementById("ordem");
    const pesquisaInput = document.getElementById("pesquisa");

    // Configura os eventos de escuta (listeners) para acionar a atualização dos produtos
    // sempre que o utilizador altera um filtro ou digita na pesquisa.
    filtroCategoria.addEventListener("change", atualizarProdutosVisiveis);
    ordemSelect.addEventListener("change", atualizarProdutosVisiveis);
    pesquisaInput.addEventListener("input", atualizarProdutosVisiveis);
});

// === Carregar categorias ===
// Busca as categorias disponíveis na API e preenche o menu de seleção (dropdown).
function carregarCategorias() {
    fetch(`${API_URL}/categories/`)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao carregar categorias");
            return response.json();
        })
        .then(categorias => {
            const select = document.getElementById("categoria");
            // Adiciona cada categoria como uma nova opção ao filtro.
            categorias.forEach(nomeCategoria => {
                const opt = document.createElement("option");
                opt.value = nomeCategoria;
                opt.textContent = nomeCategoria;
                select.appendChild(opt);
            });
        })
        .catch(error => console.error("Erro ao obter categorias:", error));
}

// === Carregar produtos ===
// Busca a lista completa de produtos da API.
function carregarProdutos() {
    fetch(`${API_URL}/products/`)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao carregar produtos");
            return response.json();
        })
        .then(produtos => {
            // Guarda a lista para ser filtrada.
            todosProdutos = produtos;
            // Exibe todos os produtos pela primeira vez.
            atualizarProdutosVisiveis();
        })
        .catch(error => console.error("Erro ao obter produtos:", error));
}

// === Atualizar lista de produtos visíveis conforme filtros ===
// Filtra, pesquisa e ordena os produtos com base nas escolhas do utilizador.
function atualizarProdutosVisiveis() {
    const categoriaSelecionada = document.getElementById("categoria").value;
    const ordem = document.getElementById("ordem") ? document.getElementById("ordem").value : "";
    const pesquisa = document.getElementById("pesquisa") ? document.getElementById("pesquisa").value.toLowerCase() : "";

    // Começa com uma cópia da lista completa de produtos.
    let produtosFiltrados = [...todosProdutos];

    // 🔹 Filtrar por categoria
    if (categoriaSelecionada) {
        produtosFiltrados = produtosFiltrados.filter(p => {
            const catProduto = (p.category || "").trim().toLowerCase();
            const catSelecionada = categoriaSelecionada.trim().toLowerCase();
            return catProduto === catSelecionada;
        });
    }

    // 🔹 Filtrar por pesquisa (procura no título, ignorando maiúsculas/minúsculas).
    if (pesquisa.trim() !== "") {
        produtosFiltrados = produtosFiltrados.filter(p =>
            p.title.toLowerCase().includes(pesquisa)
        );
    }

    // 🔹 Ordenar por preço
    if (ordem === "asc") {
        produtosFiltrados.sort((a, b) => a.price - b.price); // Menor preço
    } else if (ordem === "desc") {
        produtosFiltrados.sort((a, b) => b.price - a.price); // Maior preço
    }

    // Exibe o resultado do filtro e ordenação.
    mostrarProdutos(produtosFiltrados);
}

// === Mostrar produtos ===
// Renderiza a lista de produtos na secção designada.
function mostrarProdutos(produtos) {
    const secaoProdutos = document.getElementById("produtos");
    secaoProdutos.innerHTML = ""; // Limpa a lista atual.

    if (produtos.length === 0) {
        secaoProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
        return;
    }

    // Cria o cartão (artigo) HTML para cada produto.
    produtos.forEach(produto => {
        const artigo = criarProduto(produto);
        secaoProdutos.appendChild(artigo);
    });
}

// === Criar elemento HTML de produto ===
// Constrói a estrutura visual de um único produto (título, imagem, preço, etc.).
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

    // ⭐ Avaliação (opcional, só mostra se a informação estiver disponível)
    if (produto.rating && produto.rating.rate) {
        const rating = document.createElement("p");
        rating.textContent = `Avaliação: ⭐ ${produto.rating.rate} (${produto.rating.count} avaliações)`;
        artigo.appendChild(rating);
    }

    const botao = document.createElement("button");
    botao.textContent = "+ Adicionar ao cesto";

    // Adiciona o produto ao cesto quando o botão é clicado.
    botao.addEventListener("click", () => {
        const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];
        lista.push(produto);
        localStorage.setItem("produtos-selecionados", JSON.stringify(lista));
        // Atualiza a interface do cesto para refletir a adição.
        atualizaCesto();
    });

    artigo.append(titulo, imagem, descricao, preco, botao);
    return artigo;
}

// === Atualizar cesto ===
// Renderiza o resumo do cesto e a secção de checkout.
function atualizaCesto() {
    const secaoCesto = document.getElementById("cesto");
    secaoCesto.innerHTML = ""; // Limpa a área do cesto.

    const lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];

    // Se não houver itens, mostra uma mensagem e para.
    if (lista.length === 0) {
        secaoCesto.innerHTML = "<p>O seu cesto está vazio.</p>";
        return;
    }

    // Container visual para o resumo do cesto.
    const cestoContainer = document.createElement("div");
    cestoContainer.className = "cesto-itens-container";

    // Mostra apenas o primeiro item como resumo visual, como na imagem.
    if (lista.length > 0) {
        const produto = lista[0];
        const resumoItem = document.createElement('div');
        resumoItem.className = 'cesto-resumo-item';
        resumoItem.innerHTML = `
            <div class="produto-resumo">
                <img src="${produto.image}" alt="${produto.title}" style="max-width: 100px; display: block; margin: 0 auto;">
                <p style="text-align: center;">${produto.title}</p>
            </div>
        `;
        cestoContainer.appendChild(resumoItem);
    }

    secaoCesto.appendChild(cestoContainer);

    // Cria a área de finalização da compra (checkout).
    criarCheckout(lista);
}


// === Criar secção de Checkout ===
// Constrói a interface de pagamento, descontos e finalização.
function criarCheckout(listaProdutos) {
    const secaoCesto = document.getElementById("cesto");
    // Calcula o valor total dos produtos no cesto.
    let total = listaProdutos.reduce((soma, produto) => soma + produto.price, 0);

    const checkoutDiv = document.createElement("div");
    checkoutDiv.className = "checkout";
    
    // --- Cartão de resumo (total e botão de remover) ---
    const cardDiv = document.createElement('div');
    cardDiv.className = 'cesto-card'; 

    // Exibe o total e o botão para remover *todos* os itens.
    cardDiv.innerHTML = `
        <p>Custo total: <span id="custo-parcial">${total.toFixed(2)}</span> €</p>
        <button id="remover-cesto-btn">- Remover do Cesto</button>
    `;

    // Lógica para limpar o cesto por completo.
    const btnRemoverTudo = cardDiv.querySelector('#remover-cesto-btn');
    btnRemoverTudo.addEventListener('click', () => {
        localStorage.setItem("produtos-selecionados", JSON.stringify([]));
        atualizaCesto(); // Recarrega o cesto (agora vazio).
    });

    checkoutDiv.appendChild(cardDiv);

    // --- Secção de Descontos e Compra ---
    const descontosDiv = document.createElement('div');
    descontosDiv.className = 'descontos-compra';

    // O elemento principal que mostra o Custo Total.
    const totalElem = document.createElement("h2");
    totalElem.textContent = `Custo total: ${total.toFixed(2)} €`;
    totalElem.style.textAlign = 'center'; 
    descontosDiv.appendChild(totalElem);

    // 1. Checkbox para estudante DEISI
    const divEstudante = document.createElement('div');
    divEstudante.innerHTML = `
        <label for="estudante-deisi">És estudante do DEISI?</label>
        <input type="checkbox" id="estudante-deisi"> 
    `;
    divEstudante.style.display = 'flex';
    divEstudante.style.alignItems = 'center';
    divEstudante.style.justifyContent = 'center'; 
    descontosDiv.appendChild(divEstudante);

    // 2. Campo para o Cupão de Desconto
    const divCupao = document.createElement('div');
    divCupao.innerHTML = `
        <label for="cupao-desconto">Cupão de desconto:</label>
        <input type="text" id="cupao-desconto">
    `;
    divCupao.style.display = 'flex';
    divCupao.style.alignItems = 'center';
    divCupao.style.justifyContent = 'center'; 
    descontosDiv.appendChild(divCupao);

    // 3. Botão Comprar
    const btnComprar = document.createElement("button");
    btnComprar.textContent = "Comprar";
    btnComprar.id = "btn-comprar";
    
    const divComprar = document.createElement('div');
    divComprar.style.textAlign = 'center'; 
    divComprar.appendChild(btnComprar);

    descontosDiv.appendChild(divComprar);


    // Referências e Lógica de Desconto (10% se estudante OU usar o cupão 'DEISI10').
    const estudanteCheckbox = divEstudante.querySelector('#estudante-deisi');
    const cupaoInput = divCupao.querySelector('#cupao-desconto');

    // Função que calcula e atualiza o total com base nas condições de desconto.
    const aplicarDesconto = () => {
        let descontoAplicado = 0;
        let novoTotal = total;
        
        const isEstudante = estudanteCheckbox.checked;
        // Põe o valor do cupão em maiúsculas para facilitar a validação.
        const cupaoValor = cupaoInput.value.trim().toUpperCase();

        if (isEstudante || cupaoValor === "DEISI10") {
            descontoAplicado = total * 0.10; // Aplica 10% de desconto.
            novoTotal = total - descontoAplicado;
            alert(`Desconto de 10% aplicado! (Economizou: ${descontoAplicado.toFixed(2)} €)`);
        } else if (cupaoValor !== "") {
            alert("Cupão inválido. Tente 'DEISI10'.");
        }

        // Atualiza o valor visível para o utilizador.
        totalElem.textContent = `Custo total: ${novoTotal.toFixed(2)} €`;
    };

    // Aplica o desconto se o estado do checkbox mudar (ótimo para feedback imediato).
    estudanteCheckbox.addEventListener('change', aplicarDesconto);
    
    // Quando o utilizador clica em Comprar, o desconto é recalculado e a compra é simulada.
    btnComprar.addEventListener('click', (e) => {
        e.preventDefault(); 
        aplicarDesconto(); // Garante que o total está correto.
        
        // Simulação da conclusão do pagamento.
        const totalFinal = parseFloat(totalElem.textContent.replace('Custo total: ', '').replace(' €', ''));
        if (totalFinal > 0) {
            alert(`Compra de ${totalFinal.toFixed(2)} € finalizada com sucesso!`);
            // Limpa o cesto e atualiza a interface.
            localStorage.setItem("produtos-selecionados", JSON.stringify([]));
            atualizaCesto();
        } else {
            alert("Não é possível finalizar a compra com um cesto vazio.");
        }
    });


    checkoutDiv.appendChild(descontosDiv);
    secaoCesto.appendChild(checkoutDiv);
}

// === Cria um item individual para a lista do cesto (com botão de remover individual) ===
// Esta função é a original do seu código. É mantida caso queira listar todos os itens.
function criaProdutoCesto(produto) {
    const artigo = document.createElement("article");

    const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

    const preco = document.createElement("p");
    preco.textContent = `Preço: €${produto.price}`;

    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "❌ Remover";

    // Lógica para remover apenas uma unidade deste produto.
    botaoRemover.addEventListener("click", () => {
        let lista = JSON.parse(localStorage.getItem("produtos-selecionados")) || [];
        // Encontra a primeira ocorrência do produto.
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