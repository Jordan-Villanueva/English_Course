document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const content = document.getElementById("content");

  // Chequea si ya hay sesión iniciada
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  if (loggedIn) {
    showCourse();
  } else {
    showLogin();
  }

  // Evento de login
  loginBtn.addEventListener("click", () => {
    localStorage.setItem("loggedIn", "true");
    showCourse();
  });

  // Evento de logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    showLogin();
  });

  // ---- Funciones auxiliares ----
  function showCourse() {
    content.innerHTML = `
      <h2>Welcome to your English Course!</h2>
      <p>Lesson 1: Greetings and introductions.</p>
      <p>Example: "Hello! My name is Jordan."</p>
    `;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  }

  function showLogin() {
    content.innerHTML = `<p>Please log in to access the course.</p>`;
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});
