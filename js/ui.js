export function mountHeader(active = "inicio") {
  const el = document.getElementById("site-header");
  if (!el) return;

  const is = (k) => (active === k ? "active" : "");

  el.innerHTML = `
    <header class="topbar">
      <div class="container nav">
        <a class="brand" href="./index.html">
          <small>Site oficial</small>
          <b>Ingrid & Esdras</b>
        </a>
        <nav class="menu">
          <a class="${is("inicio")}" href="./index.html">Início</a>
          <a class="${is("presentes")}" href="./presentes.html">Presentes</a>
          <a class="${is("rsvp")}" href="#" onclick="alert('Confirmação de presença em breve 💛')">
            Confirmar presença
          </a>
        </nav>
      </div>
    </header>
  `;
}

export function mountFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;

  const year = new Date().getFullYear();
  el.innerHTML = `
    <footer class="footer">
      <div class="container">
        © Ingrid & Esdras • ${year} • Feito com carinho
      </div>
    </footer>
  `;
}
