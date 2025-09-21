// auth.js (pegalo tal cual, actualiza constantes si hace falta)

// === Config (usa tus valores) ===
const AUTH0_DOMAIN = "dev-bjoqtux6wua5w2l2.us.auth0.com";
const AUTH0_CLIENT_ID = "ZcgIAj7vMvtUixpX421Jv6gs4YrakeC7";
// Debe coincidir EXACTAMENTE con lo que tienes en la app de Auth0 Allowed Callback URLs
const REDIRECT_URI = "https://elegant-frangipane-efce46.netlify.app";

// === Helpers ===
function buildAuthUrl() {
  const base = `https://${AUTH0_DOMAIN}/authorize`;
  const params = new URLSearchParams({
    response_type: "token",
    client_id: AUTH0_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "openid profile email"
  });
  return `${base}?${params.toString()}`;
}

/** parseHash: lee access_token del fragmento (#...) y lo guarda en localStorage */
function parseHash() {
  const hash = window.location.hash.slice(1); // elimina '#'
  if (!hash) return false;
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  if (accessToken) {
    console.log('[auth] parseHash: found access_token');
    localStorage.setItem('access_token', accessToken);
    // limpiar hash de la URL sin recargar
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
    return true;
  }
  return false;
}

/** validateToken: intenta /userinfo para verificar que el token sigue siendo válido */
async function validateToken(token) {
  if (!token) return false;
  try {
    const res = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[auth] validateToken status:', res.status);
    return res.ok;
  } catch (err) {
    console.warn('[auth] validateToken error:', err);
    return false;
  }
}

/** show a simple logged-out UI (index). */
function showLoggedOutUI(content, loginBtn, logoutBtn, homeBtn) {
  console.log('[auth] showLoggedOutUI');
  if (loginBtn) loginBtn.style.display = 'inline-block';
  if (logoutBtn) logoutBtn.style.display = 'none';
  if (homeBtn) homeBtn.style.display = 'none';
  if (content && (window.location.pathname === '/' || window.location.pathname.endsWith('index.html'))) {
    content.innerHTML = '<p>Please log in to access the course.</p>';
  }
}

/** show logged-in UI and optionally redirect to saved target */
function showLoggedInUI(content, loginBtn, logoutBtn, homeBtn) {
  console.log('[auth] showLoggedInUI');
  if (loginBtn) loginBtn.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = 'inline-block';
  if (homeBtn) homeBtn.style.display = 'inline-block';

  // Si estamos en la página principal, mostramos la lista de clases
  if (content && (window.location.pathname === '/' || window.location.pathname.endsWith('index.html'))) {
    content.innerHTML = `
      <section>
        <h2>Available Classes</h2>
        <ul>
          <li><a href="Class1/index.html" class="class-link">Class 1: Introductions, Greetings, and Farewells</a></li>
          <li><a href="Class2/index.html" class="class-link">Class 2: Personal Information</a></li>
        </ul>
      </section>
    `;
    // añadir listener a cada enlace para asegurar comportamiento: si no hay token -> redirige a login
    document.querySelectorAll('.class-link').forEach(link => {
      link.addEventListener('click', (ev) => {
        ev.preventDefault();
        const token = localStorage.getItem('access_token');
        if (token) {
          window.location.href = link.href;
        } else {
          localStorage.setItem('redirectAfterLogin', link.href);
          window.location.href = buildAuthUrl();
        }
      });
    });
  }

  // Si guardamos una redirección previa, ir a ella
  const redirectTo = localStorage.getItem('redirectAfterLogin');
  if (redirectTo) {
    console.log('[auth] redirectAfterLogin found ->', redirectTo);
    localStorage.removeItem('redirectAfterLogin');
    // redirigir solo si no estamos ya ahí
    if (window.location.href !== redirectTo) {
      window.location.href = redirectTo;
    }
  }
}

// === Inicializar app ===
async function initApp() {
  // Agarra elementos del DOM AQUI (asegura que existan)
  const loginBtn  = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const homeBtn   = document.getElementById('home-btn'); // opcional en tu header
  const content   = document.getElementById('content');

  console.log('[auth] initApp - location=', window.location.href);

  // Asignar handlers seguros
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // guarda la página actual (o la que quieras) para volver después
      localStorage.setItem('redirectAfterLogin', window.location.href);
      console.log('[auth] login clicked -> redirecting to Auth0');
      window.location.href = buildAuthUrl();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('access_token');
      localStorage.removeItem('redirectAfterLogin');
      console.log('[auth] logout clicked -> token removed');
      // Opcional: recarga a home
      window.location.href = REDIRECT_URI;
    });
  }

  if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = REDIRECT_URI;
    });
  }

  // 1) parseHash - si venimos de Auth0 con access_token en fragment -> guardarlo
  const handled = parseHash();

  // 2) validar token si existe
  const token = localStorage.getItem('access_token');
  let tokenValid = false;
  if (token) {
    tokenValid = await validateToken(token);
  }

  // 3) actualizar UI
  if (tokenValid) {
    showLoggedInUI(content, loginBtn, logoutBtn, homeBtn);
  } else {
    // si parseHash devolvió true pero token no validó, borra token
    if (handled && !tokenValid) {
      console.warn('[auth] token from hash is invalid, clearing stored token');
      localStorage.removeItem('access_token');
    }
    showLoggedOutUI(content, loginBtn, logoutBtn, homeBtn);
  }
}

// Ejecutar init cuando DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

