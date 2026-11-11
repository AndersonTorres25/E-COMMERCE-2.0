

const API_BASE = "https://ppw-1-tads.vercel.app";

async function requisicaoAPI(endpoint, opcoes = {}) {
    const resposta = await fetch(API_BASE + endpoint, opcoes);
    const dados = await resposta.json();

     if (!resposta.ok || dados.sucesso === false) {
            const erro = new Error(
            dados.mensagem || "Erro HTTP: " + resposta.status
        );

        erro.status = resposta.status;

        throw erro;
    }

    return dados;
}

// Cria o modal de notificações automaticamente
const elementoNotificacao = document.createElement("div");

elementoNotificacao.id = "modalNotificacao";
elementoNotificacao.className = "modal fade";
elementoNotificacao.tabIndex = -1;
elementoNotificacao.setAttribute("aria-hidden", "true");
elementoNotificacao.hidden = true;

elementoNotificacao.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="tituloNotificacao">
                    Notificação
                </h5>

                <button type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Fechar">
                </button>
            </div>

            <div class="modal-body">
                <p id="mensagemNotificacao" class="mb-0"></p>
            </div>

            <div class="modal-footer">

                <button type="button"
                    id="btnCancelarNotificacao"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal"
                    hidden>
                    Não
                </button>

                <button type="button"
                    id="btnConfirmarNotificacao"
                    class="btn btn-success"
                    hidden>
                    Sim, confirmar
                </button>

                <button type="button"
                    id="btnFecharNotificacao"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">
                    Entendi
                </button>

            </div>

        </div>
    </div>
`;

document.body.appendChild(elementoNotificacao);

// Inicializa o modal Bootstrap
let modalNotificacao = null;

if (typeof bootstrap !== "undefined") {
    modalNotificacao = new bootstrap.Modal(elementoNotificacao);
}

const tituloNotificacao = document.querySelector("#tituloNotificacao");

const mensagemNotificacao = document.querySelector("#mensagemNotificacao");

const btnCancelarNotificacao = document.querySelector("#btnCancelarNotificacao");

const btnConfirmarNotificacao = document.querySelector("#btnConfirmarNotificacao");

const btnFecharNotificacao = document.querySelector("#btnFecharNotificacao");

// Controla o resultado das confirmações
let resolverNotificacao = null;
let resultadoNotificacao = false;

// Exibe uma notificação simples
function mostrarNotificacao(mensagem, tipo = "info") {

    const configuracoes = {
        sucesso: {
            titulo: "Sucesso!",
            cabecalho: "bg-success text-white",
            botao: "btn-success"
        },
        erro: {
            titulo: "Erro!",
            cabecalho: "bg-danger text-white",
            botao: "btn-danger"
        },
        info: {
            titulo: "Informação",
            cabecalho: "bg-primary text-white",
            botao: "btn-primary"
        },
        aviso: {
            titulo: "Atenção!",
            cabecalho: "bg-warning text-dark",
            botao: "btn-warning"
        }
    };

    const configuracao = configuracoes[tipo] || configuracoes.info;

    tituloNotificacao.textContent = configuracao.titulo;
    const cabecalhoNotificacao = elementoNotificacao.querySelector(".modal-header");
    cabecalhoNotificacao.className = "modal-header " + configuracao.cabecalho;
    mensagemNotificacao.textContent = mensagem;

    btnFecharNotificacao.hidden = false;
    btnCancelarNotificacao.hidden = true;
    btnConfirmarNotificacao.hidden = true;

    elementoNotificacao.hidden = false;

    modalNotificacao.show();
}

// Exibe uma confirmação com Sim e Não
function confirmarAcao(mensagem) {

    return new Promise(function (resolve) {

        resolverNotificacao = resolve;
        resultadoNotificacao = false;

        tituloNotificacao.textContent = "Confirmar ação";
        mensagemNotificacao.textContent = mensagem;

        btnFecharNotificacao.hidden = true;
        btnCancelarNotificacao.hidden = false;
        btnConfirmarNotificacao.hidden = false;

        elementoNotificacao.hidden = false;

        modalNotificacao.show();

    });
}

// Botão Sim
btnConfirmarNotificacao.addEventListener("click", function () {

    resultadoNotificacao = true;
    modalNotificacao.hide();

});

// Botão Não
btnCancelarNotificacao.addEventListener("click", function () {

    resultadoNotificacao = false;
    modalNotificacao.hide();

});

// Finaliza a confirmação quando o modal fecha
elementoNotificacao.addEventListener(
    "hidden.bs.modal",
    function () {

        elementoNotificacao.hidden = true;

        if (resolverNotificacao) {

            resolverNotificacao(resultadoNotificacao);
            resolverNotificacao = null;
        }
    }
);

// LOGIN do usuário
const formulario = document.querySelector("#form-login");

if (formulario) {
    formulario.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.querySelector("#email").value;
        const senha = document.querySelector("#senha").value;

        try {
            const dados = await requisicaoAPI("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });
            console.log("Resposta da API:", dados);

            if (dados.sucesso === false || !dados.usuario) {
                const erro = new Error(
                    dados.mensagem || "E-mail ou senha inválidos."
                );

                erro.status = 401;
                throw erro;
            }

            localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

            const loginSucesso = document.querySelector("#loginSucesso");

            if(loginSucesso) {
                document.querySelector("#loginSucesso").textContent = "✅ " + dados.mensagem;
            }

            const modal = new bootstrap.Modal(document.getElementById("modalSucesso"));
            modal.show();
            

            setTimeout(function () { window.location.href = "../index.html"; }, 3000);

        } catch (erro) {
            console.error("Erro no login:", erro);
            mostrarNotificacao("Erro " + erro.status + " - " + erro.message, "erro");
        }
    });
}

// Atualiza o navbar
function atualizarNavbar() {

    const dados = localStorage.getItem("usuarioLogado");

    if (!dados) return;

    const usuario = JSON.parse(dados);

    const nomeUsuario = document.querySelector("#nomeUsuario");
    const menuLogin = document.querySelector("#menuLogin");
    const menuCadastro = document.querySelector("#menuCadastro");
    const menuPerfil = document.querySelector("#menuPerfil");
    const menuPedidos = document.querySelector("#menuPedidos");
    const menuSair = document.querySelector("#menuSair");

    if (!nomeUsuario) return;

    nomeUsuario.textContent = usuario.nome;

    if (menuLogin) menuLogin.style.display = "none";
    if (menuCadastro) menuCadastro.style.display = "none";
    if (menuPerfil) menuPerfil.style.display = "block";
    if (menuPedidos) menuPedidos.style.display = "block";
    if (menuSair) menuSair.style.display = "block";

}

atualizarNavbar();

//botão  sair da conta de usuário
const btnSair = document.querySelector("#btnSair");

if (btnSair) {

    btnSair.addEventListener("click", function (e) {

        e.preventDefault();

        localStorage.removeItem("usuarioLogado");

        const linkInicio = document.querySelector(".navbar-brand");

        if (linkInicio) {
            window.location.href = linkInicio.href;
        } else {
            window.location.href = "../index.html";
        }
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

    formularioCadastro.addEventListener("submit", async function (e) {

        e.preventDefault();

        const nome = document.querySelector("#nome").value;
        const email = document.querySelector("#email").value;
        const senha = document.querySelector("#senha").value;
        const confirmarSenha = document.querySelector("#confirmarSenha").value;

        try {

            const dados = await requisicaoAPI("/api/register", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha,
                    confirmacaoSenha: confirmarSenha
                })
            });

            const cadastroSucesso = document.getElementById("cadastroSucesso");
            if(cadastroSucesso){
                document.getElementById("cadastroSucesso").textContent = "✅" + dados.mensagem;
            }

            const modal = new bootstrap.Modal(document.getElementById("modalCadastro"));
            modal.show();
            
            formularioCadastro.reset();

            setTimeout(function () { window.location.href = "login.html";}, 2000);

        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            mostrarNotificacao("Erro " + erro.status + " - " + erro.message, "erro");
        }
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

let produtos = [];

//Lista de produtos carregados da API
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

                            <button class="btn btn-success btn-adicionar"
                                data-id="${produto.id}"
                                ${produto.stock === 0 ? "disabled" : ""}>
                                ${produto.stock === 0 ? "Esgotado" : "Adicionar ao carrinho"}
                            </button>

                        </div>

                    </div>

                </div>

            `;

        });

        } catch (erro) {

        console.error("Erro ao carregar produtos:", erro);

        mostrarNotificacao("Erro " + erro.status + " - " + erro.message,"erro");
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
                                data-id="${produto.id}"
                                ${produto.stock === 0 ? "disabled" : ""}>
                                ${produto.stock === 0 ? "Esgotado" : "Adicionar ao carrinho"}
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

        mostrarNotificacao("Erro " + erro.status + " - " + erro.message, "erro");
    }
}

