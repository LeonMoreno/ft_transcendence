import { getHash } from "../../utils/getHash.js";

export function Game_html() {
  let param = getHash();
  console.log(`-> 🦾 game/:id  value:${param}`);

  return `
    <div class="container-fluid d-flex align-items-center justify-content-center mb-5 mt-5">
      <div class="row w-100">
       
        <section class="col-12 d-flex justify-content-center">
        <div>
          <header class="d-flex justify-content-between">
          <h3>Player A</h3>
          <h3>Player B</h3>
          </header>
          <div class="bg-dark w-100 h-100 d-flex align-items-center justify-content-center p-5" >
            <canvas id="game" class="w-100 h-100"></canvas>  <!-- Canvas se ajusta al espacio disponible después del padding -->
          </div>
        </section>
        <div>
      </div>
    </div>
  `;
}
