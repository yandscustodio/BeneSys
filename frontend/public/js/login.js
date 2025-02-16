document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const cpf = document.getElementById("cpf").value;
    const senha = document.getElementById("senha").value;

    try {
        const response = await fetch("https://friendly-space-system-5grpggpxg54rc4656-3000.app.github.dev/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao fazer login");
        }

        localStorage.setItem("token", data.token);
        window.location.href = "perfil.html";
    } catch (error) {
        alert(error.message);
    }
});
