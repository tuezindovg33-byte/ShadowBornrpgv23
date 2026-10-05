// ===================================================================
// Conta do jogador: cadastro, login, perfil e (se for admin) gestão de
// usuários — tudo falando com o backend Google Apps Script.
// ===================================================================

// Cole aqui a URL do seu Apps Script (termina em /exec) depois de implantar.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxJiFTofdefPHtU90E6IxrmgjS96J0VZbKSlJI7zxIOtf9kB0BTWa6Cun4nqcQq6EcoQ/exec";

const SESSION_KEY = "jogoDeLuta_session_v1";

function isBackendConfigured() {
    return typeof APPS_SCRIPT_URL === "string" && APPS_SCRIPT_URL.trim().length > 0;
}

function loadSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function persistSession() {
    try {
        if (currentUser) {
            // 🔥 NUNCA SALVA A SENHA NO LOCALSTORAGE
            const userToSave = {
                id: currentUser.id,
                sessionToken: currentUser.sessionToken,
                nome: currentUser.nome,
                email: currentUser.email,
                role: currentUser.role,
                moedas: currentUser.moedas,
                dadosJogo: currentUser.dadosJogo
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(userToSave));
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
    } catch (e) {
        console.error("Não foi possível salvar a sessão:", e);
    }
}

let currentUser = loadSession();

// Envia uma ação para o backend.
async function apiCall(action, payload) {
    if (!isBackendConfigured()) {
        return { sucesso: false, mensagem: "O backend ainda não foi conectado. (Configure APPS_SCRIPT_URL em js/account.js)" };
    }
    try {
        // 🔥 NUNCA ENVIA A SENHA EM LOG
        const payloadToSend = { ...payload };
        if (payloadToSend.senha) {
            payloadToSend.senha = "********"; // 🔥 MASCARA A SENHA NO LOG
        }
        console.log(`📤 Enviando ação: ${action}`, payloadToSend);
        
        const res = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(Object.assign({ action, sessionToken: currentUser?.sessionToken }, payload)),
            redirect: "follow"
        });
        const raw = await res.text();
        if (!res.ok) {
            console.error("Backend HTTP", res.status, raw);
            return { sucesso: false, mensagem: `Servidor respondeu HTTP ${res.status}. Atualize a implantação do Apps Script.` };
        }
        try { const result=JSON.parse(raw);window.ShadowSite?.receive(result);return result; }
        catch (e) {
            console.error("Resposta não-JSON do backend:", raw);
            return { sucesso: false, mensagem: "O Web App não devolveu JSON. Verifique a implantação /exec e as permissões." };
        }
    } catch (err) {
        console.error("Erro de rede ao falar com o backend:", err);
        return { sucesso: false, mensagem: "Não foi possível conectar ao servidor. Verifique sua internet." };
    }
}

let inventoryBaseV16 = {};
function receiveInventoryDropsV16(drops){for(const d of drops)inventoryBaseV16[d.itemId]=(inventoryBaseV16[d.itemId]||0)+d.qty;}

// Aplica o perfil vindo do servidor ao estado local do jogo
function applyServerProfileToLocalState(profile) {
    if (!profile) return;
    if (typeof profile.moedas === "number") saveData.coins = profile.moedas;
    if (profile.dadosJogo && profile.dadosJogo.levels) {
        saveData.levels = Object.assign({ health: 0, damage: 0, speed: 0 }, profile.dadosJogo.levels);
    }
    if (currentUser && profile.id === currentUser.id) { currentUser = {...currentUser,...profile,sessionToken:currentUser.sessionToken}; persistSession(); }
    window.ShadowEquipment?.setProfile(profile);
    window.ShadowRaids?.setProfile(profile);
    inventoryBaseV16={...(profile.dadosJogo?.inventory?.items||{})};
    window.ShadowV9?.setInventory(profile.dadosJogo?.inventory||{items:{}});
    if (profile.dadosJogo?.rpg) window.ShadowRPG?.setData(profile.dadosJogo.rpg);
    window.ShadowCommunity?.setProfile(profile);
    persistSave();
    if (typeof updateWalletDisplays === "function") updateWalletDisplays();
}

