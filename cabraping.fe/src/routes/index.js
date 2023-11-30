import Header from "../template/Header";
import Footer from "../template/Footer";

import {Home, HomeInit} from "../pages/Home";
import {Game, GameInit} from "../pages/Game"
import {Chat, ChatInit} from "../pages/Chat"
import {User, UserInit} from "../pages/User"
import { AuthPage, AuthPageInit } from "../pages/AuthPage";

import {Error404, Error404Init } from "../pages/Error404";

import getHash from "../utils/getHash"

const routes = {
  "/":  [Home, HomeInit],
  "/game" :  [Game, GameInit],
  "/chat" :  [Chat, ChatInit],
  "/auth" :  [AuthPage, AuthPageInit],
  "/chat/:id" : [Chat, ChatInit],
  "/user" :  [User, UserInit],
};

const router = async () => {
  // The variable where it is stored, the array of the functions that will be executed
  let render;
  let catch_path;


  // The HTML component selectors where our components will be rendered
  const header = null || document.getElementById("header");
  const content = null || document.getElementById("content");
  const footer = null || document.getElementById("footer");


  // We will render our Header and Footer components
  header.innerHTML = await Header();
  footer.innerHTML = await Footer();


  // We take our fruit and divide it into "/", we obtain a lowercase array, to work with the paths
  let user_location = location.hash.slice(1).toLocaleLowerCase().split("/");


  // handling getHash, or route ids
  if (getHash() != "/")
    catch_path = `/${user_location[0]}/:id`
  else
    catch_path = `/${user_location[0]}`


    // We check that the route exists.
  if (user_location.length >= 1 && user_location.length <= 2 && routes[catch_path])
    render = routes[`/${user_location[0]}`]
  else
    render = [Error404, Error404Init];


  // We render our html and execute the js
  content.innerHTML = await render[0]();
  for (let index = 1; index < render.length; index++) {
    await render[index]();
  }
};

export default router;
