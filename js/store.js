import { db } from "./firebase.js";
import {
  collection, getDocs, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const els = {
  q: document.getElementById("q"),
  cat: document.getElementById("cat"),
  sort: document.getElementById("sort"),
  status: document.getElementById("status"),
  products: document.getElementById("products"),
};

let all = [];

function money(v) {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  } catch {
    return `R$ ${n.toFixed(2)}`;
  }
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function renderCategories(items) {
  const set = new Set(items.map(x => x.category).filter(Boolean));
  const opts = ['<option value="">Todas categorias</option>']
    .concat([...set].sort().map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`));
  els.cat.innerHTML = opts.join("");
}

function openCheckout(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function productCard(p) {
  const title = escapeHtml(p.title || "Presente");
  const desc = escapeHtml(p.description || "");
  const cat = escapeHtml(p.category || "Presente");
  const imgUrl = p.imageUrl ? escapeHtml(p.imageUrl) : "";
  const purchased = Boolean(p.purchased);
  const checkoutUrl = String(p.checkoutUrl || "").trim();

  const price = money(p.price || 0);

  const statusBadge = purchased
    ? `<span class="badge badge-ok">Comprado ✅</span>`
    : `<span class="badge badge-available">Disponível</span>`;

  // Card clicável (se não estiver comprado)
  const clickableAttrs = (!purchased && checkoutUrl)
    ? `role="button" tabindex="0" data-open="${escapeHtml(checkoutUrl)}" aria-label="Abrir pagamento de ${title}"`
    : `aria-disabled="true"`;

  const img = imgUrl
    ? `<img class="img" src="${imgUrl}" alt="${title}"/>`
    : `<div class="img img-placeholder"></div>`;

  const disabledNote = purchased
    ? `<div class="p" style="margin-top:10px; color: rgba(40,30,20,.70)">Este item já foi presenteado 💛</div>`
    : "";

  const button = (!purchased && checkoutUrl)
    ? `<button class="btn btn-primary" type="button" data-open="${escapeHtml(checkoutUrl)}">Presentear (Pix ou cartão)</button>`
    : `<button class="btn btn-primary" type="button" disabled>Já comprado</button>`;

  return `
    <article class="card product ${purchased ? "is-bought" : ""}" ${clickableAttrs}>
      ${img}
      <div class="body">
        <div class="meta">
          <div>
            ${statusBadge}
            <div class="badge" style="margin-top:10px">${cat}</div>
            <h3 class="product-title">${title}</h3>
            ${desc ? `<p class="p" style="margin:0">${desc}</p>` : ""}
          </div>
          <div class="price">${price}</div>
        </div>

        <div class="actions" style="margin-top:12px">
          ${button}
        </div>

        ${disabledNote}
      </div>
    </article>
  `;
}

function applyFilters() {
  const q = (els.q?.value || "").trim().toLowerCase();
  const cat = els.cat?.value || "";
  const sort = els.sort?.value || "new";

  let items = [...all];

  if (cat) items = items.filter(x => (x.category || "") === cat);
  if (q) items = items.filter(x =>
    (x.title || "").toLowerCase().includes(q) ||
    (x.description || "").toLowerCase().includes(q)
  );

  if (sort === "price_asc") items.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sort === "price_desc") items.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sort === "title") items.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "pt-BR"));
  // "new" mantém a ordem de createdAt desc (query)

  els.products.innerHTML = items.map(productCard).join("") || `<p class="p">Nenhum presente encontrado.</p>`;

  // Clique no card ou no botão "Presentear"
  const openers = els.products.querySelectorAll("[data-open]");
  openers.forEach(el => {
    el.addEventListener("click", (e) => {
      // Evita abrir duas vezes quando clicar no botão dentro do card
      const btn = e.target.closest("button");
      const url = btn?.getAttribute("data-open") || el.getAttribute("data-open");
      if (url) openCheckout(url);
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const url = el.getAttribute("data-open");
        if (url) openCheckout(url);
      }
    });
  });
}

async function load() {
  els.status.textContent = "Carregando presentes...";
  try {
    const col = collection(db, "gifts");

    // IMPORTANTE: essa query exige índice em alguns projetos
    // where(active==true) + orderBy(createdAt desc)
    const qy = query(col, where("active", "==", true), orderBy("createdAt", "desc"));
    const snap = await getDocs(qy);

    all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCategories(all);
    applyFilters();
    els.status.textContent = "";
  } catch (err) {
    console.error(err);
    els.status.textContent = "Erro ao carregar. Verifique Firebase/Firestore e possíveis índices.";
  }
}

["input", "change"].forEach(evt => {
  els.q?.addEventListener(evt, applyFilters);
  els.cat?.addEventListener(evt, applyFilters);
  els.sort?.addEventListener(evt, applyFilters);
});

load();
