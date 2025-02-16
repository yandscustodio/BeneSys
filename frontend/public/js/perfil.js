document.addEventListener("DOMContentLoaded", async function () {
    console.log("🔹 Iniciando carregamento do perfil...");

    try {
        const API_URL = window.location.origin; // Usa localhost ou GitHub Codespaces automaticamente

        const response = await fetch(`${API_URL}/perfil`, {
            method: "GET",
            credentials: "include" // 🔹 Permite envio automático do cookie
        });

        if (!response.ok) throw new Error("Erro ao carregar perfil");

        const usuario = await response.json();
        console.log("✅ Dados do usuário carregados:", usuario);

        // Atualiza os elementos HTML com os dados do usuário
        document.getElementById("nomeUsuario").innerText = usuario.primeiro_nome + " " + usuario.ultimo_nome;
        document.getElementById("funcaoUsuario").innerText = usuario.funcao;
        document.getElementById("telefoneUsuario").innerText = usuario.telefone;
        document.getElementById("emailUsuario").innerText = usuario.email;
        document.getElementById("dataAdmissaoUsuario").innerText = usuario.data_admissao;
        document.getElementById("unidadeUsuario").innerText = usuario.unidade;
        document.getElementById("cidadeUsuario").innerText = usuario.cidade;
        document.getElementById("estadoUsuario").innerText = usuario.estado;
        document.getElementById("paisUsuario").innerText = usuario.pais;
        document.getElementById("bioUsuario").innerText = usuario.bio;

        // Atualiza as imagens de perfil e capa
        document.getElementById("fotoPerfil").src = usuario.foto_perfil ? usuario.foto_perfil : "assets/images/users/avatar-1.jpg";
        document.getElementById("fotoCapa").src = usuario.foto_capa ? usuario.foto_capa : "assets/images/profile-bg.jpg";

    } catch (error) {
        console.error("🔥 Erro ao carregar o perfil:", error);
        alert("Erro ao carregar os dados. Faça login novamente.");
        window.location.href = "login.html";
    }
});
