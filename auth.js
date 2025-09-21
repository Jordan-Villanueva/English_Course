// ===== Elementos de la página principal =====
const content = document.getElementById("content");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const homeBtn = document.getElementById("home-btn");
// ===== Auth0 Config =====
const AUTH0_DOMAIN = "dev-bjoqtux6wua5w2l2.us.auth0.com";
const AUTH0_CLIENT_ID = "ZcgIAj7vMvtUixpX421Jv6gs4YrakeC7";
const REDIRECT_URI = "https://elegant-frangipane-efce46.netlify.app";

// ===== Helpers =====
const onHomePage = window.location.pathname === "/" || 
                   window.location.pathname.endsWith("index.html");

// Solo ejecutar en página principal
if (onHomePage) {
    // ===== Botones de la página principal =====
    const homeBtn = document.getElementById("home-btn");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");

    // ===== Configurar eventos =====
    if (loginBtn) {
        loginBtn.onclick = () => {
            const authUrl = `https://${AUTH0_DOMAIN}/authorize?response_type=token&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email`;
            window.location.href = authUrl;
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem("access_token");
            showLoggedOut();
        };
    }

    if (homeBtn) {
        homeBtn.onclick = () => {
            window.location.href = REDIRECT_URI;
        };
    }

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
      
      // Redirigir a Class1 después de login exitoso
      const redirectTo = localStorage.getItem("redirectAfterLogin");
      if (redirectTo) {
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectTo;
      }
      
      return true;
    }
  }
  return false;
}

// ===== Mostrar estado desconectado =====
function showLoggedOut() {
  if (loginBtn) loginBtn.style.display = "inline-block";
  if (logoutBtn) logoutBtn.style.display = "none";
  if (homeBtn) homeBtn.style.display = "none";

  if (onHomePage && content) {
    content.innerHTML = "<p>Please log in to access the course.</p>";
  }
}

// ===== Mostrar contenido para usuarios logueados =====
function showContent() {
  if (loginBtn) loginBtn.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "inline-block";
  if (homeBtn) homeBtn.style.display = "inline-block";

  if (onHomePage && content) {
    content.innerHTML = `
      <section>
        <h2>Available Classes</h2>
        <ul>
          <li><a href="Class1/index.html" class="class-link">Class 1: Introductions, Greetings, and Farewells</a></li>
          <li><a href="Class2/index.html" class="class-link">Class 2: Personal Information</a></li>
        </ul>
      </section>
    `;
    
    // Agregar event listeners a los enlaces de clase
    document.querySelectorAll('.class-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Guardar la página a la que queremos ir después del login
        localStorage.setItem("redirectAfterLogin", link.href);
        // Redirigir a Auth0 para login
        const authUrl = `https://${AUTH0_DOMAIN}/authorize?response_type=token&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email`;
        window.location.href = authUrl;
      });
    });
  }
}

// ===== Validar token =====
async function validateToken(token) {
  try {
    const res = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch (e) {
    console.warn("Error validating token:", e.message);
    localStorage.removeItem("access_token");
    return false;
  }
}

// ===== Inicializar app =====
async function initApp() {
  let tokenValid = false;

  // Configurar evento de logout
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("redirectAfterLogin");
      showLoggedOut();
    };
  }

  // Configurar evento de home
  if (homeBtn) {
    homeBtn.onclick = () => {
      window.location.href = REDIRECT_URI;
    };
  }

  // Parsear hash primero (para manejar redirección de Auth0)
  if (parseHash()) {
    const token = localStorage.getItem("access_token");
    tokenValid = token ? await validateToken(token) : false;
  } else if (localStorage.getItem("access_token")) {
    const token = localStorage.getItem("access_token");
    tokenValid = await validateToken(token);
  }

  if (tokenValid) {
    showContent();
  } else {
    showLoggedOut();
  }
}

// ===== Solo ejecutar en página principal =====
if (onHomePage) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
