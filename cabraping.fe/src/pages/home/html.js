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
        <a href="/#auth" class="btn btn-warning">Log In / Sign Up</a>
      </div>
    </div>
  </div>
  `;
}
