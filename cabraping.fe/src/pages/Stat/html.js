const BACKEND_URL = "http://localhost:8000";

export async function Stat_html() {
  return `
    <div class="container-sm min-vh-100">
      <h2>Users Stats</h2>
      <table id="users-table" class="table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px; background-color: #4CAF50; color: red;">Username</th>
            <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFA500; color: pink;">Wins</th>
            <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFC0CB; color: white;">Losses</th>
            <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFA07A; color: purple;">Tournament Wins</th>
          </tr>
        </thead>
        <tbody id="users-list">
          <!-- User data will be injected here -->
        </tbody>
      </table>
    </div>
  `;
}