// Busca ao enviar o formulário
if (formBusca && campoBusca && filtroCategoria) {

    formBusca.addEventListener("submit", function (e) {

        e.preventDefault();

        clearTimeout(temporizadorBusca);

        buscarProdutos();
    });

    // Debounce
    campoBusca.addEventListener("input", function () {

        clearTimeout(temporizadorBusca);

        temporizadorBusca = setTimeout(function () {
            buscarProdutos();
        }, 500);
    });

    // Filtra a categoria
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

function formatarMoeda(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
}

// Atualizar resumo do carrinho
let freteSelecionado = 0;

// Guarda o CEP para o qual o frete foi calculado e selecionado
let cepAplicado = null;

// Controla as requisições de frete para evitar respostas fora de ordem
let requisicaoFrete = 0;

let cupomAplicado = null;

const campoCupom = document.querySelector("#codigoCupom");
const btnAplicarCupom = document.querySelector("#btnAplicarCupom");
const mensagemCupom = document.querySelector("#mensagemCupom");
const valorDesconto = document.querySelector("#valorDesconto");
const btnRemoverCupom = document.querySelector("#btnRemoverCupom");

function atualizarBotaoRemoverCupom() {

    if (btnRemoverCupom) {
        btnRemoverCupom.hidden = !cupomAplicado;
    }
}

atualizarBotaoRemoverCupom();

const campoCEP = document.querySelector("#cep");
const btnCalcularFrete = document.querySelector("#btnCalcularFrete");
const opcoesFrete = document.querySelector("#opcoesFrete");
const valorFrete = document.querySelector("#valorFrete");
const btnRemoverFrete = document.querySelector("#btnRemoverFrete");

// Controla a exibição do botão Remover Frete
function atualizarBotaoRemoverFrete() {

    if (btnRemoverFrete) {
        btnRemoverFrete.hidden = cepAplicado === null;
    }
}

// Esconde o botão assim que a página é carregada
atualizarBotaoRemoverFrete();

// Invalida o frete quando o cliente altera o CEP
if (campoCEP) {

    campoCEP.addEventListener("input", function () {

        const cepAtual = this.value.replace(/\D/g, "");

        if (cepAplicado !== null && cepAtual !== cepAplicado.replace(/\D/g, "")) {

            freteSelecionado = 0;
            cepAplicado = null;

            requisicaoFrete++;

            opcoesFrete.innerHTML = "";
            valorFrete.textContent = formatarMoeda(0);

            atualizarBotaoRemoverFrete();
            atualizarResumoCarrinho();
        }
    });
}


// ENDEREÇO DE ENTREGA NO CARRINHO
const selectEnderecoEntrega = document.querySelector("#enderecoEntrega");
const detalhesEnderecoEntrega = document.querySelector("#detalhesEnderecoEntrega");

if (selectEnderecoEntrega) {

    const dadosUsuarioCarrinho = localStorage.getItem("usuarioLogado");

    // Verifica se existe usuário conectado
    if (!dadosUsuarioCarrinho) {

        selectEnderecoEntrega.innerHTML = `
            <option value="">Faça login para selecionar um endereço</option>
        `;

        selectEnderecoEntrega.disabled = true;

        detalhesEnderecoEntrega.textContent = "Faça login para visualizar seus endereços.";

    } else {

        const usuarioCarrinho = JSON.parse(dadosUsuarioCarrinho);

        // Recupera os endereços cadastrados para esse usuário
        const chaveEnderecosCarrinho = "enderecos_" + usuarioCarrinho.email.toLowerCase();

        const enderecosCarrinho = JSON.parse(localStorage.getItem(chaveEnderecosCarrinho)) || [];

        // Verifica se existem endereços cadastrados
        if (enderecosCarrinho.length === 0) {

            selectEnderecoEntrega.innerHTML = `
                <option value="">Nenhum endereço cadastrado</option>
            `;

            detalhesEnderecoEntrega.textContent = "Você ainda não possui endereços cadastrados. Cadastre um endereço para continuar.";

        } else {

            // Adiciona os endereços ao campo de seleção
            enderecosCarrinho.forEach(function (endereco) {

                const opcao = document.createElement("option");

                opcao.value = endereco.id;

                opcao.textContent =
                    endereco.rua + ", nº " + endereco.numero +
                    " - " + endereco.cidadeEstado;

                selectEnderecoEntrega.appendChild(opcao);

            });

            // Quando o cliente seleciona um endereço
            selectEnderecoEntrega.addEventListener("change", function () {

                const enderecoSelecionado = enderecosCarrinho.find(function (endereco) {

                    return String(endereco.id) === this.value;

                }, this);

                if (!enderecoSelecionado) {

                    detalhesEnderecoEntrega.textContent = "Selecione um endereço para visualizar os dados de entrega.";

                    campoCEP.value = "";

                    campoCEP.dispatchEvent(new Event("input"));

                    return;
                }

                // Limpa os detalhes anteriores
                detalhesEnderecoEntrega.innerHTML = "";

                // Cria os dados do endereço
                const paragrafoRua = document.createElement("p");
                paragrafoRua.textContent =
                    "Endereço: " + enderecoSelecionado.rua +
                    ", nº " + enderecoSelecionado.numero;

                const paragrafoCEP = document.createElement("p");
                paragrafoCEP.textContent =
                    "CEP: " + enderecoSelecionado.cep;

                const paragrafoCidade = document.createElement("p");
                paragrafoCidade.textContent =
                    "Cidade/Estado: " + enderecoSelecionado.cidadeEstado;

                // Exibe os dados na página
                detalhesEnderecoEntrega.appendChild(paragrafoRua);
                detalhesEnderecoEntrega.appendChild(paragrafoCEP);
                detalhesEnderecoEntrega.appendChild(paragrafoCidade);

                // Preenche automaticamente o CEP para calcular o frete
                campoCEP.value = enderecoSelecionado.cep;

                // Avisa ao sistema que o CEP foi alterado
                campoCEP.dispatchEvent(new Event("input"));

            });

        }
    }
}


function atualizarResumoCarrinho() {

    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    let quantidadeTotal = 0;
    let subtotal = 0;

    carrinho.forEach(function (produto) {
        quantidadeTotal += produto.quantidade;
        subtotal += produto.preco * produto.quantidade;
    });

    const quantidadeElemento = document.querySelector("#quantidadeCarrinho");
    const subtotalElemento = document.querySelector("#subtotalCarrinho");
    const totalElemento = document.querySelector("#totalCarrinho");

    if (quantidadeElemento) {
        quantidadeElemento.textContent = quantidadeTotal;
    }

    let freteAtual = freteSelecionado;

    if (cupomAplicado && cupomAplicado.tipo === "frete_gratis") {
        freteAtual = 0;
    }

    let desconto = 0;

    if (cupomAplicado) {

        if (cupomAplicado.tipo === "percentual") {
            desconto = subtotal * (cupomAplicado.desconto / 100);

        } else if (cupomAplicado.tipo === "fixo") {
            desconto = cupomAplicado.desconto;
        }
    }

    desconto = Math.min(desconto, subtotal);

    const valorTotal = Number((subtotal - desconto + freteAtual).toFixed(2));

    if (subtotalElemento) {
        subtotalElemento.textContent = formatarMoeda(subtotal);
    }

    if (valorFrete) {
        valorFrete.textContent = formatarMoeda(freteAtual);
    }

    if (valorDesconto) {
        valorDesconto.textContent = formatarMoeda(desconto);
    }

    if (totalElemento) {
        totalElemento.textContent = formatarMoeda(valorTotal);
    }
}

atualizarResumoCarrinho();

// APLICAR CUPOM DE DESCONTO
if (btnAplicarCupom) {

    btnAplicarCupom.addEventListener("click", async function () {

        const codigo = campoCupom.value.trim().toUpperCase();

        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        let subtotal = 0;

        carrinho.forEach(function (produto) {
            subtotal += produto.preco * produto.quantidade;
        });

        // Verifica se o carrinho está vazio
        if (carrinho.length === 0) {

            mensagemCupom.textContent = "Adicione produtos ao carrinho antes de aplicar um cupom.";
            mensagemCupom.className = "mt-2 text-warning";

            return;
        }

        const corpo = {
            codigo: codigo
        };

        if (codigo === "VIP50") {
            corpo.subtotal = subtotal;
        }

        try {

            const dados = await requisicaoAPI("/api/cupom", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(corpo)

            });

            cupomAplicado = dados.cupom;

            console.log("Cupom retornado pela API:", dados.cupom);
            console.log("Subtotal do carrinho:", subtotal);

            atualizarResumoCarrinho();
            atualizarBotaoRemoverCupom();

            mensagemCupom.textContent = dados.mensagem;
            mensagemCupom.className = "mt-2 text-success";

        } catch (erro) {

            console.error("Erro ao aplicar cupom:", erro);

            cupomAplicado = null;

            atualizarResumoCarrinho();

            mensagemCupom.textContent = "Erro " + erro.status + " - " + erro.message;
            mensagemCupom.className = "mt-2 text-danger";

        }
    });
}

