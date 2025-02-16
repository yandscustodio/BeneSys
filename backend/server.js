require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: "https://friendly-space-system-5grpggpxg54rc4656-3000.app.github.dev", // Substitua pelo SEU endereço do frontend
    credentials: true // 🔹 Garante envio de cookies entre diferentes domínios
}));

app.use(cookieParser());

// 🔹 Rota de login - Armazena o token no Cookie HTTP-Only
app.post("/login", async (req, res) => {
    const { cpf, senha } = req.body;

    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE cpf = $1", [cpf]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "CPF ou senha incorretos" });
        }

        const usuario = result.rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: "CPF ou senha incorretos" });
        }

        // 🔹 Gerar token JWT
        const token = jwt.sign(
            { id: usuario.id, cpf: usuario.cpf },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        // 🔹 Configurar Cookie HTTP-Only
        res.cookie("auth_token", token, {
            httpOnly: true,  // 🔒 Impede acesso via JavaScript (segurança contra XSS)
            secure: false,   // ⚠️ Em produção, altere para `true`
            sameSite: "Strict", // Protege contra ataques CSRF
            maxAge: 2 * 60 * 60 * 1000, // Expira em 2 horas
        });

        res.json({ message: "Login bem-sucedido!" });

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro ao autenticar usuário" });
    }
});

// 🔹 Middleware para verificar autenticação via cookie
const verificarTokenCookie = (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: "Acesso não autorizado. Faça login novamente." });
    }

    try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
};

// 🔹 Rota protegida - Obter perfil do usuário autenticado
app.get("/perfil", verificarTokenCookie, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [req.usuario.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ error: "Erro ao buscar perfil" });
    }
});

// 🔹 Rota PUT - Atualizar perfil do usuário autenticado
app.put("/perfil", verificarTokenCookie, async (req, res) => {
    try {
        let { primeiro_nome, ultimo_nome, telefone, email, data_admissao, matricula, cpf, funcao, unidade, cidade, estado, pais, bio, link_instagram, link_linkedin, link_facebook } = req.body;
        const userId = req.usuario.id; // Obtendo o ID do usuário autenticado pelo token

        // Se a data_admissao estiver vazia, definir como NULL
        if (!data_admissao || data_admissao.trim() === "") {
            data_admissao = null;
        }

        // Atualizando os dados no banco de dados
        const result = await pool.query(`
            UPDATE usuarios 
            SET primeiro_nome = $1, ultimo_nome = $2, telefone = $3, email = $4, data_admissao = $5, 
                matricula = $6, cpf = $7, funcao = $8, unidade = $9, cidade = $10, estado = $11, pais = $12, bio = $13, 
                link_instagram = $14, link_linkedin = $15, link_facebook = $16
            WHERE id = $17
            RETURNING *;
        `, [primeiro_nome, ultimo_nome, telefone, email, data_admissao, matricula, cpf, funcao, unidade, cidade, estado, pais, bio, link_instagram, link_linkedin, link_facebook, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        res.json({ message: "Perfil atualizado com sucesso!", usuario: result.rows[0] });

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ error: "Erro ao atualizar perfil." });
    }
});

// 🔹 Rota para listar países do banco de dados
app.get("/paises", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, nome FROM paises ORDER BY nome ASC");
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar países:", error);
        res.status(500).json({ error: "Erro ao buscar países" });
    }
});

// 🔹 Rota para listar estados de um país específico
app.get("/estados/:id_pais", async (req, res) => {
    const { id_pais } = req.params;
    try {
        const result = await pool.query("SELECT id, nome FROM estados WHERE id_pais = $1 ORDER BY nome ASC", [id_pais]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar estados:", error);
        res.status(500).json({ error: "Erro ao buscar estados" });
    }
});

// 🔹 Rota para listar cidades de um estado específico
app.get("/cidades/:id_estado", async (req, res) => {
    const { id_estado } = req.params;
    try {
        const result = await pool.query("SELECT id, nome FROM cidades WHERE id_estado = $1 ORDER BY nome ASC", [id_estado]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar cidades:", error);
        res.status(500).json({ error: "Erro ao buscar cidades" });
    }
});

// 🔹 Rota de logout - Remove o cookie de autenticação
app.post("/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ message: "Logout realizado com sucesso." });
});

// Servir arquivos estáticos da pasta frontend/public
app.use(express.static("../frontend/public"));

// Iniciar o servidor
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
