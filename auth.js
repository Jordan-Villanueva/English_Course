// ===== Helpers =====
// Conectar elementos del DOM
const loginBtn  = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const homeBtn   = document.getElementById("home-btn"); // si existe
const content   = document.getElementById("content");

// Detectar si estamos en index.html
const onHomePage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";


// ===== Inicializar app =====
async function initApp() {
  let tokenValid = false;

  // Configurar evento de logout (funciona en todas las páginas)
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = REDIRECT_URI; // Redirigir al home después de logout
    };
  }

  // Configurar evento de home (funciona en todas las páginas)
  if (homeBtn) {
    homeBtn.onclick = () => {
      window.location.href = REDIRECT_URI;
    };
  }

  // Configurar evento de login (funciona en todas las páginas)
	if (loginBtn) {
	  loginBtn.onclick = () => {
	    // Siempre guardar a dónde quería ir el usuario
	    localStorage.setItem("redirectAfterLogin", window.location.href);

	    const authUrl = `https://${AUTH0_DOMAIN}/authorize?response_type=token&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email`;
	    window.location.href = authUrl;
	  };
	}

  // Parsear hash primero (para manejar redirección de Auth0) - funciona en todas las páginas
  if (parseHash()) {
    const token = localStorage.getItem("access_token");
    tokenValid = token ? await validateToken(token) : false;
  } else if (localStorage.getItem("access_token")) {
    const token = localStorage.getItem("access_token");
    tokenValid = await validateToken(token);
  }

  // Actualizar UI según autenticación - funciona en todas las páginas
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
            <li><a href="Class1/index.html" class="class-link">Class 1: Introductions, Greetings, and Farewells</a></li>
            <li><a href="Class2/index.html" class="class-link">Class 2: Personal Information</a></li>
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
      if (mainContent) {
        mainContent.innerHTML = `
          <div style="text-align: center; padding: 40px;">
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