// REMOVER CUPOM DE DESCONTO
if (btnRemoverCupom) {

    btnRemoverCupom.addEventListener("click", function () {

        // Verifica se existe algum cupom aplicado
        if (!cupomAplicado) {

            mensagemCupom.textContent = "Não há nenhum cupom aplicado para remover.";
            mensagemCupom.className = "mt-2 text-warning";

            return;
        }

        cupomAplicado = null;
        atualizarBotaoRemoverCupom();

        campoCupom.value = "";

        mensagemCupom.textContent = "Cupom removido com sucesso.";
        mensagemCupom.className = "mt-2 text-success";

        atualizarResumoCarrinho();
    });
}

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


// FORMAS DE PAGAMENTO
const opcoesPagamento = document.querySelectorAll('input[name="metodoPagamento"]');

const campoNumeroCartao = document.querySelector("#campoNumeroCartao");
const numeroCartao = document.querySelector("#numeroCartao");

opcoesPagamento.forEach(function (opcao) {

    opcao.addEventListener("change", function () {

        if (this.value === "cartao") {

            campoNumeroCartao.style.display = "block";

        } else {

            campoNumeroCartao.style.display = "none";
            numeroCartao.value = "";
        }
    });
});

// FINALIZAR PEDIDO / CHECKOUT
const btnFinalizar = document.querySelector("#btnFinalizar");

