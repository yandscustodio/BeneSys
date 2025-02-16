require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Rota de teste
app.get("/test-db", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW() as now;");
        res.json({ message: "Conexão bem-sucedida!", data: result.rows });
    } catch (error) {
        res.status(500).json({ error: "Erro ao conectar ao banco", details: error });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
