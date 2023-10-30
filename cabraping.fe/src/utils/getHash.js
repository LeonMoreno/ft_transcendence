// sacamos la url, y el valor en espesifico
const getHash = () =>
  location.hash.slice(1).toLocaleLowerCase().split("/")[1] || "/";

export default getHash;
