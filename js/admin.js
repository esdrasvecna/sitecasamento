import { db } from "./firebase.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/**
 * ADMIN (opção 1 - senha simples)
 * - Guarda flag no localStorage: "siteAdmin" = "1"
 * - A senha fica no front (não é segurança forte).
 *   Para casamento, costuma ser suficiente. Depois dá pra migrar pra Auth.
 */

// MUDE A SENHA AQUI:
const ADMIN_PASSWORD = "TROQUE-ESSA-SENHA";

const els = {
  loginBox: document.getElementById("loginBox"),
  appBox: document.getElementById("appBox"),
  pass: document.getElementById("adminPass"),
  btnLogin: document.getElementById("btnLogin"),
  loginStatus: document.getElementById("loginStatus"),

  btnNew: document.getElementById("btnNew"),
  btnLogout: document.getElementById("btnLogout"),

  formBox: document.getElementById("formBox"),
  formTitle: document.getElementById("formTitle"),
  giftForm: document.getElementById("giftForm"),
  formStatus: document.getElementById("formStatus"),

  docId: document.getElementById("docId"),
  title: document.getElementById("title"),
  price: document.getElementById("price"),
  category: document.getElementById("category"),
  imageUrl: document.getElementById("imageUrl"),
  imgPreview: document.getElementById("imgPreview"),
  checkoutUrl: document.getElementById("checkoutUrl"),
  active: document.getElementById("active"),
  purchased: document.getElementById("purchased"),

  btnCancel: document.getElementById("btnCancel"),
  btnDelete: document.getElementById("btnDelete"),

  listStatus: document.getElementById("listStatus"),
  adminList: document.getElementById("adminList"),
};

function setAdmin(on) {
  if (on) localStorage.setItem("siteAdmin", "1");
  else localStorage.removeItem("siteAdmin");
}

function isAdmin() {
  return localStorage.getItem("siteAdmin") === "1";
}

function showApp() {
  els.loginBox.classList.add("admin-hidden");
  els.appBox.classList.remove("admin-hidden");
}

function showLogin() {
  els.loginBox.classList.remove("admin-hidden");
  els.appBox.classList.add("admin-hidden");
}

function clearForm() {
  els.docId.value = "";
  els.title.value = "";
  els.price.value = "";
  els.category.value = "";
  els.imageUrl.value = "";
  els.checkoutUrl.value = "";
  els.active.checked = true;
  els.purchased.checked = false;
  els.formStatus.textContent = "";
  els.btnDelete.style.display = "none";
  updatePreview();
}

function updatePreview() {
  const url = (els.imageUrl.value || "").trim();
  if (!url) {
    els.imgPreview.removeAttribute("src");
    els.imgPreview.style.display = "none";
    return;
  }
  els.imgPreview.src = url;
  els.imgPreview.style.display = "block";
}

function openForm(mode = "new") {
  els.formBox.classList.remove("admin-hidden");
  els.formTitle.textContent = mode === "edit" ? "Editar presente" : "Novo presente";
}

function closeForm() {
  els.formBox.classList.add("admin-hidden");
  clearForm();
}

function money(v){
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
  } catch {
    return `R$ ${n.toFixed(2)}`;
  }
}

let cache = [];

async function loadList() {
  els.listStatus.textContent = "Carregando itens...";
  try {
    const qy = query(collection(db, "gifts"), orderBy("createdAt", "desc"));
    const snap = await getDocs(qy);
    cache = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    els.adminList.innerHTML = cache.map(item => {
      const purchased = item.purchased ? "✅ Comprado" : "Disponível";
      const active = item.active ? "Ativo" : "Inativo";
      return `
        <button class="admin-item" type="button" data-id="${item.id}">
          <div class="admin-item-row">
            <div>
              <div class="admin-item-title">${item.title || "Sem título"}</div>
              <div class="admin-item-sub">${money(item.price)} • ${item.category || "Sem categoria"} • ${active} • ${purchased}</div>
            </div>
            <div class="admin-item-cta">Editar</div>
          </div>
        </button>
      `;
    }).join("") || `<p class="p">Nenhum item cadastrado ainda.</p>`;

    els.adminList.querySelectorAll("[data-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const item = cache.find(x => x.id === id);
        if (!item) return;

        els.docId.value = item.id;
        els.title.value = item.title || "";
        els.price.value = item.price ?? "";
        els.category.value = item.category || "";
        els.imageUrl.value = item.imageUrl || "";
        els.checkoutUrl.value = item.checkoutUrl || "";
        els.active.checked = !!item.active;
        els.purchased.checked = !!item.purchased;

        els.btnDelete.style.display = "inline-flex";
        openForm("edit");
        updatePreview();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    els.listStatus.textContent = "";
  } catch (err) {
    console.error(err);
    els.listStatus.textContent = "Erro ao carregar. Verifique Firebase/Firestore e índices.";
  }
}

els.imageUrl.addEventListener("input", updatePreview);

els.btnLogin.addEventListener("click", () => {
  const v = (els.pass.value || "").trim();
  if (v !== ADMIN_PASSWORD) {
    els.loginStatus.textContent = "Senha incorreta.";
    return;
  }
  setAdmin(true);
  els.loginStatus.textContent = "";
  showApp();
  loadList();
});

els.btnLogout.addEventListener("click", () => {
  setAdmin(false);
  showLogin();
});

els.btnNew.addEventListener("click", () => {
  clearForm();
  openForm("new");
});

els.btnCancel.addEventListener("click", () => {
  closeForm();
});

els.giftForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  els.formStatus.textContent = "Salvando...";

  const payload = {
    title: (els.title.value || "").trim(),
    price: Number(els.price.value || 0),
    category: (els.category.value || "").trim(),
    imageUrl: (els.imageUrl.value || "").trim(),
    checkoutUrl: (els.checkoutUrl.value || "").trim(),
    active: !!els.active.checked,
    purchased: !!els.purchased.checked,
  };

  if (!payload.title) { els.formStatus.textContent = "Preencha o nome do item."; return; }
  if (!payload.checkoutUrl) { els.formStatus.textContent = "Cole o link do Mercado Pago."; return; }

  try {
    const id = (els.docId.value || "").trim();

    if (!id) {
      payload.createdAt = serverTimestamp();
      await addDoc(collection(db, "gifts"), payload);
      els.formStatus.textContent = "Criado com sucesso!";
    } else {
      await updateDoc(doc(db, "gifts", id), payload);
      els.formStatus.textContent = "Atualizado com sucesso!";
    }

    await loadList();
    setTimeout(() => closeForm(), 400);
  } catch (err) {
    console.error(err);
    els.formStatus.textContent = "Erro ao salvar. Verifique regras do Firestore.";
  }
});

els.btnDelete.addEventListener("click", async () => {
  const id = (els.docId.value || "").trim();
  if (!id) return;

  const ok = confirm("Excluir este presente? Isso não pode ser desfeito.");
  if (!ok) return;

  els.formStatus.textContent = "Excluindo...";
  try {
    await deleteDoc(doc(db, "gifts", id));
    await loadList();
    closeForm();
  } catch (err) {
    console.error(err);
    els.formStatus.textContent = "Erro ao excluir.";
  }
});

// Boot
if (isAdmin()) {
  showApp();
  loadList();
} else {
  showLogin();
}
