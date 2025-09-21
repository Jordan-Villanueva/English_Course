// ===== Auth0 Config =====
const AUTH0_DOMAIN = "dev-bjoqtux6wua5w2l2.us.auth0.com";
const AUTH0_CLIENT_ID = "ZcgIAj7vMvtUixpX421Jv6gs4YrakeC7";
const REDIRECT_URI = "https://elegant-frangipane-efce46.netlify.app";

// ===== Helpers =====
// Detectar si estamos en index.html
const onHomePage = window.location.pathname.endsWith("index.html") || 
                   window.location.pathname === "/" || 
                   window.location.pathname === "";

// ===== Parsear hash de Auth0 =====
function parseHash() {
  console.log("Checking for hash in URL...");
  if (window.location.hash) {
    console.log("Hash found:", window.location.hash);
    const hash = window.location.hash.substr(1).split("&").reduce((res, item) => {
      const parts = item.split("=");
      res[parts[0]] = decodeURIComponent(parts[1]);
      return res;
    }, {});
    
    if (hash.access_token) {
      console.log("Access token found, saving to localStorage");
      localStorage.setItem("access_token", hash.access_token);
      window.location.hash = "";
      
      // Redirigir a la página destino después de login exitoso
      const redirectTo = localStorage.getItem("redirectAfterLogin");
      if (redirectTo) {
        console.log("Redirecting to:", redirectTo);
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectTo;
        return true;
      } else {
        console.log("No redirect URL found, staying on current page");
      }
      
      return true;
    }
  }
  return false;
}

// ===== Validar token =====
async function validateToken(token) {
  try {
    console.log("Validating token...");
    const res = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) {
      console.log("Token is valid");
      return true;
    } else {
      console.log("Token validation failed");
      localStorage.removeItem("access_token");
      return false;
    }
  } catch (e) {
    console.warn("Error validating token:", e.message);
    localStorage.removeItem("access_token");
    return false;
  }
}

// ===== Inicializar app =====
async function initApp() {
  console.log("Initializing app...");
  
  // Conectar elementos del DOM
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const homeBtn = document.getElementById("home-btn");
  const content = document.getElementById("content");
  
  console.log("DOM elements:", {loginBtn, logoutBtn, homeBtn, content});

  let tokenValid = false;

  // Configurar evento de logout
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      console.log("Logout clicked");
      localStorage.removeItem("access_token");
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = REDIRECT_URI;
    };
  }

  // Configurar evento de home
  if (homeBtn) {
    homeBtn.onclick = () => {
      console.log("Home clicked");
      window.location.href = REDIRECT_URI;
    };
  }

  // Configurar evento de login
  if (loginBtn) {
    loginBtn.onclick = () => {
      console.log("Login clicked");
      // Guardar la página actual para redirección después del login
      localStorage.setItem("redirectAfterLogin", window.location.href);
      
      const authUrl = `https://${AUTH0_DOMAIN}/authorize?response_type=token&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20email`;
      console.log("Redirecting to Auth0:", authUrl);
      window.location.href = authUrl;
    };
  }

  // Parsear hash primero (para manejar redirección de Auth0)
  const hashParsed = parseHash();
  if (hashParsed) {
    const token = localStorage.getItem("access_token");
    tokenValid = token ? await validateToken(token) : false;
  } else if (localStorage.getItem("access_token")) {
    const token = localStorage.getItem("access_token");
    tokenValid = await validateToken(token);
  }

  console.log("Authentication status:", tokenValid ? "Authenticated" : "Not authenticated");

  // Actualizar UI según autenticación
  if (tokenValid) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (homeBtn) homeBtn.style.display = "inline-block";
    
    // Mostrar contenido solo en página principal
    if (onHomePage && content) {
      content.innerHTML = `
        <section>
          <h2>Available Classes</h2>
          <ul>
            <li><a href="Class1/index.html">Class 1: Introductions, Greetings, and Farewells</a></li>
            <li><a href="Class2/index.html">Class 2: Personal Information</a></li>
          </ul>
        </section>
      `;
    }
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (homeBtn) homeBtn.style.display = "none";
    
    // Mostrar mensaje solo en página principal
    if (onHomePage && content) {
      content.innerHTML = "<p>Please log in to access the course.</p>";
    }
    
    // Ocultar contenido en páginas de clase si no está autenticado
    if (!onHomePage) {
      const mainContent = document.querySelector('.main-content');
      if (mainContent && !document.querySelector('#auth-required-message')) {
        mainContent.innerHTML = `
          <div id="auth-required-message" style="text-align: center; padding: 40px;">
            <h2>Authentication Required</h2>
            <p>Please log in to access this class content.</p>
            <button onclick="localStorage.setItem('redirectAfterLogin', window.location.href); window.location.href = '${REDIRECT_URI}';" 
                    style="padding: 10px 20px; background: var(--primary); color: white; border: none; border-radius: 5px;">
              Go to Login
            </button>
          </div>
        `;
      }
    }
  }
}

// ===== Ejecutar en todas las páginas =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
