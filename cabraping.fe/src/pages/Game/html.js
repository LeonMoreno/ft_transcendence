// import { getHash } from "../../utils/getHash.js";

export function Game_html() {
  // let param = getHash();

  return `
    <div class="container-fluid d-flex align-items-center justify-content-center mb-5 mt-5">
      <div class="row w-100">
        <section class="col-12 d-flex justify-content-center">
          <div>
            <header class="d-flex justify-content-between">
              <h4>
                <span id="left-paddle-name"></span>
                <span id="left-paddle-score"></span>
              </h4>
              <h4>
                <span>Game ID: </span>
                <span id="game-id"> </span>
              </h4>
              <h4>
                <span id="right-paddle-name"></span>
                <span id="right-paddle-score"></span>
              </h4>
            </header>

            <div class="bg-dark w-100 h-100 d-flex align-items-center justify-content-center p-5" >
                <canvas id="game" class="w-100 h-100"></canvas>  <!-- Canvas se ajusta al espacio disponible después del padding -->
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}
