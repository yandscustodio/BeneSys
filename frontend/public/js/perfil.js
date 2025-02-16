document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("/perfil", { credentials: "include" });
        if (!response.ok) {
            throw new Error("Erro ao carregar os dados");
        }

        const usuario = await response.json();

        // Preenchendo os campos do formulário com os dados do usuário logado
        document.getElementById("nomeCompleto").textContent = `${usuario.primeiro_nome} ${usuario.ultimo_nome}`;
        document.getElementById("primeiro_nome").value = usuario.primeiro_nome || "";
        document.getElementById("ultimo_nome").value = usuario.ultimo_nome || "";
        document.getElementById("telefone").value = formatarTelefone(usuario.telefone || "");
        document.getElementById("email").value = usuario.email || "";
        document.getElementById("data_admissao").value = usuario.data_admissao || "";
        document.getElementById("matricula").value = usuario.matricula || "";
        document.getElementById("cpf").value = usuario.cpf || "";
        document.getElementById("funcao").value = usuario.funcao || "";
        document.getElementById("unidade").value = usuario.unidade || "";
        document.getElementById("cidade").value = usuario.cidade || "";
        document.getElementById("estado").value = usuario.estado || "";
        document.getElementById("pais").value = usuario.pais || "";
        document.getElementById("bio").value = usuario.bio || "";
        document.getElementById("instagram").value = usuario.link_instagram || "";
        document.getElementById("linkedin").value = usuario.link_linkedin || "";
        document.getElementById("facebook").value = usuario.link_facebook || "";

    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        alert("Erro ao carregar os dados. Faça login novamente.");
        window.location.href = "login.html";
    }
});

/**
 * Função para formatar o telefone no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
function formatarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, ""); // Remove tudo que não for número

    if (telefone.length > 10) {
        return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3"); // Formato (XX) XXXXX-XXXX
    } else if (telefone.length > 6) {
        return telefone.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3"); // Formato (XX) XXXX-XXXX
    } else if (telefone.length > 2) {
        return telefone.replace(/^(\d{2})(\d{0,5})$/, "($1) $2"); // Formato (XX) XXXXX
    } else {
        return telefone; // Apenas o DDD
    }
}

// 🚀 Função para atualizar os dados do usuário ao clicar no botão "Atualizar"
document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const dadosAtualizados = {
        primeiro_nome: document.getElementById("primeiro_nome").value.trim(),
        ultimo_nome: document.getElementById("ultimo_nome").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        email: document.getElementById("email").value.trim(),
        data_admissao: document.getElementById("data_admissao").value.trim(),
        matricula: document.getElementById("matricula").value.trim(),
        cpf: document.getElementById("cpf").value.trim(),
        funcao: document.getElementById("funcao").value.trim(),
        unidade: document.getElementById("unidade").value.trim(),
        cidade: document.getElementById("cidade").value.trim(),
        estado: document.getElementById("estado").value.trim(),
        pais: document.getElementById("pais").value.trim(),
        bio: document.getElementById("bio").value.trim(),
    };

    try {
        const response = await fetch("/perfil", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include", // Garante que o cookie de autenticação seja enviado
            body: JSON.stringify(dadosAtualizados),
        });

        if (!response.ok) {
            throw new Error("Erro ao atualizar os dados.");
        }

        alert("Perfil atualizado com sucesso!");
        window.location.reload(); // Recarrega a página para refletir os novos dados
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert("Erro ao atualizar perfil. Tente novamente.");
    }
});
