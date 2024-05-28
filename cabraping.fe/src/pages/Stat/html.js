const BACKEND_URL = "http://localhost:8000";

// export async function Stat_html() {
//   return `
//     <div class="container-sm min-vh-100">
//       <h2>Leaderboard</h2>
//       <table id="users-table" class="table" style="width: 100%; border-collapse: collapse;">
//         <thead>
//           <tr>
//             <th style="border: 1px solid #ccc; padding: 8px; background-color: #4CAF50; color: red;">Username</th>
//             <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFA500; color: pink;">Wins</th>
//             <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFC0CB; color: white;">Losses</th>
//             <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFA07A; color: purple;">Tournament Wins</th>
//           </tr>
//         </thead>
//         <tbody id="users-list">
//           <!-- User data will be injected here -->
//         </tbody>
//       </table>
//     </div>
//   `;
// }

export async function Stat_html() {
  return `
    <div class="container-sm min-vh-100">
      <h2>Dashboard</h2>
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link stat-nav-link" href="#" data-target="wins-losses">Leaderboard</a>
        </li>
        <li class="nav-item">
          <a class="nav-link stat-nav-link" href="#" data-target="history">Match History</a>
        </li>
        <li class="nav-item">
          <a class="nav-link stat-nav-link" href="#" data-target="selfstats">Personal Stats</a>
        </li>
      </ul>
      <div class="stat-block" id="wins-losses" style="display: none;">
        <h3>Wins and Losses</h3>
        <table class="table table-bordered" id="wins-losses-table">
          <thead>
            <tr>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #4CAF50; color: white;">Username</th>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFA500; color: white;">Wins</th>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFC0CB; color: white;">Losses</th>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFA07A; color: white;">Tournament Wins</th>
            </tr>
          </thead>
          <tbody id="users-list"></tbody>
        </table>
      </div>
      <div class="stat-block" id="history" style="display: none;">
        <h3>Match History</h3>
        <table class="table table-bordered" id="match-history-table">
          <thead>
            <tr>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #4CAF50; color: white;">Winner</th>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFA500; color: white;">Loser</th>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFC0CB; color: white;">Date</th>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFC0CB; color: white;">Time</th>
            </tr>
          </thead>
          <tbody id="history-list"></tbody>
        </table>
      </div>
      <div class="stat-block" id="selfstats" style="display: none;">
        <h3>Personal Stats</h3>
        <table class="table table-bordered" id="self-stats-table">
          <thead>
            <tr>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #4CAF50; color: white;">Username</th>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFA500; color: white;">Wins</th>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFC0CB; color: white;">Losses</th>
              <th style="border: 1px solid #ccc; padding: 8px; background-color: #FFA07A; color: white;">Tournament Wins</th>
            </tr>
          </thead>
          <tbody id="users-list"></tbody>
        </table>
      </div>
    </div>
  `;
}