if (btnFinalizar) {

    btnFinalizar.addEventListener("click", async function (e) {

        e.preventDefault();

        // Verifica se existe usuário logado
        const dadosUsuario = localStorage.getItem("usuarioLogado");

        if (!dadosUsuario) {

            mostrarNotificacao("Você precisa entrar na sua conta para finalizar o pedido.", "aviso");

            elementoNotificacao.addEventListener("hidden.bs.modal", function redirecionar() {

                elementoNotificacao.removeEventListener("hidden.bs.modal", redirecionar);

                const linkLogin = document.querySelector("#menuLogin a");

                if (linkLogin) {
                    window.location.href = linkLogin.href;
                }
            });

            return;
        }

        // Recupera os produtos do carrinho
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        // VERIFICA SE O CARRINHO ESTÁ VAZIO
        if (carrinho.length === 0) {
            btnFinalizar.disabled = true;
            btnFinalizar.textContent = "Processando pedido...";
            try {
                // Envia o carrinho vazio para a API
                await requisicaoAPI("/api/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        itens: []
                    })
                });

            } catch (erro) {
                console.error("Erro ao finalizar pedido:", erro);
                const carrinhoVazio = document.querySelector("#carrinhoVazio");
                if (carrinhoVazio && erro.status === 400) {
                    carrinhoVazio.textContent = "Erro " + erro.status + " - " + erro.message;
                    const modal = new bootstrap.Modal(
                        document.getElementById("modalCarrinhoVazio")
                    );
                    modal.show();
                } else { mostrarNotificacao("Erro " + erro.status + " - " + erro.message, "erro");
                }
            } finally {
                btnFinalizar.disabled = false;
                btnFinalizar.textContent = "Finalizar Pedido";
            }
            return;
        }

        
        // VALIDA O ENDEREÇO DE ENTREGA
        const usuarioCheckout = JSON.parse(dadosUsuario);

        // Recupera os endereços cadastrados para o usuário
        const chaveEnderecosCheckout = "enderecos_" + usuarioCheckout.email.toLowerCase();

        const enderecosCheckout = JSON.parse(localStorage.getItem(chaveEnderecosCheckout)) || [];

        // Recupera o endereço selecionado no carrinho
        const idEndereco = selectEnderecoEntrega
            ? selectEnderecoEntrega.value
            : "";

        // Localiza o endereço correspondente
        const enderecoSelecionado = enderecosCheckout.find(function (endereco) {
            return String(endereco.id) === idEndereco;
        });

        // Verifica se um endereço foi selecionado
        if (!enderecoSelecionado) {

            mostrarNotificacao("Selecione um endereço de entrega válido antes de finalizar o pedido.", "aviso");
            return;
        }

        // Confere se o CEP corresponde ao endereço selecionado
        const cepEndereco = String(enderecoSelecionado.cep).replace(/\D/g, "");
        const cepInformado = campoCEP.value.replace(/\D/g, "");

        if (cepEndereco !== cepInformado) {

            mostrarNotificacao("O CEP informado não corresponde ao endereço selecionado. Selecione novamente o endereço.", "aviso");
            return;
        }

        // Verifica o CEP informado
        const cepDigitado = campoCEP.value.trim();
        const cepNumeros = cepDigitado.replace(/\D/g, "");
        const cep = cepNumeros.replace(/^(\d{5})(\d{3})$/, "$1-$2");

        // Verifica se existe uma opção de frete selecionada
        const freteMarcado = document.querySelector('input[name="frete"]:checked');

        // Verifica se o CEP possui o formato esperado pela API
        const cepValido = /^\d{5}-\d{3}$/.test(cep);

        if (cepValido && (!freteMarcado || cepAplicado !== cep)) {

            mostrarNotificacao("Calcule e selecione uma opção de frete para o CEP informado.", "aviso");

            return;
        }

        // Verifica a forma de pagamento
        const pagamentoSelecionado = document.querySelector('input[name="metodoPagamento"]:checked');

        const metodoPagamento = pagamentoSelecionado ? pagamentoSelecionado.value : "";

        //  Prepara os dados do pedido
        const corpo = {

            itens: carrinho.map(function (produto) {
                return {
                    id: produto.id,
                    quantidade: produto.quantidade
                };
            }),

            cep: cep,

            metodoPagamento: metodoPagamento

        };

        // Se for cartão, acrescenta o número
        if (metodoPagamento === "cartao") {

            const cartao = numeroCartao.value.trim();

            corpo.numeroCartao = cartao;
        }

        // Evita cliques repetidos durante a requisição
        btnFinalizar.disabled = true;
        btnFinalizar.textContent = "Processando pedido...";

        try {

            // Envia o pedido para a API
            const dados = await requisicaoAPI("/api/checkout", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(corpo)

            });

            let subtotal = 0;

            carrinho.forEach(function (produto) {
                subtotal += produto.preco * produto.quantidade;
            });

            // Calcula o desconto do cupom
            let desconto = 0;

            if (cupomAplicado) {

                if (cupomAplicado.tipo === "percentual") {
                    desconto = subtotal * (cupomAplicado.desconto / 100);

                } else if (cupomAplicado.tipo === "fixo") {
                    desconto = cupomAplicado.desconto;
                }
            }

            desconto = Math.min(desconto, subtotal);

            // Calcula o frete
            let frete = freteSelecionado;

            if (cupomAplicado && cupomAplicado.tipo === "frete_gratis") {
                frete = 0;
            }

            // Calcula o total
            const totalFinal = Number(
                (subtotal - desconto + frete).toFixed(2)
            );


            // Guarda o pedido, os produtos e os valores calculados
            const pedidoSalvo = {
                ...dados.pedido,

                // Salva os produtos comprados
                itens: carrinho.map(function (produto) {
                    return {
                        id: produto.id,
                        nome: produto.nome,
                        preco: produto.preco,
                        imagem: produto.imagem,
                        quantidade: produto.quantidade
                    };
                }),

                enderecoEntrega: {
                    rua: enderecoSelecionado.rua,
                    numero: enderecoSelecionado.numero,
                    cep: enderecoSelecionado.cep,
                    cidadeEstado: enderecoSelecionado.cidadeEstado
                },

                subtotal: subtotal,
                desconto: desconto,
                frete: frete,
                totalFinal: totalFinal
            };

            const usuario = JSON.parse(dadosUsuario);

            const chavePedidos = "pedidos_" + usuario.email.toLowerCase();

            const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

            pedidos.push(pedidoSalvo);

            localStorage.setItem(chavePedidos, JSON.stringify(pedidos));

            localStorage.removeItem("carrinho");

            mostrarNotificacao( dados.mensagem, "sucesso");

            setTimeout(function () {
                window.location.href = "sucesso-pedido.html";
            }, 2000);


        } catch (erro) {
            console.error("Erro ao finalizar pedido:", erro);
            mostrarNotificacao("Erro " + erro.status + " - " + erro.message, "erro" );
            btnFinalizar.disabled = false;
            btnFinalizar.textContent = "Finalizar Pedido";
        }
    });
}

