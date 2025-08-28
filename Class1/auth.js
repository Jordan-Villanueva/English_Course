const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const content = document.getElementById("content");
const AUTH0_DOMAIN = "dev-bjoqtux6wua5w2l2.us.auth0.com";
const AUTH0_CLIENT_ID = "ZcgIAj7vMvtUixpX421Jv6gs4YrakeC7";

// Ajusta redirect según la página
const REDIRECT_URI = window.location.origin + "/index.html"; 

loginBtn.onclick = () => {
  const authUrl = `https://${AUTH0_DOMAIN}/authorize?response_type=token&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile`;
  window.location.href = authUrl;
};

logoutBtn.onclick = () => {
  localStorage.removeItem("access_token");
  showLoggedOut();
};

function parseHash() {
  if (window.location.hash) {
    const hash = window.location.hash.substr(1).split("&").reduce((res, item) => {
      const parts = item.split("=");
      res[parts[0]] = decodeURIComponent(parts[1]);
      return res;
    }, {});
    if (hash.access_token) {
      localStorage.setItem("access_token", hash.access_token);
      window.location.hash = "";
      return true;
    }
  }
  return false;
}

function showLoggedOut() {
  // Página de inicio
  if (window.location.pathname === "/" || window.location.pathname.endsWith("index.html")) {
    content.innerHTML = "<p>Por favor, inicia sesión para acceder al curso.</p>";
  } else {
    content.style.display = "none";
  }
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
}

function showContent() {
  loginBtn.style.display = "none";
  logoutBtn.style.display = "inline-block";

  // Página de inicio
  if (window.location.pathname === "/" || window.location.pathname.endsWith("index.html")) {
    content.innerHTML = `
      <section>
        <h2>Clases disponibles</h2>
        <ul>
          <li><a href="Class1/index.html">Clase 1: Presentaciones, saludos y despedidas</a></li>
          <li><a href="Class2/index.html">Clase 2: (próximamente)</a></li>
        </ul>
      </section>
    `;
  } else {
    // Página de clase
    content.style.display = "block";

    // Botón para volver a inicio
    let inicioBtn = document.getElementById("inicio-btn");
    if (!inicioBtn) {
      inicioBtn = document.createElement("button");
      inicioBtn.id = "inicio-btn";
      inicioBtn.textContent = "🏠 Volver a inicio";
      inicioBtn.style.margin = "10px";
      inicioBtn.style.padding = "10px 20px";
      inicioBtn.style.border = "none";
      inicioBtn.style.borderRadius = "5px";
      inicioBtn.style.backgroundColor = "#0077cc";
      inicioBtn.style.color = "white";
      inicioBtn.style.cursor = "pointer";
      inicioBtn.onclick = () => window.location.href = window.location.origin;
      document.body.insertBefore(inicioBtn, content);
    }
  }
}

if (parseHash() || localStorage.getItem("access_token")) {
  showContent();
} else {
  showLoggedOut();
}
