import router from "./router";

// we wait for the "load" to pass, and we want it to do something
// window.addEventListener("load", router);

window.addEventListener("hashchange", router);

router();
