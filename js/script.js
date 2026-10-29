

const API_BASE = "https://ppw-1-tads.vercel.app";

async function requisicaoAPI(endpoint, opcoes = {}) {
    const resposta = await fetch(API_BASE + endpoint, opcoes);

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error("Erro HTTP: " + resposta.status);
    }

    return dados;
}




// BANCO DADOS DE USUÁRIOS
let usuarios = [
    {
        nome: "Administrador",
        email: "admin@shop.com",
        senha: "123456"
    },
    {
        nome: "Anderson",
        email: "anderson@email.com",
        senha: "123"
    },
    {
        nome: "ADM",
        email: "a@mail",
        senha: "123"
    }
];

const usuariosSalvos = localStorage.getItem("usuarios");

if (usuariosSalvos) {
    usuarios = JSON.parse(usuariosSalvos);
}

// LOGIN do usuário
const formulario = document.querySelector("#form-login");

if (formulario) {

    formulario.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = document.querySelector("#email").value.toUpperCase();
        const senha = document.querySelector("#senha").value;

        const usuario = usuarios.find(function (u) {
            return u.email.toLocaleUpperCase() === email && u.senha === senha;
        });

        if (usuario) {

            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

            const modal = new bootstrap.Modal(
                document.getElementById("modalSucesso")
            );

            modal.show();

            setTimeout(function () { window.location.href = "../index.html"; }, 3000);

        } else {

            const modalErro = new bootstrap.Modal(
                document.getElementById("modalErro")
            );
            modalErro.show();

        }

    });

}

// Atualizar o navbar 
function atualizarNavbar() {

    const dados = localStorage.getItem("usuarioLogado");

    if (!dados) return;

    const usuario = JSON.parse(dados);

    document.querySelector("#nomeUsuario").innerHTML = usuario.nome;

    document.querySelector("#menuLogin").style.display = "none";
    document.querySelector("#menuCadastro").style.display = "none";

    document.querySelector("#menuPerfil").style.display = "block";
    document.querySelector("#menuPedidos").style.display = "block";
    document.querySelector("#menuSair").style.display = "block";

}

atualizarNavbar();


//botão  sair da conta de usuário
const btnSair = document.querySelector("#btnSair");

if (btnSair) {

    btnSair.addEventListener("click", function () {

        localStorage.removeItem("usuarioLogado");

        window.location.href = "../index.html";

    });

}

//Check mostrar senha
const mostrar = document.querySelector("#mostrarSenha");

if (mostrar) {

    mostrar.addEventListener("change", function () {

        const senha = document.querySelector("#senha");

        if (this.checked) {
            senha.type = "text";
        } else {
            senha.type = "password";
        }

    });

}

//Cadastro de usuário
const formularioCadastro = document.querySelector("#form-cadastro");

if (formularioCadastro) {

    formularioCadastro.addEventListener("submit", function (e) {

        e.preventDefault();

        const nome = document.querySelector("#nome").value;
        const email = document.querySelector("#email").value;
        const senha = document.querySelector("#senha").value;
        const confirmarSenha = document.querySelector("#confirmarSenha").value;

        if (senha !== confirmarSenha) {
            const modalSenha = new bootstrap.Modal(
                document.getElementById("modalSenhaDiferente")
            );
            modalSenha.show();
            return;
        }

        const usuarioExiste = usuarios.find(function (u) {
            return u.email.toUpperCase() === email.toUpperCase();
        });

        if (usuarioExiste) {
            const modalEmail = new bootstrap.Modal(
                document.getElementById("modalEmailExiste")
            );
            modalEmail.show();
            return;
        }

        usuarios.push({
            nome: nome,
            email: email,
            senha: senha
        });

        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        const modal = new bootstrap.Modal(
            document.getElementById("modalCadastro")
        );

        modal.show();

        formularioCadastro.reset();

        setTimeout(function () {
            window.location.href = "../index.html";
        }, 2000);

    });

}

// MOSTRAR DADOS DO USUÁRIO
const dadosUsuario = localStorage.getItem("usuarioLogado");

if (dadosUsuario) {

    const usuario = JSON.parse(dadosUsuario);

    const dadosNome = document.querySelector("#dadosNome");
    const dadosEmail = document.querySelector("#dadosEmail");
    const nomeUsuEnd = document.querySelector("#nomeUsu");

    //nome endereço carrinho
    if (dadosNome) {
        dadosNome.textContent = usuario.nome;
    }

    if (dadosEmail) {
        dadosEmail.textContent = usuario.email;
    }
    if (nomeUsuEnd) {
        nomeUsuEnd.textContent = usuario.nome;
    }

}



/**
 * Lista de produtos carregados da API.
 * Começa vazia e será preenchida pela requisição.
 */
let produtos = [];

// Listar os produtos
const listaProdutos = document.querySelector("#listaProdutos");