let syncTimeout = null;
let progressQueue = Promise.resolve();
function scheduleProgressSync() {
    if (!currentUser || !isBackendConfigured()) return;
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(()=>{flushProgressSync().catch(()=>{});},1500);
}
async function flushProgressSync() {
    clearTimeout(syncTimeout); syncTimeout=null;
    if (!currentUser) return;
    const id=currentUser.id;
    const snapshot={userID:id,tradeEpoch:Number(currentUser.dadosJogo?.tradeV22?.epoch)||0,moedas:saveData.coins,dadosJogo:{levels:saveData.levels,rpg:window.ShadowRPG?.getData(),inventory:JSON.parse(JSON.stringify(window.ShadowV9?.getInventory()||{items:{}}))}};
    progressQueue=progressQueue.catch(()=>{}).then(async()=>{snapshot.inventoryBase={...inventoryBaseV16};const result=await apiCall('salvarProgresso',snapshot);if(!result?.sucesso){if(result?.code==='TRADE_PROFILE_CHANGED'&&result.dados&&currentUser?.id===id)applyServerProfileToLocalState(result.dados);throw Error(result?.mensagem||'Não foi possível salvar o progresso.');}if(result.inventory&&currentUser?.id===id){const current=window.ShadowV9?.getInventory()?.items||{},sent=snapshot.dadosJogo.inventory?.items||{},merged={...result.inventory.items};for(const key of new Set([...Object.keys(current),...Object.keys(sent)]))merged[key]=Math.max(0,(merged[key]||0)+(current[key]||0)-(sent[key]||0));inventoryBaseV16={...result.inventory.items};window.ShadowV9?.setInventory({items:merged});}return result;});
    return progressQueue;
}

// ---- Cadastro / Login / Logout ----

