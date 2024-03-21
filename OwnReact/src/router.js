/** @jsx Didact.createElement */
import Didact from "./ownReact.js";
import Counter from "./components/cout.js";
import Home from "./components/home.js";
import getHash from "./utils/getHash.js";
import resolveRoutes from "./utils/resolveRoutes";


// ---> basico

const routes = {
  "/": Counter, // Component, not an array or JSX
  "/home": Home, // Component, not an array or JSX
};


const router = async () => {
  try {
    // Clear the container before rendering the new component
    const container = document.getElementById("root");

    const hash = getHash();
    const route = await resolveRoutes(hash);

    const routeComplete = route === "/" ? "/" : `/${route}`;

    const newComponent = routes[routeComplete] ? Didact.createElement(routes[routeComplete], {}) : <Counter />;

    Didact.render(newComponent, container);
  } catch (error) {
    console.error(error);
  }
};



export default router;
