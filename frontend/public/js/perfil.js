document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Você precisa estar logado para acessar esta página!");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/perfil", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const user = await response.json();

        document.getElementById("nomeCompleto").textContent = `${user.primeiro_nome} ${user.ultimo_nome}` || "Nome não disponível";
        document.getElementById("fotoCapa").src = user.foto_capa || "assets/images/profile-bg.jpg";
        document.getElementById("fotoPerfil").src = user.foto_perfil || "assets/images/users/avatar-1.jpg";
        document.getElementById("funcaoUsuario").textContent = user.funcao || "Função não informada";

    } catch (error) {
        console.error("Erro ao buscar os dados do usuário:", error);
        alert(`Erro ao carregar os dados: ${error.message}`);
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
});
