import router from "./routes";

// esperamos a que pase el "load", y queremos que aga algo
window.addEventListener("load", router);

window.addEventListener("hashchange", router);
