export function Game_html() {
  return `
    <div class="container-fluid d-flex align-items-center justify-content-center mb-5 mt-5">
      <div class="row w-100">
        <div class="col-12 d-flex justify-content-center">
          <div class="bg-dark w-100 h-100 d-flex align-items-center justify-content-center p-5" >
            <canvas id="game" class="w-100 h-100"></canvas>  <!-- Canvas se ajusta al espacio disponible después del padding -->
          </div>
        </div>
      </div>
    </div>
  `;
}
