import { useEffect, useRef, useState } from "react";
import useProduto from "../../hooks/useProduto";
import useCarrinho from "../../hooks/useCarrinho";
import ProdutoCard from "../../compenents/produtoCard";
import Carrinho from "../../compenents/carrinho";

// O carrinho fica no banco. No navegador guardamos só o id dele,
// para encontrar o mesmo carrinho quando a página for recarregada.
const CHAVE_CARRINHO_ID = "carrinhoId";

function lerCarrinhoId() {
    try {
        return localStorage.getItem(CHAVE_CARRINHO_ID);
    } catch {
        return null;
    }
}

function salvarCarrinhoId(id) {
    try {
        localStorage.setItem(CHAVE_CARRINHO_ID, String(id));
    } catch {
        // navegador sem localStorage: o carrinho só não é reencontrado ao recarregar
    }
}

const Home = () => {
    const { getAll } = useProduto();
    const carrinhoApi = useCarrinho();

    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [busca, setBusca] = useState("");

    const [carrinho, setCarrinho] = useState(null);   // resposta da API: { id, status, itens, quantidadeTotal, total }
    const [ocupado, setOcupado] = useState(false);    // true enquanto espera a API responder
    const [erroCarrinho, setErroCarrinho] = useState("");
    const iniciou = useRef(false);

    // Cria um carrinho novo na API e guarda o id
    async function novoCarrinho() {
        const resposta = await carrinhoApi.create();
        salvarCarrinhoId(resposta.carrinho.id);
        setCarrinho(resposta.carrinho);
    }

    // Ao abrir a página: reaproveita o carrinho salvo se ele ainda estiver aberto,
    // senão cria um novo
    async function iniciarCarrinho() {
        const idSalvo = lerCarrinhoId();
        if (idSalvo) {
            try {
                const salvo = await carrinhoApi.getById(idSalvo);
                if (salvo.status === "aberto") {
                    setCarrinho(salvo);
                    return;
                }
            } catch {
                // carrinho não existe mais: segue para criar um novo
            }
        }
        await novoCarrinho();
    }

    useEffect(() => {
        // O StrictMode roda os efeitos duas vezes em desenvolvimento;
        // o useRef evita criar dois carrinhos
        if (iniciou.current) return;
        iniciou.current = true;

        getAll()
            .then(setProdutos)
            .catch(() => setErro("Não foi possível carregar os produtos. Verifique se a API está rodando."))
            .finally(() => setCarregando(false));

        iniciarCarrinho().catch(() =>
            setErroCarrinho("Não foi possível carregar o carrinho. Verifique se a API está rodando.")
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Executa uma ação no carrinho e atualiza a tela com o carrinho que a API devolveu
    async function executar(acao) {
        if (!carrinho) return;
        setOcupado(true);
        setErroCarrinho("");
        try {
            const resposta = await acao(carrinho.id);
            setCarrinho(resposta.carrinho);
        } catch (err) {
            const mensagem = err.response?.data?.message || "Não foi possível atualizar o carrinho.";
            if (mensagem === "Este carrinho já foi finalizado" || mensagem === "Carrinho não encontrado") {
                // ex.: o carrinho foi finalizado em outra aba
                try {
                    await novoCarrinho();
                    setErroCarrinho("Seu carrinho anterior não estava mais disponível. Criamos um novo, tente de novo.");
                } catch {
                    setErroCarrinho("Não foi possível criar um novo carrinho.");
                }
            } else {
                setErroCarrinho(mensagem);
            }
        } finally {
            setOcupado(false);
        }
    }

    function adicionarAoCarrinho(produto) {
        executar((id) => carrinhoApi.addItem(id, produto.id, 1));
    }

    function alterarQuantidade(produtoId, quantidade) {
        if (quantidade < 1) {
            removerDoCarrinho(produtoId);
            return;
        }
        executar((id) => carrinhoApi.updateItem(id, produtoId, quantidade));
    }

    function removerDoCarrinho(produtoId) {
        executar((id) => carrinhoApi.removeItem(id, produtoId));
    }

    function esvaziarCarrinho() {
        executar((id) => carrinhoApi.clear(id));
    }

    // Chamado pelo componente Carrinho. Se der erro, o próprio componente mostra a mensagem.
    async function finalizarVenda({ cliente, formaPagamento }) {
        const resposta = await carrinhoApi.finalizar(carrinho.id, { cliente, formaPagamento });
        try {
            await novoCarrinho();
        } catch {
            setCarrinho(null);
            setErroCarrinho("Pedido feito, mas não foi possível abrir um novo carrinho. Recarregue a página.");
        }
        return resposta;
    }

    const produtosFiltrados = produtos.filter((p) =>
        p.nome.toLowerCase().includes(busca.trim().toLowerCase())
    );

    function quantidadeNoCarrinho(produtoId) {
        return carrinho?.itens.find((item) => item.produtoId === produtoId)?.quantidade ?? 0;
    }

    return (
        <div className="container my-4">
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
                <h1 className="fs-3 mb-0">Loja</h1>
                <div className="d-flex gap-2 flex-grow-1 justify-content-end">
                    <input
                        type="search"
                        className="form-control"
                        style={{ maxWidth: 320 }}
                        placeholder="Buscar produto..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                    <a href="#carrinho" className="btn btn-outline-primary d-lg-none text-nowrap">
                        Carrinho ({carrinho?.quantidadeTotal ?? 0})
                    </a>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    {carregando && <p className="text-muted">Carregando produtos...</p>}
                    {erro && <div className="alert alert-danger">{erro}</div>}
                    {!carregando && !erro && produtosFiltrados.length === 0 && (
                        <p className="text-muted">
                            {produtos.length === 0
                                ? "Nenhum produto cadastrado. Cadastre na página Produtos."
                                : "Nenhum produto encontrado para essa busca."}
                        </p>
                    )}

                    <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3">
                        {produtosFiltrados.map((produto) => (
                            <div className="col" key={produto.id}>
                                <ProdutoCard
                                    produto={produto}
                                    quantidadeNoCarrinho={quantidadeNoCarrinho(produto.id)}
                                    onAdicionar={adicionarAoCarrinho}
                                    desabilitado={!carrinho || ocupado}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-lg-4" id="carrinho">
                    <div className="sticky-top" style={{ top: 16 }}>
                        {erroCarrinho && (
                            <div className="alert alert-warning py-2">{erroCarrinho}</div>
                        )}
                        <Carrinho
                            carrinho={carrinho}
                            ocupado={ocupado}
                            onAlterarQuantidade={alterarQuantidade}
                            onRemover={removerDoCarrinho}
                            onEsvaziar={esvaziarCarrinho}
                            onFinalizar={finalizarVenda}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
