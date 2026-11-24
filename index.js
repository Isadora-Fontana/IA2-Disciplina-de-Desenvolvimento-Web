const express = require('express');
const app = express();
const port = 5050;
const conn = require('./db/conn.js');
const cors = require('cors');

app.use(express.json());
app.use(cors({ credentials: true, origin: '*'}));

const produtoRoutes = require('./router/ProdutoRoutes.js');
app.use('/produto', produtoRoutes);

conn
    .sync()
    .then(() => { app.listen(port)})
    .catch((err) => console.log(err));