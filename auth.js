const homeBtn = document.getElementById("home-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const content = document.getElementById("content");
const AUTH0_DOMAIN = "dev-bjoqtux6wua5w2l2.us.auth0.com";
const AUTH0_CLIENT_ID = "ZcgIAj7vMvtUixpX421Jv6gs4YrakeC7";

// Siempre redirigir al index general
const REDIRECT_URI = "https://elegant-frangipane-efce46.netlify.app";

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
      // Redirigir al menú general
      window.location.href = REDIRECT_URI;
      return true;
    }
  }
  return false;
}

function showLoggedOut() {
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
  if (homeBtn) homeBtn.style.display = "none";

  if (window.location.pathname === "/" || window.location.pathname.endsWith("index.html")) {
    content.innerHTML = "<p>Please log in to access the course.</p>";
  } else {
    content.style.display = "none";
  }
}

function showContent() {
  loginBtn.style.display = "none";
  logoutBtn.style.display = "inline-block";
  if (homeBtn) {
    homeBtn.style.display = "inline-block";
    homeBtn.onclick = () => {
      window.location.href = REDIRECT_URI;
    };
  }

  if (window.location.pathname === "/" || window.location.pathname.endsWith("index.html")) {
    content.innerHTML = `
      <section>
        <h2>Available Classes</h2>
        <ul>
          <li><a href="Class1/index.html">Class 1: Introductions, Greetings, and Farewells</a></li>
          <li><a href="Class2/index.html">Class 2: (coming soon)</a></li>
        </ul>
      </section>
    `;
  } else {
    content.style.display = "block";
  }
}

// Detecta token en localStorage
if (parseHash() || localStorage.getItem("access_token")) {
  showContent();
} else {
  showLoggedOut();
}
