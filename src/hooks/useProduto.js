import api from "../util/api";

function useProduto() {
    async function getAll() {
        const response = await api.get('/produto/getAll');
        return response.data;
    }
    async function getById(id) { 
        const response = await api.get(`/produto/getById/${id}`);
        return response.data;
    }
    function montarFormData(produto, imagem) {
        const formData = new FormData();
        formData.append('nome', produto.nome);
        formData.append('preco', produto.preco);
        if (imagem) formData.append('imagem', imagem);
        return formData;
    }
    async function create(produto, imagem) {
        const response = await api.post('/produto/create', montarFormData(produto, imagem));
        return response.data;
    }
    async function update(id, produto, imagem) {
        const response = await api.put(`/produto/update/${id}`, montarFormData(produto, imagem));
        return response.data;
    }
    async function remove(id) { 
        const response = await api.delete(`/produto/delete/${id}`);
        return response.data;
    }

    return { getAll, getById, create, update, remove };
}

export default useProduto;
