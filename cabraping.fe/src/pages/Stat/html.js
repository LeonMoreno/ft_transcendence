const BACKEND_URL = "http://localhost:8000";

export async function Stat_html() {
  return `
    <div class="container-sm min-vh-100">
      <h2>Users Stats</h2>
      <ul id="users-list" class="list-group">
        <!-- userData -->
      </ul>
    </div>
  `;
}