// CÁLCULO DO FRETE
if (btnCalcularFrete) {

    btnCalcularFrete.addEventListener("click", async function () {

        // Verifica se o carrinho está vazio
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        if (carrinho.length === 0) {

            mostrarNotificacao("Adicione produtos ao carrinho antes de calcular o frete.", "aviso");

            return;
        }
        const minhaRequisicao = ++requisicaoFrete;

        freteSelecionado = 0;
        cepAplicado = null;

        opcoesFrete.innerHTML = "";
        valorFrete.textContent = formatarMoeda(0);

        atualizarBotaoRemoverFrete();
        atualizarResumoCarrinho();

        const cep = campoCEP.value.replace(/\D/g, "");

        const cepFormatado = cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");

        try {
            const dados = await requisicaoAPI("/api/frete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cep: cepFormatado
                })
            });

            if (!dados.fretes || dados.fretes.length === 0) {

                mostrarNotificacao("Nenhuma opção de frete disponível para este CEP.", "aviso");
                return;
            }

            opcoesFrete.innerHTML = "";

            dados.fretes.forEach(function (frete, indice) {

                opcoesFrete.innerHTML += `

                    <div class="form-check border rounded p-3 mb-2">

                        <input
                            class="form-check-input"
                            type="radio"
                            name="frete"
                            id="frete${indice}"
                            value="${indice}"
                        >

                        <label class="form-check-label" for="frete${indice}">

                            <strong>${frete.servico}</strong>

                            <br>

                            Valor: R$ ${Number(frete.valor).toFixed(2).replace(".", ",")}

                            <br>

                            Prazo: ${frete.prazo}

                        </label>

                    </div>

                `;

            });

            // Recupera os botões de seleção de frete
            const radiosFrete = document.querySelectorAll('input[name="frete"]');

            radiosFrete.forEach(function (radio) {

                radio.addEventListener("change", function () {

                    const indice = Number(this.value);

                    const freteEscolhido = dados.fretes[indice];

                    // Guarda o valor e o CEP correspondente
                    freteSelecionado = Number(freteEscolhido.valor);
                    cepAplicado = cepFormatado;

                    atualizarResumoCarrinho();
                    atualizarBotaoRemoverFrete();
                });
            });

        } catch (erro) {
            // Ignora a resposta se uma requisição mais recente já começou
            if (minhaRequisicao !== requisicaoFrete) {
                return;
            }
            console.error("Erro ao calcular frete:", erro);
            mostrarNotificacao("Erro " + erro.status + " - " + erro.message, "erro");
        }
    });
}

// Remover frete selecionado
if (btnRemoverFrete) {

    btnRemoverFrete.addEventListener("click", function () {

        freteSelecionado = 0;
        cepAplicado = null;

        // Invalida possíveis requisições em andamento
        requisicaoFrete++;

        document.querySelectorAll('input[name="frete"]').forEach(function (radio) {
            radio.checked = false;
        });

        opcoesFrete.innerHTML = "";

        valorFrete.textContent = formatarMoeda(0);

        atualizarBotaoRemoverFrete();

        atualizarResumoCarrinho();
    });
}

// EXIBIR DADOS DO PEDIDO FINALIZADO
const numeroPedido = document.querySelector("#numero-pedido");

if (numeroPedido) {

    // Recupera os dados do usuário conectado
    const dadosUsuario = localStorage.getItem("usuarioLogado");

    if (!dadosUsuario) {

        document.querySelector(".dados-pedido").textContent = "Não foi possível identificar o usuário.";

    } else {

        const usuario = JSON.parse(dadosUsuario);

        // Identifica a chave de pedidos desse usuário
        const chavePedidos = "pedidos_" + usuario.email.toLowerCase();

        const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

        // Recupera o pedido mais recente
        const pedido = pedidos[pedidos.length - 1];

        if (pedido) {

            document.querySelector("#numero-pedido").textContent = pedido.protocolo || "Não informado";

            document.querySelector("#status-pedido").textContent = pedido.status || "Não informado";

            document.querySelector("#cep-pedido").textContent = pedido.cep || "Não informado";

            document.querySelector("#pagamento-pedido").textContent = (pedido.metodoPagamento || "Não informado").toUpperCase();

            document.querySelector("#quantidade-pedido").textContent = pedido.totalItens ?? "Não informado";

            document.querySelector("#subtotal-pedido").textContent = formatarMoeda(Number(pedido.subtotal) || 0);

            document.querySelector("#desconto-pedido").textContent = formatarMoeda(Number(pedido.desconto) || 0);

            document.querySelector("#frete-pedido").textContent = formatarMoeda(Number(pedido.frete) || 0);

            document.querySelector("#total-pedido").textContent = formatarMoeda(Number(pedido.totalFinal) || 0);

        } else {

            document.querySelector(".dados-pedido").textContent = "Nenhum pedido encontrado.";
        }
    }
}

// MEUS PEDIDOS
const listaPedidos = document.querySelector("#listaPedidos");
const mensagemSemPedidos = document.querySelector("#mensagemSemPedidos");

