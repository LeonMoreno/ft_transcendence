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
  "/": new Home,
  "/game" : new Game,
  "/chat" : new Chat,
  // "/chat/:id" : new Chat,
  "/user" : new User,
  "/:id" : new User,
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

  if (route === "/:id" && user_location.length >= 1){
    route = '/' + user_location[0] + route;
  }

  let render;


  if ( route.length > 1 && routes[route])
    render = routes[user_location]
  else if (user_location.length >= 1 && (user_location.length <= 2 || (user_location.length <= 3 && user_location[2] == "" ) ) && routes[`/${user_location[0]}`])
  {
    render = routes[`/${user_location[0]}`]
  }
  else if (!routes[route] && user_location.length > 3 || (user_location.length === 3 && user_location[2].length != 0))
    render = new Error404;
  else
    render = new Error404;

  try {
    content.innerHTML = await render.getView();
    await render.init();
  } catch (error) {
    console.log(error);
  }

};

export default router;
