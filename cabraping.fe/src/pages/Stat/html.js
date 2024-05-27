const BACKEND_URL = "http://localhost:8000";

export async function Stat_html() {
  return `
    <div class="container-sm min-vh-100">
      <h2>Users Stats</h2>
      <table id="users-table" class="table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px;">Username</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Wins</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Losses</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Friend Status</th>
          </tr>
        </thead>
        <tbody id="users-list">
          <!-- User data will be injected here -->
        </tbody>
      </table>
    </div>
  `;
}