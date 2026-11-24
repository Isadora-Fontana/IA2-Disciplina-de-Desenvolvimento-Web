import api from "../util/api";

function useVenda() {
    // venda = { cliente, formaPagamento, itens: [{ produtoId, quantidade }] }
    async function create(venda) {
        const response = await api.post('/venda/create', venda);
        return response.data;
    }
    async function getAll() {
        const response = await api.get('/venda/getAll');
        return response.data;
    }

    return { create, getAll };
}

export default useVenda;
