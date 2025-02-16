require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verificarToken = require("./authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos da pasta frontend/public
app.use(express.static(path.join(__dirname, "../frontend/public")));

// 🟢 Rota para obter os dados do usuário autenticado
app.get("/perfil", verificarToken, async (req, res) => {
    try {
        console.log(`🔎 Buscando perfil do usuário ID: ${req.usuario.id}`);

        const result = await pool.query(
            "SELECT id, primeiro_nome, ultimo_nome, cpf, email, telefone, funcao, cidade, estado, pais, bio, foto_perfil, foto_capa FROM usuarios WHERE id = $1",
            [req.usuario.id]
        );

        if (result.rows.length === 0) {
            console.log("❌ Usuário não encontrado.");
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        console.log("✅ Dados do usuário carregados com sucesso.");
        res.json(result.rows[0]);
    } catch (error) {
        console.error("🔥 Erro ao buscar perfil:", error);
        res.status(500).json({ error: "Erro ao buscar perfil" });
    }
});

// 🟢 Rota principal (carrega automaticamente perfil.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/public/perfil.html"));
});

// 🟢 Teste de conexão com o banco de dados
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() as now;");
        res.json({ message: "Conexão bem-sucedida!", data: result.rows });
    } catch (error) {
        console.error("🔥 Erro ao conectar ao banco:", error);
        res.status(500).json({ error: "Erro ao conectar ao banco", details: error });
    }
});

// 🟢 Rota de login (CPF e senha)
app.post("/login", async (req, res) => {
    const { cpf, senha } = req.body;

    if (!cpf || !senha) {
        return res.status(400).json({ error: "CPF e senha são obrigatórios" });
    }

    try {
        console.log(`🔑 Tentativa de login com CPF: ${cpf}`);

        // Busca o usuário pelo CPF
        const result = await pool.query("SELECT * FROM usuarios WHERE cpf = $1", [cpf]);

        if (result.rows.length === 0) {
            console.log("❌ CPF não encontrado.");
            return res.status(401).json({ error: "CPF ou senha incorretos" });
        }

        const usuario = result.rows[0];

        // Verifica a senha com bcrypt
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            console.log("❌ Senha incorreta.");
            return res.status(401).json({ error: "CPF ou senha incorretos" });
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: usuario.id, cpf: usuario.cpf },
            process.env.JWT_SECRET || "segredo_super_secreto",
            { expiresIn: "2h" }
        );

        console.log("✅ Login bem-sucedido! Token gerado.");
        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.primeiro_nome,
                cpf: usuario.cpf
            }
        });

    } catch (error) {
        console.error("🔥 Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro ao autenticar usuário" });
    }
});

// 🟢 Rota para obter os dados de um usuário específico
app.get("/usuarios/:id", async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`🔎 Buscando dados do usuário ID: ${id}`);
        const result = await pool.query(
            "SELECT id, primeiro_nome, ultimo_nome, cpf, email, telefone, funcao, cidade, estado, pais, bio, foto_perfil, foto_capa FROM usuarios WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            console.log("❌ Usuário não encontrado.");
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        console.log("✅ Usuário encontrado com sucesso.");
        res.json(result.rows[0]);
    } catch (error) {
        console.error("🔥 Erro ao buscar usuário:", error);
        res.status(500).json({ error: "Erro ao buscar usuário" });
    }
});

// 🟢 Iniciar o servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});
