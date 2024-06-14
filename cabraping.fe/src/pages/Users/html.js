export function Users_html() {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    window.location.href = "/#";
    return;
  }

  return `
    <div class="container-sm min-vh-100">
      <h2>List of Users</h2>
      <ul id="users-list" class="list-group">
        <!-- userData -->
      </ul>
    </div>
  `;
}