if (listaPedidos) {

    // Verifica se existe um usuário conectado
    if (!dadosUsuario) {

        listaPedidos.innerHTML = `
            <div class="text-center">
                <p>Faça login para consultar seus pedidos.</p>
            </div>
        `;

    } else {

        const usuario = JSON.parse(dadosUsuario);

        const chavePedidos = "pedidos_" + usuario.email.toLowerCase();

        const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

        if (pedidos.length === 0) {

            mensagemSemPedidos.style.display = "block";

        } else {

            pedidos.forEach(function (pedido) {

                const possuiValores = pedido.totalFinal !== undefined || pedido.subtotal !== undefined;

                const subtotal = Number(pedido.subtotal) || 0;
                const desconto = Number(pedido.desconto) || 0;
                const frete = Number(pedido.frete) || 0;

                const totalPedido = pedido.totalFinal !== undefined
                    ? Number(pedido.totalFinal)
                    : subtotal - desconto + frete;

                const valorExibido = possuiValores && Number.isFinite(totalPedido) ? formatarMoeda(totalPedido) : "Não informado";

                const card = document.createElement("div");

                card.className = "card shadow-sm mb-4";

                card.innerHTML = `
                    <div class="card-body">

                        <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">

                            <h5 class="card-title mb-2">
                                Pedido: ${pedido.protocolo || "Não informado"}
                            </h5>

                            <span class="badge ${
                                String(pedido.status).toLowerCase() === "cancelado"
                                    ? "bg-secondary"
                                    : String(pedido.status).toLowerCase() === "enviado"
                                        ? "bg-primary"
                                        : "bg-success"
                            }">
                                ${pedido.status || "Não informado"}
                            </span>

                        </div>

                        <p class="mb-2">
                            <strong>CEP:</strong> ${pedido.cep || "Não informado"}
                        </p>

                        <p class="mb-2">
                            <strong>Pagamento:</strong>
                            ${(pedido.metodoPagamento || "Não informado").toUpperCase()}
                        </p>

                        <p class="mb-2">
                            <strong>Quantidade de itens:</strong>
                            ${pedido.totalItens ?? "Não informado"}
                        </p>

                        <p class="mb-3">
                            <strong>Valor total:</strong>
                            ${valorExibido}
                        </p>
                        <div class="mt-3 d-flex gap-2 flex-wrap">

                            <a href="pedido.html?id=${encodeURIComponent(pedido.protocolo)}"
                                class="btn btn-outline-success">

                                <i class="bi bi-eye"></i>
                                Visualizar Detalhes
                            </a>

                            ${String(pedido.status).toLowerCase() !== "enviado" &&
                                                String(pedido.status).toLowerCase() !== "cancelado" ? `
                                <button type="button"
                                    class="btn btn-primary btn-marcar-enviado"
                                    data-protocolo="${pedido.protocolo}">

                                    <i class="bi bi-truck"></i>
                                    Marcar como Enviado

                                </button>
                            ` : ""}

                            <button type="button"
                                class="btn ${String(pedido.status).toLowerCase() === "cancelado" ? "btn-secondary" : "btn-outline-danger"} btn-cancelar-pedido"
                                data-protocolo="${pedido.protocolo}"
                                ${String(pedido.status).toLowerCase() === "cancelado" ? "disabled" : ""}>

                                <i class="bi ${String(pedido.status).toLowerCase() === "cancelado" ? "bi-check-circle-fill" : "bi-x-circle"}"></i>

                                ${String(pedido.status).toLowerCase() === "cancelado" ? "Pedido Cancelado" : "Cancelar Pedido"}

                            </button>

                        </div>
                    </div>
                `;

                listaPedidos.appendChild(card);
            });
        }
    }
}

// MARCAR PEDIDO COMO ENVIADO
if (listaPedidos) {

    listaPedidos.addEventListener("click", function (e) {

        const botao = e.target.closest(".btn-marcar-enviado");

        if (!botao) return;

        // Recupera o protocolo do pedido
        const protocolo = botao.dataset.protocolo;

        // Recupera o usuário conectado
        const usuario = JSON.parse(dadosUsuario);

        // Identifica os pedidos dessa conta
        const chavePedidos = "pedidos_" + usuario.email.toLowerCase();

        const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

        // Localiza o pedido
        const pedido = pedidos.find(function (p) {
            return String(p.protocolo) === String(protocolo);
        });

        if (!pedido) return;

        // Impede o envio de um pedido cancelado
        if (String(pedido.status).toLowerCase() === "cancelado") {

            mostrarNotificacao("Não é possível enviar um pedido que já foi cancelado.", "aviso");

            botao.remove();

            return;
        }
        // Atualiza o status
        pedido.status = "ENVIADO";

        // Salva a alteração
        localStorage.setItem(chavePedidos, JSON.stringify(pedidos));

        // Atualiza a etiqueta de status
        const cardPedido = botao.closest(".card");

        if (cardPedido) {

            const etiquetaStatus = cardPedido.querySelector(".badge");

            if (etiquetaStatus) {
                  etiquetaStatus.textContent = "ENVIADO";
                  etiquetaStatus.className = "badge bg-primary";
            }

        }

        // Remove o botão Marcar como Enviado
        botao.remove();
        mostrarNotificacao("Pedido marcado como enviado com sucesso.", "sucesso");
    });
}

// CANCELAR PEDIDO
if (listaPedidos) {
    listaPedidos.addEventListener("click", async function (e) {

        const botao = e.target.closest(".btn-cancelar-pedido");

        if (!botao) return;

        const protocolo = botao.dataset.protocolo;

        const confirmar = await confirmarAcao("Tem certeza de que deseja cancelar este pedido?");

        if (!confirmar) return;

        botao.disabled = true;
        botao.textContent = "Cancelando...";

        try {
            const usuario = JSON.parse(dadosUsuario);

            const chavePedidos = "pedidos_" + usuario.email.toLowerCase();

            const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

            const pedido = pedidos.find(function (p) {
                return String(p.protocolo) === String(protocolo);
            });

            // Verifica se o pedido está marcado como enviado
            const protocoloAPI = pedido && pedido.status.toUpperCase() === "ENVIADO" ? "PED-ENVIADO" : protocolo;

            // Solicita o cancelamento à API
            const dados = await requisicaoAPI(
                "/api/pedido?protocolo=" +
                encodeURIComponent(protocoloAPI),
                { method: "DELETE" }
            );

            // Atualiza o pedido somente se a API confirmar o sucesso
            if (pedido) {
                pedido.status = "cancelado";
            }

            localStorage.setItem(chavePedidos, JSON.stringify(pedidos));

            botao.disabled = true;
            botao.className = "btn btn-secondary";

            botao.innerHTML = `
                <i class="bi bi-check-circle-fill"></i>
                Pedido Cancelado
            `;

            // Atualiza a etiqueta de status
            const cardPedido = botao.closest(".card");

            if (cardPedido) {
                const etiquetaStatus = cardPedido.querySelector(".badge");

                if (etiquetaStatus) {
                    etiquetaStatus.textContent = "cancelado";
                    etiquetaStatus.className = "badge bg-secondary";
                }
                 // Remove o botão Marcar como Enviado
                const botaoEnviar = cardPedido.querySelector(".btn-marcar-enviado");

                if (botaoEnviar) {
                    botaoEnviar.remove();
                }
            }

            mostrarNotificacao(dados.mensagem, "sucesso");

        } catch (erro) {

            console.error("Erro ao cancelar pedido:", erro);

            mostrarNotificacao("Erro " + erro.status + " - " + erro.message, "erro");

            botao.disabled = false;

            botao.innerHTML = `
                <i class="bi bi-x-circle"></i>
                Cancelar Pedido
            `;
        }
    });
}

