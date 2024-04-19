import Footer_html from "../components/footer/html";
import { Home_js } from "../pages/home/funcions-js";
import { Home_html } from "../pages/home/html";
import { AuthPage_js } from "../pages/AuthPage/funcions-js";
import { AuthPage_html } from "../pages/AuthPage/html";
import { Error404_js } from "../pages/Error404/funcions-js";
import { Error404_html } from "../pages/Error404/html";
import { User_js } from "../pages/User/funcions-js";
import { User_html } from "../pages/User/html";
import { LogoutPage_js } from "../pages/Logout/funcions-js";
import { Users_js } from "../pages/Users/funcions-js";
import { Users_html } from "../pages/Users/html";
import { Header_js} from "../components/header/funcions-js";
import { Header_html } from "../components/header/html";
import { Game_js } from "../pages/Game/funcions-js";
import { Game_html } from "../pages/Game/html";
import { Friends_html } from "../pages/Friends/html";
import { FriendsRender, FriendRequestsRender, Friends_js } from "../pages/Friends/funcions-js";
import { Chat_js } from "../pages/Chat/funcions-js";
import { Chat_html } from "../pages/Chat/html";
import resolveRoutes from "../utils/resolveRoutes";

const routes = {
  "/": [Home_html, Home_js],
  "/auth": [AuthPage_html, AuthPage_js],
  "/logout": [LogoutPage_js],
  "/game": [Game_html, Game_js],
  "/chat": [Chat_html, Chat_js],
  "/chat/:id": [Chat_html, Chat_js],
  "/user": [User_html, User_js],
  "/users": [Users_html, Users_js],
  "/friends": [Friends_html, FriendsRender, FriendRequestsRender, Friends_js],
  "/404": [Error404_html, Error404_js],
};

const router = async () => {
  // The variable where it is stored, the array of the functions that will be executed
  let render;

  // The HTML component selectors where our components will be rendered
  const header = document.getElementById("header");
  const footer = document.getElementById("footer");
  const content = document.getElementById("content");

  footer.innerHTML = await Footer_html();
  header.innerHTML = await Header_html();
  Header_js();

  // We take our fruit and divide it into "/", we obtain a lowercase array, to work with the paths
  let user_location = location.hash.slice(1).toLocaleLowerCase().split("/");

  // We check that the route exists.
  render = resolveRoutes(routes, user_location);

  // We render our html and execute the js
  content.innerHTML = await render[0]();
  for (let index = 1; index < render.length; index++) {
    await render[index]();
  }
};

export default router;
