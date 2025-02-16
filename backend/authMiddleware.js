const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ error: "Acesso negado! Token não fornecido." });
    }

    const token = authHeader.split(" ")[1]; // Remove o "Bearer" e pega apenas o token

    if (!token) {
        return res.status(401).json({ error: "Token inválido ou ausente." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "segredo_super_secreto");
        req.usuario = decoded; // Adiciona os dados do usuário na requisição
        next();
    } catch (error) {
        return res.status(400).json({ error: "Token inválido ou expirado." });
    }
}

module.exports = verificarToken;
