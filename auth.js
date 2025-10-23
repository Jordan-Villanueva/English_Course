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

  loginBtn.addEventListener("click", () => {
    localStorage.setItem("loggedIn", "true");
    showCourse();
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    showLogin();
  });

  function showCourse() {
    // Aquí agregamos la lista de clases reales
    content.innerHTML = `
      <ul>
        <li><a href="Class1/index.html">Class1</a></li>
        <li><a href="Class2/index.html">Class2</a></li>
        <li><a href="functions/check-user.js">Functions</a></li>
      </ul>
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
