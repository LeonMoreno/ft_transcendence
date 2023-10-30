import Header from "../template/Header";
import Footer from "../template/Footer";

import Home from "../pages/Home";
import Game from "../pages/Game"
import Chat from "../pages/Chat"
import User from "../pages/User"
import Error404 from "../pages/Error404";


import getHash from "../utils/getHash";
import resolveRoutes from "../utils/resolveRoutes";

const routes = {
  "/": Home,
  "/game" :Game,
  "/chat" :Chat,
  "/user" :User,
};

const router = async () => {
  const header = null || document.getElementById("header");
  const content = null || document.getElementById("content");
  const footer = null || document.getElementById("footer");

  header.innerHTML = await Header();
  footer.innerHTML = await Footer();

  let hash = getHash();
  let route = await resolveRoutes(hash);
  let user_location = location.hash.slice(1).toLocaleLowerCase().split("/");

  let render;

  if ( route > 1 &&routes[route])
    render = routes[route]
  else if (user_location.length == 1 && routes[`/${user_location[0]}`])
    render = routes[`/${user_location[0]}`]
  else if (!routes[route] && user_location.length > 3 || (user_location.length === 3 && user_location[2].length != 0))
    render = Error404;
  else
    render = Error404;


  content.innerHTML = await render();
};

export default router;
