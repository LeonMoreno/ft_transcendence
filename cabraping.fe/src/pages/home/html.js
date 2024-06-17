// Ensure the correct path to the image
let image = "assets/game.png";

// Exporting the function to be used elsewhere
export function Home_html() {
  return `
  <div class="container mt-5 min-vh-100">
    <div class="row align-items-center">
      <!-- Image of Pong -->
      <div class="col-md-6">
        <img src="${image}" alt="Pong Game" class="img-fluid">
      </div>

      <!-- Description and Button -->
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

