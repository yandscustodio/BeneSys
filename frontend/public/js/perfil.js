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
        document.getElementById("funcao2").value = usuario.funcao || "";
        document.getElementById("funcao1").value = usuario.funcao || "";
        document.getElementById("unidade").value = usuario.unidade || "";
        document.getElementById("bio").value = usuario.bio || "";
        document.getElementById("instagram").value = usuario.link_instagram || "";
        document.getElementById("linkedin").value = usuario.link_linkedin || "";
        document.getElementById("facebook").value = usuario.link_facebook || "";

        // 🔹 Carregar os países no dropdown
        await carregarPaises();

        // 🔹 Definir o país selecionado e carregar estados automaticamente
        if (usuario.pais) {
            document.getElementById("pais").value = usuario.pais;
            await carregarEstados(usuario.pais);
        }

        // 🔹 Definir o estado selecionado e carregar cidades automaticamente
        if (usuario.estado) {
            document.getElementById("estado").value = usuario.estado;
            await carregarCidades(usuario.estado);
        }

        // 🔹 Definir a cidade selecionada
        if (usuario.cidade) {
            document.getElementById("cidade").value = usuario.cidade;
        }

    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        alert("Erro ao carregar os dados. Faça login novamente.");
        window.location.href = "login.html";
    }
});

/**
 * Função para carregar os países no dropdown
 */
async function carregarPaises() {
    try {
        const response = await fetch("/paises");
        if (!response.ok) throw new Error("Erro ao buscar países");

        const paises = await response.json();
        const selectPais = document.getElementById("pais");

        selectPais.innerHTML = '<option value="">Selecione um país</option>';
        paises.forEach(pais => {
            selectPais.innerHTML += `<option value="${pais.id}">${pais.nome}</option>`;
        });

        // Adiciona evento para carregar os estados ao selecionar um país
        selectPais.addEventListener("change", async function () {
            const idPais = this.value;
            if (idPais) {
                await carregarEstados(idPais);
            } else {
                document.getElementById("estado").innerHTML = '<option value="">Selecione um estado</option>';
                document.getElementById("cidade").innerHTML = '<option value="">Selecione uma cidade</option>';
            }
        });

    } catch (error) {
        console.error("Erro ao carregar países:", error);
    }
}

/**
 * Função para carregar os estados no dropdown com base no país selecionado
 */
async function carregarEstados(idPais) {
    try {
        const response = await fetch(`/estados/${idPais}`);
        if (!response.ok) throw new Error("Erro ao buscar estados");

        const estados = await response.json();
        const selectEstado = document.getElementById("estado");

        selectEstado.innerHTML = '<option value="">Selecione um estado</option>';
        estados.forEach(estado => {
            selectEstado.innerHTML += `<option value="${estado.id}">${estado.nome}</option>`;
        });

        // Adiciona evento para carregar as cidades ao selecionar um estado
        selectEstado.addEventListener("change", async function () {
            const idEstado = this.value;
            if (idEstado) {
                await carregarCidades(idEstado);
            } else {
                document.getElementById("cidade").innerHTML = '<option value="">Selecione uma cidade</option>';
            }
        });

    } catch (error) {
        console.error("Erro ao carregar estados:", error);
    }
}

/**
 * Função para carregar as cidades no dropdown com base no estado selecionado
 */
async function carregarCidades(idEstado) {
    try {
        const response = await fetch(`/cidades/${idEstado}`);
        if (!response.ok) throw new Error("Erro ao buscar cidades");

        const cidades = await response.json();
        const selectCidade = document.getElementById("cidade");

        selectCidade.innerHTML = '<option value="">Selecione uma cidade</option>';
        cidades.forEach(cidade => {
            selectCidade.innerHTML += `<option value="${cidade.id}">${cidade.nome}</option>`;
        });

    } catch (error) {
        console.error("Erro ao carregar cidades:", error);
    }
}

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

// 🚀 Captura o clique no botão "Atualizar"
document.getElementById("btnAtualizar").addEventListener("click", async function () {
    const dadosAtualizados = {
        primeiro_nome: document.getElementById("primeiro_nome").value.trim(),
        ultimo_nome: document.getElementById("ultimo_nome").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        email: document.getElementById("email").value.trim(),
        data_admissao: document.getElementById("data_admissao").value.trim() || null,
        matricula: document.getElementById("matricula").value.trim(),
        cpf: document.getElementById("cpf").value.trim(),
        funcao: document.getElementById("funcao1").value.trim(),
        unidade: document.getElementById("unidade").value.trim(),
        cidade: document.getElementById("cidade").value.trim(),
        estado: document.getElementById("estado").value.trim(),
        pais: document.getElementById("pais").value.trim(),
        bio: document.getElementById("bio").value.trim(),
        link_instagram: document.getElementById("instagram").value.trim(),
        link_linkedin: document.getElementById("linkedin").value.trim(),
        link_facebook: document.getElementById("facebook").value.trim()
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
