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

    console.log(`> route:{${route}}`);
    console.log(`> routeComplete:{${routeComplete}}`);

    container.innerHTML = "";
    container.innerHTML = "";
    container.innerHTML = "";

    console.log("> container");
    console.log(container);
    console.log("> container.innerHTML");
    console.log(container.innerHTML);

    // Create a new instance of the component for the route
    // const newComponent = routes[routeComplete] ? Didact.createElement(routes[routeComplete], {}) : Didact.createElement(Counter, {});
    const newComponent = routes[routeComplete] ? Didact.createElement(routes[routeComplete], {}) : <Counter />;
    console.log(`> newComponent:`);
    console.log(newComponent);

    
    Didact.render(newComponent, container);
  } catch (error) {
    console.error(error);
  }
};



export default router;
