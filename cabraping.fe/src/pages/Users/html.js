import { getToken } from "../../utils/get-token.js";

// export function Users() {
export function Users_html() {
  const jwt = getToken();

  return `
    <div class="container-sm min-vh-100">
      <h2>List of Users</h2>
      <ul id="users-list" class="list-group">
        <!-- userData -->
      </ul>
    </div>
  `;
}