// DETALHES DO PEDIDO
const detalhesPedido = document.querySelector("#detalhesPedido");

if (detalhesPedido) {

    // Verifica se existe usuário conectado
    if (!dadosUsuario) {

        detalhesPedido.innerHTML = `
            <div class="alert alert-warning">
                Faça login para visualizar os detalhes do pedido.
            </div>
        `;

    } else {

        const usuario = JSON.parse(dadosUsuario);

        // Recupera os pedidos da conta atual
        const chavePedidos = "pedidos_" + usuario.email.toLowerCase();

        const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

        // Recupera o protocolo enviado pela URL
        const parametros = new URLSearchParams(window.location.search);

        const protocolo = parametros.get("id");

        // Localiza o pedido correspondente
        const pedido = pedidos.find(function (p) {
            return String(p.protocolo) === String(protocolo);
        });

        if (!pedido) {

            detalhesPedido.innerHTML = `
                <div class="alert alert-danger">
                    Pedido não encontrado.
                </div>
            `;

        } else {

            // Verifica se o pedido possui produtos salvos
            let listaItens = "";

            if (pedido.itens && pedido.itens.length > 0) {

                pedido.itens.forEach(function (produto) {

                    const subtotalItem = produto.preco * produto.quantidade;

                    listaItens += `
                        <div class="d-flex align-items-center border-bottom py-3 gap-3">

                            <img src="${produto.imagem}"
                                alt="${produto.nome}"
                                width="90"
                                class="img-fluid rounded">

                            <div class="flex-grow-1">

                                <h6>${produto.nome}</h6>

                                <p class="mb-1">
                                    Preço unitário:
                                    ${formatarMoeda(Number(produto.preco))}
                                </p>

                                <p class="mb-1">
                                    Quantidade: ${produto.quantidade}
                                </p>

                                <strong>
                                    Subtotal: ${formatarMoeda(subtotalItem)}
                                </strong>

                            </div>

                        </div>
                    `;

                });

            } else {

                listaItens = `
                    <div class="alert alert-info mt-3">
                        Os detalhes dos produtos não estão disponíveis
                        para este pedido.
                    </div>
                `;

            }

            // Exibe as informações do pedido
            detalhesPedido.innerHTML = `

                <div class="card shadow-sm mb-4">

                    <div class="card-body">

                        <h4 class="mb-3">Informações do pedido</h4>

                        <p>
                            <strong>Protocolo:</strong>
                            ${pedido.protocolo}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${pedido.status || "Não informado"}
                        </p>

                        <p>
                            <strong>CEP:</strong>
                            ${pedido.cep || "Não informado"}
                        </p>

                        <p>
                            <strong>Forma de pagamento:</strong>
                            ${(pedido.metodoPagamento || "Não informado").toUpperCase()}
                        </p>

                        <p>
                            <strong>Quantidade de itens:</strong>
                            ${pedido.totalItens ?? "Não informado"}
                        </p>

                        ${pedido.enderecoEntrega ? `
                            <p>
                                <strong>Endereço de entrega:</strong>
                                ${pedido.enderecoEntrega.rua}, nº ${pedido.enderecoEntrega.numero}
                                - ${pedido.enderecoEntrega.cidadeEstado}
                                (CEP ${pedido.enderecoEntrega.cep})
                            </p>
                        ` : ""}
                        
                    </div>

                </div>

                <div class="card shadow-sm mb-4">

                    <div class="card-body">

                        <h4 class="mb-3">Produtos comprados</h4>

                        ${listaItens}

                    </div>

                </div>

                <div class="card shadow-sm">

                    <div class="card-body">

                        <h4 class="mb-3">Resumo financeiro</h4>

                        <p>
                            <strong>Subtotal:</strong>
                            ${formatarMoeda(Number(pedido.subtotal) || 0)}
                        </p>

                        <p>
                            <strong>Desconto:</strong>
                            ${formatarMoeda(Number(pedido.desconto) || 0)}
                        </p>

                        <p>
                            <strong>Frete:</strong>
                            ${formatarMoeda(Number(pedido.frete) || 0)}
                        </p>

                        <hr>

                        <h4 class="text-success">
                            Total:
                            ${formatarMoeda(Number(pedido.totalFinal) || 0)}
                        </h4>

                    </div>

                </div>

            `;
        }
    }
}

// MEUS DADOS 
const formDados = document.querySelector("#form-dados");

if (formDados) {

    const campoNome = document.querySelector("#campoNome");
    const campoEmail = document.querySelector("#campoEmail");


    // Lê o usuário salvo no login
    const lerUsuario = () => JSON.parse(localStorage.getItem("usuarioLogado"));

    // Monta o corpo da requisição, já sem espaços sobrando
    const montarCorpo = (nome, email) => ({
        nome: nome.trim(),
        email: email.trim()
    });

    const mesclarUsuario = (usuario, novosDados) => ({ ...usuario, ...novosDados });

    function migrarChaves(emailAntigo, emailNovo) {

        ["pedidos_", "enderecos_"].forEach(function (prefixo) {

            const chaveAntiga = prefixo + emailAntigo.toLowerCase();
            const chaveNova = prefixo + emailNovo.toLowerCase();

            if (chaveAntiga === chaveNova) return;

            const valor = localStorage.getItem(chaveAntiga);

            if (valor) {
                localStorage.setItem(chaveNova, valor);
                localStorage.removeItem(chaveAntiga);
            }
        });
    }

    const usuarioAtual = lerUsuario();

    if (usuarioAtual) {
        campoNome.value = usuarioAtual.nome;
        campoEmail.value = usuarioAtual.email;
    } else {
        mostrarNotificacao("Faça login para alterar seus dados.", "aviso");
    }

    formDados.addEventListener("submit", async function (e) {

        e.preventDefault();

        const usuario = lerUsuario();

        if (!usuario) {
            mostrarNotificacao("Faça login para alterar seus dados.", "aviso");
            return;
        }

        try {

            const dados = await requisicaoAPI("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(montarCorpo(campoNome.value, campoEmail.value))
            });

            // A API devolve os dados confirmados em dados.dados
            const usuarioNovo = mesclarUsuario(usuario, dados.dados);

            migrarChaves(usuario.email, usuarioNovo.email);

            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioNovo));

            atualizarNavbar();  

            mostrarNotificacao(dados.mensagem, "sucesso");

        } catch (erro) {

            console.error("Erro ao alterar dados:", erro);
            mostrarNotificacao("Erro " + erro.status + " - " + erro.message, "erro");
        }
    });
}

