document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const content = document.getElementById("content");

  const loggedIn = localStorage.getItem("loggedIn") === "true";

  if (loggedIn) {
    showCourse();
  } else {
    showLogin();
  }

  loginBtn?.addEventListener("click", () => {
    localStorage.setItem("loggedIn", "true");
    showCourse();
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    showLogin();
  });

  function showCourse() {
    content?.innerHTML = `
      <ul>
        <li><a href="Class1/index.html">Class1</a></li>
      </ul>
    `;
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  }

  function showLogin() {
    content?.innerHTML = `<p>Please log in to access the course.</p>`;
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});
