class Game{

  constructor() {
  }

  init() {
    console.log("start code in Game");
  }
  getView() {
    return `
    <div class="w-100 h-100 d-flex" >
      <h1>game</h1>
    </div>
    `;
  }
};

export default Game;
