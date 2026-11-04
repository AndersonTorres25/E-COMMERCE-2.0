

const API_BASE = "https://ppw-1-tads.vercel.app";

async function requisicaoAPI(endpoint, opcoes = {}) {
    const resposta = await fetch(API_BASE + endpoint, opcoes);
    const dados = await resposta.json();

    if (!resposta.ok) {
        const erro = new Error(
            dados.mensagem || "Erro HTTP: " + resposta.status
        );

        erro.status = resposta.status;

        throw erro;
    }

    return dados;
}

let usuarios = [];

const usuariosSalvos = localStorage.getItem("usuarios");

if (usuariosSalvos) {
    usuarios = JSON.parse(usuariosSalvos);
}

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

            // Salva os dados do usuário logado
            localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

            // Mostra o modal de sucesso
            const modal = new bootstrap.Modal(
                document.getElementById("modalSucesso")
            );

            modal.show();

            // Redireciona para a página inicial
            setTimeout(function () {
                window.location.href = "../index.html";
            }, 3000);

        } catch (erro) {
            console.error("Erro no login:", erro);

            if (erro.status === 401) {
                const modalErro = new bootstrap.Modal(document.getElementById("modalErro"));

                modalErro.show();

            } else {
                alert(erro.message);
            }
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

        // Verifica se as senhas são iguais
        if (senha !== confirmarSenha) {

            const modalSenha = new bootstrap.Modal(
                document.getElementById("modalSenhaDiferente")
            );

            modalSenha.show();
            return;
        }

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

            // Cadastro realizado com sucesso
            const modal = new bootstrap.Modal(
                document.getElementById("modalCadastro")
            );

            modal.show();

            formularioCadastro.reset();

            setTimeout(function () {
                window.location.href = "login.html";
            }, 2000);

        } catch (erro) {

            console.error("Erro no cadastro:", erro);

            if (erro.status === 409) {

                const modalEmail = new bootstrap.Modal(
                    document.getElementById("modalEmailExiste")
                );

                modalEmail.show();

            } else {

                alert(erro.message);

            }

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

let cupomAplicado = null;

const campoCupom = document.querySelector("#codigoCupom");
const btnAplicarCupom = document.querySelector("#btnAplicarCupom");
const mensagemCupom = document.querySelector("#mensagemCupom");
const valorDesconto = document.querySelector("#valorDesconto");
const btnRemoverCupom = document.querySelector("#btnRemoverCupom");

const campoCEP = document.querySelector("#cep");
const btnCalcularFrete = document.querySelector("#btnCalcularFrete");
const opcoesFrete = document.querySelector("#opcoesFrete");
const valorFrete = document.querySelector("#valorFrete");
const btnRemoverFrete = document.querySelector("#btnRemoverFrete");

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

        if (!codigo) {
            mensagemCupom.textContent = "Digite um código de cupom.";
            mensagemCupom.className = "mt-2 text-danger";
            return;
        }

        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        let subtotal = 0;

        carrinho.forEach(function (produto) {
            subtotal += produto.preco * produto.quantidade;
        });

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

            atualizarResumoCarrinho();

            mensagemCupom.textContent = dados.mensagem;
            mensagemCupom.className = "mt-2 text-success";

        } catch (erro) {

            console.error("Erro ao aplicar cupom:", erro);

            cupomAplicado = null;

            atualizarResumoCarrinho();

            mensagemCupom.textContent = erro.message;
            mensagemCupom.className = "mt-2 text-danger";

        }

    });

}

// REMOVER CUPOM DE DESCONTO
if (btnRemoverCupom) {

    btnRemoverCupom.addEventListener("click", function () {

        cupomAplicado = null;

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

            alert("Você precisa entrar na sua conta para finalizar o pedido.");

            const linkLogin = document.querySelector("#menuLogin a");

            if (linkLogin) {
                window.location.href = linkLogin.href;
            }

            return;
        }

        // Recupera os produtos do carrinho
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        if (carrinho.length === 0) {

            const modalCarrinhoVazio = new bootstrap.Modal(document.getElementById("modalCarrinhoVazio"));

            modalCarrinhoVazio.show();

            return;
        }

        // Verifica o CEP
        const cepDigitado = campoCEP.value.trim();
        const cepNumeros = cepDigitado.replace(/\D/g, "");

        const cep = cepNumeros.length === 8
            ? cepNumeros.replace(/^(\d{5})(\d{3})$/, "$1-$2")
            : cepDigitado;

            // Verifica se o cliente selecionou uma opção de frete
            const freteMarcado = document.querySelector('input[name="frete"]:checked');

            if (!freteMarcado) {
                alert("Selecione uma opção de frete antes de finalizar o pedido.");
                return;
            }

        // Verifica a forma de pagamento
        const pagamentoSelecionado = document.querySelector('input[name="metodoPagamento"]:checked');

        if (!pagamentoSelecionado) {
            alert("Selecione uma forma de pagamento.");
            return;
        }

        const metodoPagamento = pagamentoSelecionado.value;

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

            if (!cartao) {
                alert("Informe o número do cartão.");
                return;
            }

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

            // Guarda o pedido retornado pela API
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

            // Guarda o pedido e os valores calculados
            const pedidoSalvo = {
                ...dados.pedido,
                subtotal: subtotal,
                desconto: desconto,
                frete: frete,
                totalFinal: totalFinal
            };

            // Identifica o usuário que realizou a compra
            const usuario = JSON.parse(dadosUsuario);

            // Cria uma chave exclusiva para os pedidos desse usuário
            const chavePedidos = "pedidos_" + usuario.email.toLowerCase();

            // Recupera os pedidos anteriores dessa conta
            const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

            // Adiciona o novo pedido
            pedidos.push(pedidoSalvo);

            // Salva os pedidos na conta correspondente
            localStorage.setItem(chavePedidos, JSON.stringify(pedidos));

            // Limpa o carrinho somente após sucesso
            localStorage.removeItem("carrinho");

            // Redireciona para a página de sucesso
            window.location.href = "sucesso-pedido.html";

        } catch (erro) {

            console.error("Erro ao finalizar pedido:", erro);

            // Tratamento dos erros da API
            if (erro.status === 400) {

                alert("Dados inválidos: " + erro.message);

            } else if (erro.status === 402) {

                alert("Pagamento recusado. Verifique os dados do cartão ou utilize outro cartão.");

            } else if (erro.status === 404) {

                alert("Um produto do seu carrinho não foi encontrado. Atualize seu carrinho.");

            } else if (erro.status === 422) {

                alert("Estoque insuficiente: " + erro.message);

            } else {

                alert("Não foi possível finalizar o pedido: " + erro.message);

            }

            btnFinalizar.disabled = false;
            btnFinalizar.textContent = "Finalizar Pedido";

        }

    });

}


