import api from "../util/api";

// Todas as funções que mexem no carrinho devolvem { message, carrinho }
// com o carrinho já atualizado pela API.
function useCarrinho() {
    async function create() {
        const response = await api.post('/carrinho/create');
        return response.data;
    }
    async function getById(id) {
        const response = await api.get(`/carrinho/getById/${id}`);
        return response.data;
    }
    async function addItem(id, produtoId, quantidade = 1) {
        const response = await api.post(`/carrinho/${id}/addItem`, { produtoId, quantidade });
        return response.data;
    }
    async function updateItem(id, produtoId, quantidade) {
        const response = await api.put(`/carrinho/${id}/updateItem/${produtoId}`, { quantidade });
        return response.data;
    }
    async function removeItem(id, produtoId) {
        const response = await api.delete(`/carrinho/${id}/removeItem/${produtoId}`);
        return response.data;
    }
    async function clear(id) {
        const response = await api.delete(`/carrinho/${id}/clear`);
        return response.data;
    }
    // dados = { cliente, formaPagamento }
    async function finalizar(id, dados) {
        const response = await api.post(`/carrinho/${id}/finalizar`, dados);
        return response.data;
    }

    return { create, getById, addItem, updateItem, removeItem, clear, finalizar };
}

export default useCarrinho;
