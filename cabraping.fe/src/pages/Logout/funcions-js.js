export function LogoutPage_js() {
  localStorage.removeItem("jwt");
  window.location.replace("");
  return "";
}

export function logoutUser() {
  fetch('/api/logout/', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
      }
  })
  .then(response => {
      localStorage.removeItem('jwt');
      window.location.href = '/login';
  })
  .catch(error => console.error('Logout failed:', error));
}
