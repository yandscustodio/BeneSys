document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");

    if (!loginForm) {
        console.error("🔥 Formulário de login não encontrado!");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const cpf = document.getElementById("cpf").value.trim();
        const senha = document.getElementById("senha").value.trim();

        if (!cpf || !senha) {
            alert("Por favor, preencha todos os campos!");
            return;
        }

        try {
            const API_URL = window.location.origin; // Usa localhost ou GitHub Codespaces automaticamente

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cpf, senha }),
                credentials: "include" // 🔹 Permite envio de cookies
            });

            if (!response.ok) throw new Error("Erro ao autenticar usuário");

            alert("✅ Login bem-sucedido!");
            window.location.href = "perfil.html";

        } catch (error) {
            console.error("❌ Erro no login:", error);
            alert("Erro ao fazer login. Verifique suas credenciais.");
        }
    });
});