async function listarProdutos() {

    if (!listaProdutos) return;

    try {

        const dados = await requisicaoAPI("/api/products");

        produtos = dados.products;

        listaProdutos.innerHTML = "";

        produtos.forEach(function (produto) {

            listaProdutos.innerHTML += `
            
                <div class="col-md-6 col-lg-3">

                    <div class="card h-100">
                    <input type="hidden" class="produto-id" value="${produto.id}">

                        <img src="${produto.image}"
                            class="card-img-top imagem-produto"
                            alt="${produto.name}">

                        <div class="card-body d-flex flex-column">

                           <h5 class="card-title">${produto.name}</h5>

                            <p class="card-text">${produto.description}</p>

                            <p class="mb-2">
                                <strong>Categoria:</strong> ${produto.category}
                            </p>

                            ${produto.stock === 0
                                ? '<p class="text-danger fw-bold">Produto esgotado</p>'
                                : `<p class="text-success">Estoque: ${produto.stock} unidade(s)</p>`
                            }

                            <p class="mt-auto">
                                <strong>R$ ${Number(produto.price).toFixed(2).replace(".", ",")}</strong>
                            </p>

                            <button class="btn btn-success btn-adicionar" data-id="${produto.id}">
                                Adicionar ao carrinho
                            </button>

                        </div>

                    </div>

                </div>

            `;

        });

    } catch (erro) {

        console.error("Erro ao carregar produtos:", erro);

        listaProdutos.innerHTML = `
            <div class="col-12 text-center">
                <p>Não foi possível carregar os produtos. Tente novamente.</p>
            </div>
        `;

    }

}

listarProdutos();



const formBusca = document.querySelector("#formBusca");
const campoBusca = document.querySelector("#campoBusca");
const filtroCategoria = document.querySelector("#filtroCategoria");

// Guarda o temporizador da busca
let temporizadorBusca;

async function buscarProdutos() {

    const termo = campoBusca.value.trim();
    const categoria = filtroCategoria.value;

    const parametros = new URLSearchParams();

    if (termo) {
        parametros.append("search", termo);
    }

    if (categoria) {
        parametros.append("category", categoria);
    }

    const consulta = parametros.toString();

    const endpoint = consulta ? "/api/products?" + consulta : "/api/products";

    try {

        const dados = await requisicaoAPI(endpoint);

        produtos = dados.products;

        listaProdutos.innerHTML = "";

        produtos.forEach(function (produto) {

            listaProdutos.innerHTML += `
                <div class="col-md-6 col-lg-3">
                    <div class="card h-100">
                    <input type="hidden" class="produto-id" value="${produto.id}">

                        <img src="${produto.image}"
                            class="card-img-top imagem-produto"
                            alt="${produto.name}">

                        <div class="card-body d-flex flex-column">

                            <h5 class="card-title">${produto.name}</h5>

                            <p class="card-text">${produto.description}</p>

                            <p class="mb-2">
                                <strong>Categoria:</strong> ${produto.category}
                            </p>

                            ${produto.stock === 0
                                ? '<p class="text-danger fw-bold">Produto esgotado</p>'
                                : `<p class="text-success">Estoque: ${produto.stock} unidade(s)</p>`
                            }

                            <p class="mt-auto">
                                <strong>R$ ${Number(produto.price).toFixed(2).replace(".", ",")}</strong>
                            </p>

                            <button class="btn btn-success btn-adicionar"
                                data-id="${produto.id}">
                                Adicionar ao carrinho
                            </button>

                        </div>
                    </div>
                </div>
            `;

        });

        if (produtos.length === 0) {
            listaProdutos.innerHTML = `
                <div class="col-12 text-center">
                    <p>Nenhum produto encontrado.</p>
                </div>
            `;
        }

    } catch (erro) {

        console.error("Erro ao buscar produtos:", erro);

        listaProdutos.innerHTML = `
            <div class="col-12 text-center">
                <p>Não foi possível carregar os produtos.</p>
            </div>
        `;

    }

}

// Busca ao enviar o formulário
if (formBusca && campoBusca && filtroCategoria) {

    formBusca.addEventListener("submit", function (e) {

        e.preventDefault();

        clearTimeout(temporizadorBusca);

        buscarProdutos();

    });

    // Debounce: espera 500 ms após a última tecla
    campoBusca.addEventListener("input", function () {

        clearTimeout(temporizadorBusca);

        temporizadorBusca = setTimeout(function () {
            buscarProdutos();
        }, 500);

    });

    // Filtra imediatamente ao trocar a categoria
    filtroCategoria.addEventListener("change", function () {

        clearTimeout(temporizadorBusca);

        buscarProdutos();

    });

}




//TOAST DO CARRINHO
const elementoToast = document.querySelector("#toastCarrinho");

let toastCarrinho = null;

if (elementoToast && typeof bootstrap !== "undefined") {
    toastCarrinho = new bootstrap.Toast(elementoToast, {
        delay: 3000
    });
}


