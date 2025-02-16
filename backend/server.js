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
    const {
        primeiro_nome,
        ultimo_nome,
        telefone,
        email,
        data_admissao,
        matricula,
        cpf,
        funcao,
        unidade,
        cidade,
        estado,
        pais,
        bio
    } = req.body;

    try {
        // 🔹 Atualiza apenas os campos que foram fornecidos pelo usuário
        const result = await pool.query(
            `UPDATE usuarios SET 
                primeiro_nome = COALESCE($1, primeiro_nome), 
                ultimo_nome = COALESCE($2, ultimo_nome), 
                telefone = COALESCE($3, telefone), 
                email = COALESCE($4, email),
                data_admissao = COALESCE($5, data_admissao),
                matricula = COALESCE($6, matricula),
                cpf = COALESCE($7, cpf),
                funcao = COALESCE($8, funcao),
                unidade = COALESCE($9, unidade),
                cidade = COALESCE($10, cidade),
                estado = COALESCE($11, estado),
                pais = COALESCE($12, pais),
                bio = COALESCE($13, bio)
            WHERE id = $14 RETURNING *`,
            [
                primeiro_nome, ultimo_nome, telefone, email, data_admissao,
                matricula, cpf, funcao, unidade, cidade, estado, pais, bio, req.usuario.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json({ message: "Perfil atualizado com sucesso!", usuario: result.rows[0] });

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ error: "Erro ao atualizar perfil" });
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
