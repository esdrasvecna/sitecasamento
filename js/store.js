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

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function money(v){
  try { return new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v); }
  catch { return `R$ ${Number(v).toFixed(2)}`; }
}

function renderCategories(items){
  const set = new Set(items.map(x => x.category).filter(Boolean));
  const opts = ['<option value="">Todas categorias</option>']
    .concat([...set].sort().map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`));
  els.cat.innerHTML = opts.join("");
}

function productCard(p){
  const img = p.imageUrl
    ? `<img class="img" src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title)}"/>`
    : `<div class="img"></div>`;

  const link = p.link && String(p.link).trim() ? String(p.link).trim() : "#";
  const pix = p.pix && String(p.pix).trim() ? String(p.pix).trim() : "";

  return `
    <article class="card product">
      ${img}
      <div class="body">
        <div class="meta">
          <div>
            <div class="badge">${escapeHtml(p.category || "Presente")}</div>
            <h3 style="margin:10px 0 6px">${escapeHtml(p.title || "Sem título")}</h3>
            <p class="p" style="margin:0">${escapeHtml(p.description || "")}</p>
          </div>
          <div class="price">${money(p.price || 0)}</div>
        </div>

        <div class="actions">
          <a class="btn btn-primary" href="${escapeHtml(link)}" target="_blank" rel="noreferrer" ${link==="#"?"aria-disabled=\"true\"":""}>
            Presentear
          </a>
          <button class="btn btn-ghost" data-copy="${escapeHtml(pix)}" type="button">
            Copiar Pix
          </button>
        </div>
      </div>
    </article>
  `;
}

function applyFilters(){
  const q = (els.q.value || "").trim().toLowerCase();
  const cat = els.cat.value || "";
  const sort = els.sort.value || "new";

  let items = [...all];

  if (cat) items = items.filter(x => (x.category || "") === cat);
  if (q) items = items.filter(x =>
    (x.title || "").toLowerCase().includes(q) ||
    (x.description || "").toLowerCase().includes(q)
  );

  if (sort === "price_asc") items.sort((a,b)=>(a.price||0)-(b.price||0));
  if (sort === "price_desc") items.sort((a,b)=>(b.price||0)-(a.price||0));
  if (sort === "title") items.sort((a,b)=>String(a.title||"").localeCompare(String(b.title||""), "pt-BR"));

  els.products.innerHTML = items.map(productCard).join("") || `<p class="p">Nenhum presente encontrado.</p>`;

  els.products.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async ()=>{
      const pix = btn.getAttribute("data-copy") || "";
      if (!pix) { alert("Pix não configurado para este item."); return; }
      try {
        await navigator.clipboard.writeText(pix);
        const old = btn.textContent;
        btn.textContent = "Pix copiado!";
        setTimeout(()=>btn.textContent = old, 1200);
      } catch {
        alert("Não consegui copiar automaticamente. Pix: " + pix);
      }
    });
  });
}

async function load(){
  els.status.textContent = "Carregando presentes...";
  try{
    const col = collection(db, "gifts");
    const qy = query(col, where("active","==", true), orderBy("createdAt","desc"));
    const snap = await getDocs(qy);
    all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCategories(all);
    applyFilters();
    els.status.textContent = "";
  }catch(err){
    console.error(err);
    els.status.textContent = "Erro ao carregar os presentes. Configure o Firebase em js/firebase.js e confira as regras do Firestore.";
  }
}

["input","change"].forEach(evt => {
  els.q?.addEventListener(evt, applyFilters);
  els.cat?.addEventListener(evt, applyFilters);
  els.sort?.addEventListener(evt, applyFilters);
});

load();
