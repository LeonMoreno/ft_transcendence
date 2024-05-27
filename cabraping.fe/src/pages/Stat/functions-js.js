import { Stat_html } from "./html.js";


const BACKEND_URL = "http://localhost:8000";
let users = [];
let friendRequests = [];

// export async function UsersInit() {
export async function Stat_js() {

    injectStyles();
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

    const usersListElement = document.getElementById("users-list");
    if (usersListElement) {
        usersListElement.innerHTML = users
        .map((user) => {
            const isSameUser = user.id === myUser.id;
            const isOurFriend = user.friends.includes(myUser.id);

            return `
            <li>
                <span>${user.username}</span>
                <span>${user.email}</span>
                <span>${user.status}</span>
                <span>${isOurFriend ? 'Your friend' : ''}</span>
            </li>
            `;
        })
      .join("");
  }
}

function injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .users-list {
        display: grid;
        grid-template-columns: 150px 200px 150px auto;
        gap: 0;
        border-collapse: collapse;
      }
  
      .users-list li {
        display: contents;
      }
  
      .users-list li span {
        border: 1px solid #ccc;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
  
      .users-list li span:last-child {
        border-right: none;
      }
  
      .users-list li:nth-child(odd) span {
        background-color: #f9f9f9;
      }
    `;
    document.head.appendChild(style);
  }