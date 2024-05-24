// import image from "../../assets/game.png";

let image = "assets/game.png";

export function Home_html() {
  return `
  <div class="container mt-5 min-vh-100">
    <div class="row align-items-center">
      <!-- Imagen de Pong -->
      <div class="col-md-6">
        <img src="${image}" alt="Pong Game" class="img-fluid">
      </div>

      <!-- Descripción y Botón -->
      <div class="col-md-6">
        <h1>CabraPing</h1>
        <p class="lead">Classic Pong: Bounce to Victory! Can you outmatch your opponent in this timeless arcade game of skill and reflexes?</p>
        <button id="button-auth" class="btn btn-warning">42 Auth</button>
        <a href="/#auth" class="btn btn-warning">Iniciar Sesión / Registrarse</a>
      </div>
    </div>
  </div>

  <script>
    function getQueryParams() {
      const params = new URLSearchParams(window.location.search);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      return { access_token, refresh_token };
    }

    function storeTokens(access_token, refresh_token) {
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
    }

    function handleLogin() {
      const { access_token, refresh_token } = getQueryParams();
      if (access_token && refresh_token) {
        storeTokens(access_token, refresh_token);
        window.history.replaceState({}, document.title, "/"); // Clean URL
        showNotification("Login successful", "success");
        // Optionally, update UI or state to reflect login status
      } else {
        showNotification("Login failed: No tokens found", "error");
      }
    }

    // Run the handleLogin function after the page content is loaded
    document.addEventListener("DOMContentLoaded", handleLogin);
  </script>
  `;
}
