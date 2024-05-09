const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// Configuração da conexão com o banco de dados
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'api_db',
    waitForConnections: true,
    connecionLimit: 10,
    queueLimit: 0,
});

// Utilizar pool para gerenciar multiplicar conexães
const promisePool = pool.promise();

// Rota/Endpoint
app.get('/', (req, res) => {
    res.status(200).send("Bem-vindo a API de alimentos");
});

// CRUB TABLE alimentos, buscar tudo na tabela
app.get('/alimentos', async (req, res) => {
    const [rows,fields] = await promisePool.query("SELECT * FROM alimentos");
    res.status(200).json(rows);
});

// POST adicionar um novo alimento
app.post('/alimentos', async (req,res) => {
    const {nome, calorias, carboidratos, proteinas, gorduras} = req.body;
    const [result] = await promisePool.query('INSERT INTO alimentos (nome, calorias, carboidratos, proteinas, gorduras) VALUES(?,?,?,?,?)',[nome, calorias, carboidratos, proteinas, gorduras]);
    res.status(201).send(`Alimento adicionado com ID: ${result.insertId}`)
});

const PORTA = 3000; // criar porta
app.listen(PORTA, () => {
    console.log(`Servidor iniciado na porta ${PORTA}`);
});
