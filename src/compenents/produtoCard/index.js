import { API_URL } from "../../util/api";
import { formatarPreco } from "../../util/formatar";

const ProdutoCard = ({ produto, quantidadeNoCarrinho, onAdicionar, desabilitado }) => {
    return (
        <div className="card h-100 shadow-sm">
            {produto.imagem ? (
                <img
                    src={`${API_URL}/images/${produto.imagem}`}
                    alt={produto.nome}
                    className="card-img-top"
                    style={{ height: 180, objectFit: "cover" }}
                />
            ) : (
                <div
                    className="card-img-top bg-light text-muted d-flex align-items-center justify-content-center"
                    style={{ height: 180 }}
                >
                    Sem imagem
                </div>
            )}
            <div className="card-body d-flex flex-column">
                <h2 className="card-title fs-6 mb-1">{produto.nome}</h2>
                <p className="fs-5 fw-bold text-success mb-3">{formatarPreco(produto.preco)}</p>
                <button
                    className="btn btn-primary mt-auto"
                    disabled={desabilitado}
                    onClick={() => onAdicionar(produto)}
                >
                    Adicionar ao carrinho
                </button>
                {quantidadeNoCarrinho > 0 && (
                    <small className="text-muted text-center mt-2">
                        {quantidadeNoCarrinho} no carrinho
                    </small>
                )}
            </div>
        </div>
    );
}

export default ProdutoCard;
