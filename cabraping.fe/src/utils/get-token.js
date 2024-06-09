export function getToken() {
  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    // window.location.replace("/#auth");
    return null;
  }

  return jwt;
}
