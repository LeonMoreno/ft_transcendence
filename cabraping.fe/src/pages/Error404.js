

class Error404 {

  constructor() {
  }

  init() {
    console.log("start code in Error404");
  }

  getView() {
    return `
      <div class="Error404">
        <h2>Error 404</h2>
      </div>
    `;
  }
};

export default Error404;
