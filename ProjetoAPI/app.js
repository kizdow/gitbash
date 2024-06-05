// token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tZV91c3VhcmlvIjoiQ3Jpc3RpYW4gQm9uaSIsImlhdCI6MTcxNTI5OTkxOCwiZXhwIjoxNzE1MzAzNTE4fQ.rXjTHtaJA0i-5of63D36nbCo0IDaYOJmDonHObTf2aE
// senha: segredo_huyjiohfesuafreioyxeahwygniafgidageLDELOUDnftr7249qtgnenwiqtfgxmerwafe
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const saltRounts = 10;
const jwtSecret = 'segredo_huyjiohfesuafreioyxeahwygniafgidageLDELOUDnftr7249qtgnenwiqtfgxmerwafe'

app.post(`/registrar`, async (req,res) => {
    const { nome_usuario , senha } = req.body;
    const hashSenha = await bcrypt.hash(senha, saltRounts);
    await promisePool.query(`INSERT INTO usuarios (nome_usuario,senha) VALUES (?,?)`, [nome_usuario,hashSenha]);
    res.status(201).send(`Usuário registrado com sucesso`)
});

app.post(`/login`, async (req,res) => {
    const { nome_usuario , senha } = req.body;
    const [ usuarios ] = await promisePool.query(`SELECT * FROM usuarios WHERE nome_usuario = ?`,[nome_usuario])
    if (usuarios.length === 0){
        return res.status(404).send(`Usuário não encontrado`)
    }

    const usuario = usuarios[0];
    const senhaComparada = await bcrypt.compare(senha, usuario.senha)
    if (senhaComparada) {
        const token = jwt.sign(
            {
            id: usuario.id,
            nome_usuario: usuario.nome_usuario,
            },
            jwtSecret,
            {
                expiresIn: '1h'
            }
        );
        res.json({token});
    }

});

// Middleware para autenticar token
const autenticacaotoken = (req,res,next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[0];
    
    jwt.verify(token,jwtSecret, (err,usuario) => {
        if (err) return res.sendStatus(403);
        req.usuario = usuario;
        next();
    })
}

// Configuração da conexão com o banco de dados
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'api_db',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
});

// Utilizar pool para gerenciar multiplicar conexães
const promisePool = pool.promise();

// Rota/Endpoint
app.get('/',autenticacaotoken, (req, res) => {
    res.status(200).send("Bem-vindo a API de alimentos");
});

// CRUB TABLE alimentos, buscar tudo na tabela
app.get('/alimentos',autenticacaotoken, async (req, res) => {
    const [rows,fields] = await promisePool.query("SELECT * FROM alimentos");
    res.status(200).json(rows);
});

// POST adicionar um novo alimento
app.post('/alimentos',autenticacaotoken, async (req,res) => {
    const {nome, calorias, carboidratos, proteinas, gorduras} = req.body;
    const [result] = await promisePool.query('INSERT INTO alimentos (nome, calorias, carboidratos, proteinas, gorduras) VALUES(?,?,?,?,?)',[nome, calorias, carboidratos, proteinas, gorduras]);
    res.status(201).send(`Alimento adicionado com ID: ${result.insertId}`)
});

// PUT atualizar um alimento
app.put('/alimentos/:id',autenticacaotoken, async (req,res) => {
    const {nome, calorias, carboidratos, proteinas, gorduras} = req.body;
    const { id } = req.params;
    const [result] = await promisePool.query('UPDATE alimentos SET nome = ?,calorias = ?, carboidratos = ?, proteinas = ?, gorduras = ? WHERE id = ?',[nome, calorias, carboidratos, proteinas, gorduras, id]);
    
    if (result.affectedRows > 0 ) {
        res.status(200).send(`Alimento atualizado`)
    } else {
        res.status(404).send(`alimento não encontrado`)
    }
});

// DELETE deletar
app.delete('/alimentos/:id',autenticacaotoken, async (req, res) => {
    const { id } = req.params;
    const [result] = await promisePool.query('DELETE FROM alimentos WHERE id = ?',[id]);

    if (result.affectedRows > 0 ) {
        res.status(200).send(`Alimento deletado com sucesso!`)
    } else {
        res.status(404).send(`alimento não encontrado`)
    }
})

// PATCH atualizar de maneira parcial
app.patch('/alimentos/:id',autenticacaotoken, async (req,res) => {
    const { id } = req.params;
    const dadosParaAtualizar = req.body;
    const camposParaAtualizar = [];
    const valores = [];

    // Preparar a declaração SQL dinâmica com base nos campos fornecidos
    Object.keys(dadosParaAtualizar).forEach(key => {
        camposParaAtualizar.push(`${key} = ?`);
        valores.push(dadosParaAtualizar[key]);
    })

    if (camposParaAtualizar.length > 0) {
        const sqlQuery = `UPDATE alimentos SET ${camposParaAtualizar.join(', ')} WHERE id = ?`;
        valores.push(id);

        try {
            const [result] = await promisePool.query(sqlQuery, valores);
    
            if (result.affectedRows > 0 ) {
                res.status(200).send(`Alimento atualizado com sucesso`)
            } else {
                res.status(404).send(`alimento não encontrado`)
            } 
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    } else {
        res.status(400).send('Nenhum dado foi enviado')
    }

    const [result] = await promisePool.query('',[nome, calorias, carboidratos, proteinas, gorduras, id]);
    
    if (result.affectedRows > 0 ) {
        res.status(200).send(`Alimento atualizado`)
    } else {
        res.status(404).send(`alimento não encontrado`)
    }
});


const PORTA = 3000; // criar porta
app.listen(PORTA, () => {
    console.log(`Servidor iniciado na porta ${PORTA}`);
});
