import image from "../../assets/logo.svg";

const BACKEND_URL = "http://localhost:8000";
let myUser = null;

export async function Header_html() {
  const jwt = localStorage.getItem("jwt");
  const isAuthenticated = Boolean(jwt);

  if (isAuthenticated) {
    const responseMyUser = await fetch(`${BACKEND_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    myUser = await responseMyUser.json();
    console.log("myUser");
    console.log(myUser);
    if (myUser.code === "user_not_found" || myUser.code === "token_not_valid") {
      window.location.replace("/#logout");
    }
  }

  const view = `
  <header id="nav" class="d-flex justify-content-between align-items-center p-3 bg-light">
    <nav class="navbar navbar-expand-lg navbar-light">
      <a class="navbar-brand" href="#">
        <img src="${image}" alt="Logo" style="height: 50px;">
      </a>
      <button class="navbar-toggler" type="button" id="navbarToggle">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          ${isAuthenticated ? `
            <li class="nav-item"><a class="nav-link" href="#users">Users</a></li>
            <li class="nav-item"><a class="nav-link" href="#friends">Friends</a></li>
            <li class="nav-item"><a class="nav-link" href="#chat">Chats</a></li>
            <li class="nav-item"><a class="nav-link" href="#game">Games</a></li>
          ` : ""}
        </ul>
      </div>
    </nav>

    <div>
      ${isAuthenticated ? `
        <div>
          <a href="/#user" class="me-3 text-decoration-none text-dark">${myUser.username}</a>
          <a href="/#logout" class="btn btn-primary">Logout</a>
        </div>
      ` : `<a href="/#auth" class="btn btn-primary">Login</a>`}
    </div>
  </header>

     `;

  return view;
};
