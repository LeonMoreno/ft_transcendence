import image from '../assets/game.png';

const Home = async () => {

  const view = `
      <div class="container mt-5">
      <div class="row align-items-center">
        <!-- Imagen de Pong -->
        <div class="col-md-6">
          <img src="${image}" alt="Pong Game" class="img-fluid">
        </div>
    
        <!-- Descripción y Botón -->
        <div class="col-md-6">
          <h1>CabraPing</h1>
          <p class="lead">Classic Pong: Bounce to Victory! Can you outmatch your opponent in this timeless arcade game of skill and reflexes?</p>
          <a href="path-to-authentication" class="btn btn-warning">42 Auth</a>
        </div>
      </div>
    </div>

  `;

  return view;
};

export default Home;

