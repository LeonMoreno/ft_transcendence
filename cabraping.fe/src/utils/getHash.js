// sacamos la url, y el valor en espesifico
export const getHash = () =>
  location.hash.slice(1).toLocaleLowerCase().split("/")[1] || "/";
