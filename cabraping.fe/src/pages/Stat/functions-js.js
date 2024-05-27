import { Stat_html } from "./html.js";


const BACKEND_URL = "http://localhost:8000";
let users = [];
let friendRequests = [];

// Function to fetch and display user statistics
export async function Stat_js() {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) return null;

  const responseMyUser = await fetch(`${BACKEND_URL}/api/me/`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const myUser = await responseMyUser.json();
  if (!myUser) return null;

  const responseUsers = await fetch(`${BACKEND_URL}/api/users/`);
  users = await responseUsers.json();
  if (!users) return null;
  
  const responseGames = await fetch(`${BACKEND_URL}/api/games/`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const games = await responseGames.json();
  if (!games) return null;

  const user_stat = calculateWinsAndLosses(games);

  users = users.map(user => ({
    ...user,
    wins: user_stat[user.id] ? user_stat[user.id].wins : 0,
    losses: user_stat[user.id] ? user_stat[user.id].losses : 0
  }));
  users.sort((a, b) => b.wins - a.wins);

  const usersListElement = document.getElementById("users-list");
  if (usersListElement) {
    usersListElement.innerHTML = users
      .map((user) => {
        const isOurFriend = user.friends.includes(myUser.id);
        const stats = user_stat[user.id] || { wins: 0, losses: 0 };

        return `
          <tr>
            <th style="border: 1px solid #ccc; padding: 8px;">${user.username}</td>
            <th style="border: 1px solid #ccc; padding: 8px;">${stats.wins}</td>
            <th style="border: 1px solid #ccc; padding: 8px;">${stats.losses}</td>
            <th style="border: 1px solid #ccc; padding: 8px;">${isOurFriend ? 'Your friend' : ''}</td>
          </tr>
        `;
      })
      .join("");
  }
}

// Call the Stat_js function to display user statistics
Stat_js();

function calculateWinsAndLosses(gameResults) {
  const userStats = {};

  gameResults.forEach(game => {
      const { inviter, invitee, winner } = game;

      // Initialize stats for inviter and invitee if not already present
      if (!userStats[inviter.id]) {
          userStats[inviter.id] = { wins: 0, losses: 0, username: inviter.username };
      }
      if (!userStats[invitee.id]) {
          userStats[invitee.id] = { wins: 0, losses: 0, username: invitee.username };
      }

      // Update stats
      if (winner.id === inviter.id) {
          userStats[inviter.id].wins += 1;
          userStats[invitee.id].losses += 1;
      } else if (winner.id === invitee.id) {
          userStats[invitee.id].wins += 1;
          userStats[inviter.id].losses += 1;
      }
  });

  return userStats;
}



