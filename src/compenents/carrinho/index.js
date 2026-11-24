import { useState } from "react";
import { formatarPreco } from "../../util/formatar";

const formasPagamento = ["Pix", "Cartão de crédito", "Cartão de débito", "Boleto"];

// carrinho = resposta da API: { id, itens: [{ produtoId, nome, precoUnitario, quantidade, subtotal }], quantidadeTotal, total }
// etapa: "carrinho" -> "checkout" -> "concluido"
const Carrinho = ({ carrinho, ocupado, onAlterarQuantidade, onRemover, onEsvaziar, onFinalizar }) => {
    const [etapa, setEtapa] = useState("carrinho");
    const [cliente, setCliente] = useState("");
    const [formaPagamento, setFormaPagamento] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");
    const [pedido, setPedido] = useState(null);

    const itens = carrinho?.itens ?? [];
    const quantidadeTotal = carrinho?.quantidadeTotal ?? 0;
    const total = carrinho?.total ?? 0;
    const bloqueado = ocupado || enviando || etapa === "checkout";

    async function handleConfirmar(e) {
        e.preventDefault();
        setErro("");

        if (!cliente.trim()) {
            setErro("Informe o nome do cliente.");
            return;
        }
        if (!formaPagamento) {
            setErro("Escolha a forma de pagamento.");
            return;
        }

        setEnviando(true);
        try {
            const resposta = await onFinalizar({ cliente: cliente.trim(), formaPagamento });
            setPedido({ ...resposta, formaPagamento });
            setEtapa("concluido");
            setCliente("");
            setFormaPagamento("");
        } catch (err) {
            setErro(err.response?.data?.message || "Não foi possível finalizar a venda.");
        } finally {
            setEnviando(false);
        }
    }

    if (etapa === "concluido" && pedido) {
        return (
            <div className="card shadow-sm">
                <div className="card-body text-center">
                    <h2 className="fs-5 text-success">Pedido #{pedido.vendaId} confirmado!</h2>
                    <p className="mb-1">Total: <strong>{formatarPreco(pedido.total)}</strong></p>
                    <p className="text-muted">Pagamento: {pedido.formaPagamento}</p>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => { setPedido(null); setEtapa("carrinho"); }}
                    >
                        Continuar comprando
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h2 className="fs-5 mb-0">Carrinho</h2>
                <span className="badge bg-primary">{quantidadeTotal} {quantidadeTotal === 1 ? "item" : "itens"}</span>
            </div>

            {!carrinho ? (
                <div className="card-body text-muted text-center">Carregando carrinho...</div>
            ) : itens.length === 0 ? (
                <div className="card-body text-muted text-center">
                    Seu carrinho está vazio.
                </div>
            ) : (
                <>
                    <ul className="list-group list-group-flush">
                        {itens.map((item) => (
                            <li key={item.produtoId} className="list-group-item">
                                <div className="d-flex justify-content-between">
                                    <span className="fw-semibold">{item.nome}</span>
                                    <span>{formatarPreco(item.subtotal)}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <div className="input-group input-group-sm" style={{ width: 110 }}>
                                        <button
                                            className="btn btn-outline-secondary"
                                            disabled={bloqueado}
                                            onClick={() => onAlterarQuantidade(item.produtoId, item.quantidade - 1)}
                                            aria-label="Diminuir quantidade"
                                        >
                                            −
                                        </button>
                                        <span className="form-control text-center">{item.quantidade}</span>
                                        <button
                                            className="btn btn-outline-secondary"
                                            disabled={bloqueado}
                                            onClick={() => onAlterarQuantidade(item.produtoId, item.quantidade + 1)}
                                            aria-label="Aumentar quantidade"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <small className="text-muted">{formatarPreco(item.precoUnitario)} cada</small>
                                    <button
                                        className="btn btn-sm btn-link text-danger"
                                        disabled={bloqueado}
                                        onClick={() => onRemover(item.produtoId)}
                                    >
                                        Remover
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="card-body border-top">
                        <div className="d-flex justify-content-between">
                            <span>Subtotal</span>
                            <span>{formatarPreco(total)}</span>
                        </div>
                        <div className="d-flex justify-content-between text-success">
                            <span>Frete</span>
                            <span>Grátis</span>
                        </div>
                        <div className="d-flex justify-content-between fs-5 fw-bold mt-2">
                            <span>Total</span>
                            <span>{formatarPreco(total)}</span>
                        </div>

                        {etapa === "carrinho" ? (
                            <>
                                <button
                                    className="btn btn-success w-100 mt-3"
                                    disabled={ocupado}
                                    onClick={() => setEtapa("checkout")}
                                >
                                    Finalizar compra
                                </button>
                                <button
                                    className="btn btn-link text-danger w-100 mt-1"
                                    disabled={ocupado}
                                    onClick={() => {
                                        if (window.confirm("Deseja esvaziar o carrinho?")) onEsvaziar();
                                    }}
                                >
                                    Esvaziar carrinho
                                </button>
                            </>
                        ) : (
                            <form className="mt-3" onSubmit={handleConfirmar}>
                                <div className="mb-2">
                                    <label className="form-label" htmlFor="cliente">Nome do cliente</label>
                                    <input
                                        id="cliente"
                                        className="form-control"
                                        value={cliente}
                                        onChange={(e) => setCliente(e.target.value)}
                                        placeholder="Nome completo"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="pagamento">Forma de pagamento</label>
                                    <select
                                        id="pagamento"
                                        className="form-select"
                                        value={formaPagamento}
                                        onChange={(e) => setFormaPagamento(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {formasPagamento.map((forma) => (
                                            <option key={forma} value={forma}>{forma}</option>
                                        ))}
                                    </select>
                                </div>

                                {erro && <div className="alert alert-danger py-2">{erro}</div>}

                                <button className="btn btn-success w-100" type="submit" disabled={enviando}>
                                    {enviando ? "Enviando..." : `Confirmar pedido · ${formatarPreco(total)}`}
                                </button>
                                <button
                                    className="btn btn-link w-100 mt-1"
                                    type="button"
                                    disabled={enviando}
                                    onClick={() => { setEtapa("carrinho"); setErro(""); }}
                                >
                                    Voltar ao carrinho
                                </button>
                            </form>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Carrinho;