// CÁLCULO DO FRETE
if (btnCalcularFrete) {

    btnCalcularFrete.addEventListener("click", async function () {
        freteSelecionado = 0;

        atualizarResumoCarrinho();

        opcoesFrete.innerHTML = "";

        valorFrete.textContent = formatarMoeda(0);

        const cep = campoCEP.value.replace(/\D/g, "");

        if (cep.length !== 8) {

            alert("Informe um CEP válido com 8 números.");

            return;
        }

        const cepFormatado = cep.replace(
            /^(\d{5})(\d{3})$/,
            "$1-$2"
        );

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

            const radiosFrete = document.querySelectorAll('input[name="frete"]');

            radiosFrete.forEach(function (radio) {

                radio.addEventListener("change", function () {

                    const indice = Number(this.value);

                    const freteEscolhido = dados.fretes[indice];

                    freteSelecionado = Number(freteEscolhido.valor);

                    atualizarResumoCarrinho();

                });

            });

        } catch (erro) {

            console.error("Erro ao calcular frete:", erro);

            if (erro.status === 400) {

                alert("Formato de CEP inválido.");

            } else if (erro.status === 404) {

                alert("CEP não encontrado.");

            } else if (erro.status === 422) {

                alert("Região não atendida para entrega.");

            } else {

                alert(erro.message);

            }

        }

    });

}

// Remover frete selecionado
if (btnRemoverFrete) {

    btnRemoverFrete.addEventListener("click", function () {

        freteSelecionado = 0;

        document.querySelectorAll('input[name="frete"]').forEach(function (radio) {
            radio.checked = false;
        });

        atualizarResumoCarrinho();

    });

}


// EXIBIR DADOS DO PEDIDO FINALIZADO
const numeroPedido = document.querySelector("#numero-pedido");

if (numeroPedido) {

    // Recupera os dados do usuário conectado
    const dadosUsuario = localStorage.getItem("usuarioLogado");

    if (!dadosUsuario) {

        document.querySelector(".dados-pedido").textContent =
            "Não foi possível identificar o usuário.";

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

        // Identifica o usuário conectado
        const usuario = JSON.parse(dadosUsuario);

        // Recupera somente os pedidos desse usuário
        const chavePedidos = "pedidos_" + usuario.email.toLowerCase();

        const pedidos = JSON.parse(localStorage.getItem(chavePedidos)) || [];

        // Verifica se existem pedidos
        if (pedidos.length === 0) {

            mensagemSemPedidos.style.display = "block";

        } else {

            // Percorre os pedidos do usuário
            pedidos.forEach(function (pedido) {

                const possuiValores = pedido.totalFinal !== undefined || pedido.subtotal !== undefined;

                const subtotal = Number(pedido.subtotal) || 0;
                const desconto = Number(pedido.desconto) || 0;
                const frete = Number(pedido.frete) || 0;

                const totalPedido = pedido.totalFinal !== undefined
                    ? Number(pedido.totalFinal)
                    : subtotal - desconto + frete;

                const valorExibido = possuiValores && Number.isFinite(totalPedido)
                    ? formatarMoeda(totalPedido)
                    : "Não informado";

                // Cria o card do pedido
                const card = document.createElement("div");

                card.className = "card shadow-sm mb-4";

                card.innerHTML = `
                    <div class="card-body">

                        <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">

                            <h5 class="card-title mb-2">
                                Pedido: ${pedido.protocolo || "Não informado"}
                            </h5>

                            <span class="badge bg-success">
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

                    </div>
                `;

                listaPedidos.appendChild(card);

            });

        }

    }

}