async function doRegister() {
    const nome = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const senha = document.getElementById("register-password").value;
    const errorEl = document.getElementById("register-error");
    errorEl.textContent = "";

    if (!nome || !email || !senha) {
        errorEl.textContent = "Preenche todos os campos!";
        return;
    }

    if (senha.length < 4) {
        errorEl.textContent = "A senha deve ter pelo menos 4 caracteres!";
        return;
    }

    const submitBtn = document.getElementById("register-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Cadastrando...";

    try {
        // 🔥 NUNCA LOG A SENHA
        console.log("📝 Tentando cadastrar:", { nome, email, senha: "********" });
        
        const res = await apiCall("cadastro", { nome, email, senha });

        submitBtn.disabled = false;
        submitBtn.textContent = "Criar Conta";

        if (!res.sucesso) {
            errorEl.textContent = res.mensagem;
            return;
        }

        // 🔥 NUNCA ARMAZENA A SENHA
        if (currentUser && currentUser.id !== res.dados.id) {
            clearTimeout(syncTimeout); saveData=defaultSave();
            window.ShadowV9?.setInventory({items:{}}); window.ShadowRPG?.setData({});
        }
        currentUser = res.dados;
        // Remove qualquer campo de senha que possa vir do backend
        if (currentUser.senha) delete currentUser.senha;
        if (currentUser.Senha) delete currentUser.Senha;
        if (currentUser.senhaHash) delete currentUser.senhaHash;
        
        persistSession();
        applyServerProfileToLocalState(res.dados);
        syncAccountUI();
        showTitle();window.ShadowCommunity?.tutorial();
        
        console.log("✅ Cadastro realizado com sucesso para:", email);
        
    } catch (err) {
        console.error("❌ Erro no cadastro:", err);
        errorEl.textContent = "Erro ao cadastrar. Tente novamente.";
        submitBtn.disabled = false;
        submitBtn.textContent = "Criar Conta";
    }
}

async function doLogin() {
    const email = document.getElementById("login-email").value.trim();
    const senha = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");
    errorEl.textContent = "";

    if (!email || !senha) {
        errorEl.textContent = "Preenche email e senha!";
        return;
    }

    const submitBtn = document.getElementById("login-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Entrando...";

    try {
        // 🔥 NUNCA LOG A SENHA
        console.log("🔑 Tentando login:", { email, senha: "********" });
        
        const res = await apiCall("login", { email, senha });

        submitBtn.disabled = false;
        submitBtn.textContent = "Entrar";

        if (!res.sucesso) {
            errorEl.textContent = res.mensagem;
            return;
        }

        // 🔥 NUNCA ARMAZENA A SENHA
        if (currentUser && currentUser.id !== res.dados.id) {
            clearTimeout(syncTimeout); saveData=defaultSave();
            window.ShadowV9?.setInventory({items:{}}); window.ShadowRPG?.setData({});
        }
        currentUser = res.dados;
        // Remove qualquer campo de senha que possa vir do backend
        if (currentUser.senha) delete currentUser.senha;
        if (currentUser.Senha) delete currentUser.Senha;
        if (currentUser.senhaHash) delete currentUser.senhaHash;
        
        persistSession();
        applyServerProfileToLocalState(res.dados);
        syncAccountUI();
        showTitle();window.ShadowCommunity?.tutorial();
        
        console.log("✅ Login realizado com sucesso para:", email);
        
    } catch (err) {
        console.error("❌ Erro no login:", err);
        errorEl.textContent = "Erro ao fazer login. Tente novamente.";
        submitBtn.disabled = false;
        submitBtn.textContent = "Entrar";
    }
}

function doLogout() {
    window.ShadowCommunity?.reset();
    clearTimeout(syncTimeout);
    window.ShadowEquipment?.resetCombat();
    window.ShadowRaids?.reset();
    inventoryBaseV16={};
    currentUser = null;
    saveData=defaultSave();persistSave();
    window.ShadowV9?.setInventory({items:{}});window.ShadowRPG?.setData({});
    persistSession();
    syncAccountUI();
    showTitle();
    console.log("👋 Logout realizado");
}

// Mostra/esconde o botão de Admin e o texto "Entrar"/nome do jogador no menu
function syncAccountUI() {
    const accountBtn = document.getElementById("account-btn-menu");
    const adminBtn = document.getElementById("admin-btn-menu");

    if (accountBtn) {
        accountBtn.textContent = currentUser ? `👤 ${currentUser.nome}` : "👤 Entrar / Cadastrar";
    }
    if (adminBtn) {
        adminBtn.classList.toggle("hidden", !(currentUser && currentUser.role === "admin"));
    }
}

function accountSafeV23(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderProfile() {
    const el = document.getElementById("profile-content");
    if (!el) return;

    if (!currentUser) {
        el.innerHTML = '<p class="admin-empty-note">Você não está logado.</p>';
        return;
    }

    // 🔥 NUNCA MOSTRA A SENHA NO PERFIL
    el.innerHTML = `
        <div class="profile-avatar"><img src="${accountSafeV23(currentUser.dadosJogo?.v23?.profile?.avatar||'./assets/ui-v19/user.svg')}" alt="Foto de perfil"></div>
        <h3>${accountSafeV23(currentUser.nome)}</h3>
        <p class="profile-email">${accountSafeV23(currentUser.email)}</p>
        ${currentUser.role === "admin" ? '<span class="admin-tag admin-tag-gold">Administrador</span>' : ""}
        <div class="profile-stat"><span class="hud-icon">🪙</span> ${saveData.coins} moedas</div>
        <p class="profile-note">Seu progresso (moedas e upgrades) fica salvo na nuvem e sincroniza em qualquer aparelho que você entrar com essa conta.</p>
    `;
}

// ---- Painel de Admin: gestão de usuários ----

async function renderAdminUsersList() {
    const el = document.getElementById("admin-users-list");
    if (!el || !currentUser) return;
    el.innerHTML = '<p class="admin-empty-note">Carregando...</p>';

    try {
        const res = await apiCall("listarUsuarios", { adminID: currentUser.id });

        if (!res.sucesso) {
            el.innerHTML = `<p class="admin-empty-note">${accountSafeV23(res.mensagem)}</p>`;
            return;
        }

        if (!res.dados || res.dados.length === 0) {
            el.innerHTML = '<p class="admin-empty-note">Nenhum usuário cadastrado.</p>';
            return;
        }

        el.innerHTML = "";
        res.dados.forEach(u => {
            const row = document.createElement("div");
            row.className = "admin-list-item";
            row.innerHTML = `
                <div class="admin-list-info">
                    <strong>${u.role === "admin" ? "👑 " : ""}${accountSafeV23(u.nome)}</strong>
                    <span>${accountSafeV23(u.email)} · Lv. ${Number(u.level)||1} · 🪙 ${u.moedas} · 💎 ${u.diamonds||0}</span>
                </div>
                <button class="btn btn-ghost admin-grant-btn" data-id="${accountSafeV23(u.id)}">+50🪙</button>
                <button class="btn btn-ghost admin-diamonds-btn" data-id="${accountSafeV23(u.id)}" data-balance="${u.diamonds||0}">💎 Diamantes</button>
                <button class="btn btn-ghost admin-toggle-role-btn" data-id="${accountSafeV23(u.id)}" data-role="${accountSafeV23(u.role)}">${u.role === "admin" ? "Rebaixar" : "Promover"}</button>
            `;
            el.appendChild(row);
        });

        el.querySelectorAll(".admin-grant-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                try {
                    btn.disabled = true;
                    btn.textContent = "...";
                    await apiCall("concederMoedas", { 
                        adminID: currentUser.id, 
                        targetID: btn.dataset.id, 
                        quantidade: 50 
                    });
                    renderAdminUsersList();
                } catch (err) {
                    console.error("❌ Erro ao conceder moedas:", err);
                    btn.disabled = false;
                    btn.textContent = "+50🪙";
                }
            });
        });

        el.querySelectorAll('.admin-diamonds-btn').forEach(btn=>btn.addEventListener('click',async()=>{
            const amount=prompt('Novo saldo total de diamantes:',btn.dataset.balance);if(amount===null)return;
            if(!/^\d+$/.test(amount)){alert('Informe um número inteiro positivo ou zero.');return;}
            btn.disabled=true;
            const result=await apiCall('ajustarDiamantes',{adminID:currentUser.id,targetID:btn.dataset.id,quantidade:Number(amount),modo:'set'});
            if(!result?.sucesso)alert(result?.mensagem||'Falha ao ajustar diamantes.');
            if(result?.sucesso&&btn.dataset.id===currentUser.id)applyServerProfileToLocalState(result.dados);
            renderAdminUsersList();
        }));
        el.querySelectorAll(".admin-toggle-role-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                try {
                    btn.disabled = true;
                    btn.textContent = "...";
                    const novoRole = btn.dataset.role === "admin" ? "user" : "admin";
                    await apiCall("promoverAdmin", { 
                        adminID: currentUser.id, 
                        targetID: btn.dataset.id, 
                        novoRole 
                    });
                    renderAdminUsersList();
                } catch (err) {
                    console.error("❌ Erro ao promover/rebaixar:", err);
                    btn.disabled = false;
                    btn.textContent = btn.dataset.role === "admin" ? "Rebaixar" : "Promover";
                }
            });
        });
        
    } catch (err) {
        console.error("❌ Erro ao carregar lista de usuários:", err);
        el.innerHTML = '<p class="admin-empty-note">Erro ao carregar usuários.</p>';
    }
}

// ---- Funções auxiliares para limpar dados sensíveis ----

function clearSensitiveData() {
    // 🔥 Limpa qualquer dado sensível da memória
    if (currentUser) {
        if (currentUser.senha) delete currentUser.senha;
        if (currentUser.Senha) delete currentUser.Senha;
        if (currentUser.senhaHash) delete currentUser.senhaHash;
        if (currentUser.Salt) delete currentUser.Salt;
        persistSession();
    }
}

// 🔥 Chama a limpeza ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    clearSensitiveData();
    console.log("🔒 Dados sensíveis limpos da memória");
});

// 🔥 Limpa campos de senha após o uso
function clearPasswordFields() {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(field => {
        field.value = '';
    });
}

// 🔥 Adiciona limpeza após cadastro e login
const originalDoRegister = doRegister;
doRegister = async function() {
    await originalDoRegister();
    clearPasswordFields();
};

const originalDoLogin = doLogin;
doLogin = async function() {
    await originalDoLogin();
    clearPasswordFields();
};

console.log("🔒 Sistema de segurança ativado - Senhas protegidas");