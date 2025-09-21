// ===== Elementos de la página principal =====
const content = document.getElementById("content");

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

    // ===== Resto del código de auth.js (showLoggedOut, showContent, etc.) =====
    // ... (mantén el resto de las funciones pero asegúrate de que solo se ejecuten en la página principal)
}
