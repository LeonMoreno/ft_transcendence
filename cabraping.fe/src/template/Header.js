import image from "../assets/logo.svg";

const BACKEND_URL = "http://localhost:8000";
let myUser = null;

// const Header = async () => {
export async function Header() {
  const jwt = localStorage.getItem("jwt");
  const isAuthenticated = Boolean(localStorage.getItem("jwt"));

  if (isAuthenticated) {
    const responseMyUser = await fetch(`${BACKEND_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    myUser = await responseMyUser.json();
    if (myUser.code === "user_not_found" || myUser.code === "token_not_valid") {
      window.location.replace("/#logout");
    }
  }




  const string1 = "hello";
  const string2 = 'hello';
  const string = "hello";









  const view = `
      <header class="d-flex justify-content-between align-items-center p-3 bg-light">
        <nav id="header-nav" class="d-flex">
          <a href="#">
            <img src="${image}" alt="Logo" style="height: 50px;">
          </a>
          ${
            isAuthenticated
              ? `<a href="#users" class="m-3 text-dark text-decoration-none">Users</a>
            <a href="#friends" class="m-3 text-dark text-decoration-none">Friends</a>
            <a href="#chat" class="m-3 text-dark text-decoration-none">Chats</a>
            <a href="#game" class="m-3 text-dark text-decoration-none">Games</a>`
              : ""
          }
        </nav>

        <div class="d-flex">
          ${
            isAuthenticated
              ? `<div>
                  <span>${myUser.username}</span>
                  <a href="/#logout" class="btn btn-primary">Logout</a>
                </div>`
              : ""
          }
          ${
            !isAuthenticated
              ? `<a href="/#auth" class="btn btn-primary">Login</a>`
              : ""
          }
          <a href="#" class="btn btn-secondary text-white">42 Auth</a>
        </div>
      </header>
     `;

  return view;
};

export function HeaderInit() {
  console.log("hello");
}

export default Header;
