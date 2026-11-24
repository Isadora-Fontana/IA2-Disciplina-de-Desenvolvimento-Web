import { useState, useEffect, useRef } from "react";
import InputGroup from "../../compenents/inputGroup";
import useProduto from "../../hooks/useProduto";
import { API_URL } from "../../util/api";

const Produto = () => {
    const [produto, setProduto] = useState({});
    const [lstProdutos, setLstProdutos] = useState([]);
    const [imagem, setImagem] = useState(null);
    const inputImagemRef = useRef(null);
    const { getAll, create, update, remove } = useProduto();

    async function carregarProdutos() {
        const dados = await getAll();
        setLstProdutos(dados);
    }

    useEffect(() => {
        carregarProdutos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function validateProduto(produto){
        if (!produto.nome) {
            alert("O campo nome é obrigatório");
            return false;
        }
        if (!produto.preco) {
            alert("O campo preço é obrigatório");
            return false;
        }
        if (Number(produto.preco) < 0) {
            alert("O preço não pode ser negativo");
            return false;
        }
        if (!produto.id && !imagem) {
            alert("A imagem é obrigatória");
            return false;
        }
        return true;
    }

    function handleChange(e) {
        setProduto({ ...produto, [e.target.name]: e.target.value})
    }

    function handleImagem(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) {
            setImagem(null);
            return;
        }

        const tiposPermitidos = ["image/jpeg", "image/png"];
        if (!tiposPermitidos.includes(arquivo.type)) {
            alert("Envie apenas imagens .jpeg ou .png");
            e.target.value = "";
            setImagem(null);
            return;
        }
        setImagem(arquivo);
    }

    function limparFormulario() {
        setProduto({});
        setImagem(null);
        if (inputImagemRef.current) inputImagemRef.current.value = "";
    }

    async function handleSubmit(e){
        e.preventDefault();
        if (!validateProduto(produto)) return;

        try{
            if (produto.id){
                await update(produto.id, produto, imagem);
            } else{
                await create(produto, imagem);
            }
            limparFormulario();
            carregarProdutos();
        } catch (err){
            alert("Erro ao salvar: " + (err.response?.data?.message || err.message));
        }
    }

    function handleEditar(item) {
        setProduto(item);
    }

    async function handleExcluir(id){
        if (!window.confirm("Deseja excluir este produto?")) return;
        await remove(id);
        carregarProdutos();
    }

    return(
        <div className="container">
            <h1 className="text-center fs-4">Produtos</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <InputGroup 
                        label="Nome" 
                        onChange={handleChange}
                        type="text"
                        placeholder= "Nome do Produto"
                        name = "nome"
                        value={produto.nome ?? ""}
                    />
                    <InputGroup
                        label = "Preço"
                        onChange={handleChange}
                        type="number"
                        placeholder="Preço do Produto"
                        name="preco"
                        value={produto.preco ?? ""}
                        min="0"
                        step="0.01"
                    />
                    <div className="input-group mb-3">
                        <span className="input-group-text">Imagem</span>
                        <input
                            className="form-control"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            ref={inputImagemRef}
                            onChange={handleImagem}
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        type="submit">
                        {produto.id ? "Atualizar" : "Salvar"}
                    </button>
                    {produto.id && (
                        <button
                            className="btn btn-secondary ms-2"
                            type="button"
                            onClick={limparFormulario}>
                            Cancelar
                        </button>
                    )}
                </form>
            </div>
            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {lstProdutos.length === 0 ? (
                        <tr>
                            <td colSpan={4}className="text-name"> Nenhum produto cadastrado</td>
                        </tr>)
                        : (
                            lstProdutos.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        {item.imagem && (
                                            <img
                                                src={`${API_URL}/images/${item.imagem}`}
                                                alt={item.nome}
                                                width={60}
                                                className="rounded"
                                            />
                                        )}
                                    </td>
                                    <td>{item.nome}</td>
                                    <td>R${item.preco}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => handleEditar(item)}>
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleExcluir(item.id)}>
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Produto;