// MEUS ENDEREÇOS
const listaEnderecos = document.querySelector("#listaEnderecos");

if (listaEnderecos) {

    const mensagemSemEnderecos = document.querySelector("#mensagemSemEnderecos");
    const btnNovoEndereco = document.querySelector("#btnNovoEndereco");
    const formEndereco = document.querySelector("#form-endereco");
    const erroEndereco = document.querySelector("#erroEndereco");
    const modalEnderecoElemento = document.querySelector("#modalEndereco");

    const usuarioEnd = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioEnd) {

        btnNovoEndereco.hidden = true;

        listaEnderecos.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">Faça login para ver seus endereços.</div>
            </div>
        `;

    } else {

        const chaveEnderecos = "enderecos_" + usuarioEnd.email.toLowerCase();

        const lerEnderecos = () => JSON.parse(localStorage.getItem(chaveEnderecos)) || [];

        const salvarEnderecos = (lista) => localStorage.setItem(chaveEnderecos, JSON.stringify(lista));

        // Troca caracteres especiais por texto seguro, já que o usuário digita esses dados
        const escaparHTML = (texto) => String(texto).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));

        const criarCardEndereco = (endereco) => `
            <div class="col-md-6">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">

                        <input type="hidden" class="endereco-id" value="${endereco.id}">

                        <p class="mb-1"><strong>Rua:</strong> ${escaparHTML(endereco.rua)}, nº ${escaparHTML(endereco.numero)}</p>
                        <p class="mb-1"><strong>CEP:</strong> ${escaparHTML(endereco.cep)}</p>
                        <p class="mb-3"><strong>Cidade/Estado:</strong> ${escaparHTML(endereco.cidadeEstado)}</p>

                        <button type="button" class="btn btn-outline-danger btn-sm btn-excluir-endereco">
                            <i class="bi bi-trash"></i> Excluir Endereço
                        </button>

                    </div>
                </div>
            </div>
        `;

        function renderizarEnderecos() {

            const enderecos = lerEnderecos();

            mensagemSemEnderecos.hidden = enderecos.length > 0;

            listaEnderecos.innerHTML = enderecos.map(criarCardEndereco).join("");
        }

        renderizarEnderecos();

        //Cadastrar novo endereço
     /*   formEndereco.addEventListener("submit", function (e) {

            e.preventDefault();

            const rua = document.querySelector("#enderecoRua").value.trim();
            const numero = document.querySelector("#enderecoNumero").value.trim();
            const cep = document.querySelector("#enderecoCep").value.trim();
            const cidadeEstado = document.querySelector("#enderecoCidade").value.trim();

            // Todos os campos são obrigatórios
            if (!rua || !numero || !cep || !cidadeEstado) {
                erroEndereco.textContent = "Preencha todos os campos.";
                erroEndereco.hidden = false;
                return;
            }

            erroEndereco.hidden = true;

            const novoEndereco = { id: Date.now(), rua, numero, cep, cidadeEstado };

            // [...lista, novo] cria uma lista nova com o endereço no final
            salvarEnderecos([...lerEnderecos(), novoEndereco]);

            formEndereco.reset();

            bootstrap.Modal.getInstance(modalEnderecoElemento).hide();

            renderizarEnderecos();
        }); */


        // Cadastrar novo endereço
        formEndereco.addEventListener("submit", function (e) {
            alert("O evento de envio do formulário foi executado! ANTES PREVENT");

            e.preventDefault();
            alert("O evento de envio do formulário foi executado! DEPOIS PREVENT");

            const rua = document.querySelector("#enderecoRua").value.trim();
            const numero = document.querySelector("#enderecoNumero").value.trim();
            const cep = document.querySelector("#enderecoCep").value.trim();
            const cidadeEstado = document.querySelector("#enderecoCidade").value.trim();

            
            if (!rua || !numero || !cep || !cidadeEstado) {
                erroEndereco.textContent = "Preencha todos os campos.";
                erroEndereco.hidden = false;
                return;
            }

            try {

                erroEndereco.hidden = true;

                const novoEndereco = {
                    id: Date.now(),
                    rua: rua,
                    numero: numero,
                    cep: cep,
                    cidadeEstado: cidadeEstado
                };

                // Recupera os endereços e adiciona o novo
                const enderecos = lerEnderecos();

                enderecos.push(novoEndereco);

                // Salva no armazenamento do navegador
                salvarEnderecos(enderecos);

                // Confere se o endereço foi realmente salvo
                const enderecosSalvos = lerEnderecos();

                if (!enderecosSalvos.some(function (endereco) {
                    return endereco.id === novoEndereco.id;
                })) {
                    throw new Error("Não foi possível confirmar o salvamento do endereço.");
                }

                // Atualiza a lista na tela
                renderizarEnderecos();

                // Limpa o formulário
                formEndereco.reset();

                // Fecha o modal
                bootstrap.Modal.getOrCreateInstance(modalEnderecoElemento).hide();

                mostrarNotificacao("Endereço cadastrado com sucesso!", "sucesso");

            } catch (erro) {

                console.error("Erro ao salvar endereço:", erro);

                erroEndereco.textContent = "Não foi possível salvar o endereço. Verifique o armazenamento do navegador e tente novamente.";

                erroEndereco.hidden = false;
            }
        });


        // Limpa o aviso de erro sempre que o modal for aberto
        modalEnderecoElemento.addEventListener("show.bs.modal", () => erroEndereco.hidden = true );

        listaEnderecos.addEventListener("click", async function (e) {

            const botao = e.target.closest(".btn-excluir-endereco");

            if (!botao) return;

            const id = botao.closest(".card").querySelector(".endereco-id").value;

            const confirmou = await confirmarAcao("Deseja excluir este endereço?");

            if (!confirmou) return;

            salvarEnderecos(lerEnderecos().filter((endereco) => String(endereco.id) !== id));

            renderizarEnderecos();
        });
    }
}