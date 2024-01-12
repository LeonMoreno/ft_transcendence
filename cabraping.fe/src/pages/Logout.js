export function LogoutPage() {
  localStorage.removeItem("jwt");
  window.location.replace("");
  return "";
}
