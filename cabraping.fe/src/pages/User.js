class  User {

  constructor() {
  }

  init() {
    console.log("start code in User");
  }

  getView() {
    return `
    <div class="User" >
        <h2> User </h2>
    </div>
    `;
  }
};

export default User;
