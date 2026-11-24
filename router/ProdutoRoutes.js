//POST - ENVIAR NOVO CADASTRO
//GET - BUSCAR CADASTRO
//PATCH / PUT - ATUALIZAR CADASTRO
//DELETE - DELETAR

const router = require('express').Router();
const ProdutoController = require('../controller/ProdutoController.js');

router.post('/create', ProdutoController.create);
router.get('/getAll', ProdutoController.getAll);
router.get('/getByID/:id', ProdutoController.getById);
router.get('/update/:id', ProdutoController.update);
router.get('/delete/:id', ProdutoController.delete);

module.exports = router;