// Botão adicionar produto ao carrinho
if (listaProdutos) {

    listaProdutos.addEventListener("click", function (e) {

        const botao = e.target.closest(".btn-adicionar");

        if (!botao) return;

        const id = Number(botao.dataset.id);

        const produto = produtos.find(function (p) {
            return p.id === id;
        });

        if (!produto) return;

        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        const produtoCarrinho = carrinho.find(function (p) {
            return p.id === produto.id;
        });

        if (produtoCarrinho) {

            produtoCarrinho.quantidade++;

        } else {

            carrinho.push({
                id: produto.id,
                nome: produto.name,
                preco: Number(produto.price),
                imagem: produto.image,
                quantidade: 1
            });

        }

        localStorage.setItem("carrinho", JSON.stringify(carrinho));

        atualizarCarrinho();

        if (toastCarrinho) {
            toastCarrinho.show();
        }

    });

}

//Atualizar o badge
function atualizarCarrinho() {

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    const badge = document.querySelector("#badgeCarrinho");

    if (badge) {

        let quantidadeTotal = 0;

        carrinho.forEach(function (produto) {
            quantidadeTotal += produto.quantidade;
        });

        badge.textContent = quantidadeTotal;
    }
}

atualizarCarrinho();


//Mostrar carrinho
function mostrarCarrinho() {

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    const listaCarrinho = document.querySelector("#listaCarrinho");

    if (!listaCarrinho) return;

    listaCarrinho.innerHTML = "";

    if (carrinho.length === 0) {

        listaCarrinho.innerHTML = `
        <div class="text-center p-4">

            <h3>🛒 Seu carrinho está vazio.</h3>

        </div>
    `;

        return;
    }

    carrinho.forEach(function (produto) {

        listaCarrinho.innerHTML += `

            <div class="item">

                <img src="${produto.imagem}"
                    alt="${produto.nome}"
                    width="90">

                <div class="info-item">

                    <h3>${produto.nome}</h3>

                    <span>
                        R$ ${produto.preco.toFixed(2).replace(".", ",")}
                    </span>

                </div>

                <div class="qtd">

                    <label>Qtd.</label>

                    <input type="number"
                        class="input-quantidade"
                        data-id="${produto.id}"
                        value="${produto.quantidade}"
                        min="1">

                    <button class="btn btn-danger btn-sm btn-remover" data-id="${produto.id}" title="Remover produto">
                        &times;
                    </button>

                </div>

            </div>

        `;

    });
    ativarCamposQuantidade();
}

mostrarCarrinho();



//Atualizar resumo do carrinho
function atualizarResumoCarrinho() {

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    let quantidadeTotal = 0;
    let subtotal = 0;

    carrinho.forEach(function (produto) {

        quantidadeTotal += produto.quantidade;

        subtotal += produto.preco * produto.quantidade;

    });

    const quantidade = document.querySelector("#quantidadeCarrinho");
    const subtotalElemento = document.querySelector("#subtotalCarrinho");
    const total = document.querySelector("#totalCarrinho");

    if (quantidade) {
        quantidade.textContent = quantidadeTotal;
    }

    if (subtotalElemento) {
        subtotalElemento.textContent =
            "R$ " + subtotal.toFixed(2).replace(".", ",");
    }

    if (total) {
        total.textContent =
            "R$ " + subtotal.toFixed(2).replace(".", ",");
    }

}

atualizarResumoCarrinho();


function ativarCamposQuantidade() {

    const camposQuantidade = document.querySelectorAll(".input-quantidade");

    camposQuantidade.forEach(function (campo) {

        campo.addEventListener("change", function () {

            const id = Number(campo.dataset.id);

            const novaQuantidade = Number(campo.value);

            let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

            const produto = carrinho.find(function (p) {
                return p.id === id;
            });

            if (produto) {

                if (novaQuantidade === 0) {

                    carrinho = carrinho.filter(function (p) {
                        return p.id !== id;
                    });

                } else {

                    produto.quantidade = novaQuantidade;

                }

            }

            localStorage.setItem("carrinho", JSON.stringify(carrinho));

            atualizarCarrinho();

            atualizarResumoCarrinho();

        });

    });

}


//Remover produto do carrinho
const botoesRemover = document.querySelectorAll(".btn-remover");

botoesRemover.forEach(function (botao) {

    botao.addEventListener("click", function () {

        const id = Number(botao.dataset.id);

        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        carrinho = carrinho.filter(function (produto) {
            return produto.id !== id;
        });

        localStorage.setItem("carrinho", JSON.stringify(carrinho));

        location.reload();

    });

});


//FINALIZAR PEDIDO
const btnFinalizar = document.querySelector("#btnFinalizar");

if (btnFinalizar) {

    btnFinalizar.addEventListener("click", function (e) {

        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        if (carrinho.length === 0) {

            e.preventDefault();

            const modalCarrinhoVazio = new bootstrap.Modal(
                document.getElementById("modalCarrinhoVazio")
            );
            modalCarrinhoVazio.show();

            return;

        }

        localStorage.setItem("pedidoFinalizado", JSON.stringify(carrinho));

    });

}


