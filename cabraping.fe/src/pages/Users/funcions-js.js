import { Users_html } from "./html.js";

const BACKEND_URL = "http://localhost:8000";
let users = [];
let friendRequests = [];

// export async function UsersInit() {
export async function Users_js() {
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

  const responseFriendRequests = await fetch(
    `${BACKEND_URL}/api/friend_requests/me`,
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  friendRequests = await responseFriendRequests.json();

  users = users.map((user) => {
    const hasSent = friendRequests.find(
      (friendRequest) => friendRequest.to_user.id === user.id
    );
    if (Boolean(hasSent)) return { ...user, isSentFriendRequest: true };
    else return user;
  });

  const usersListElement = document.getElementById("users-list");
  usersListElement.innerHTML = users
    .map((user) => {
      const isSameUser = user.id === myUser.id;
      const isOurFriend = user.friends.find(
        (friendId) => friendId === myUser.id
      );

      return `
  <li class="list-group-item d-flex gap-4 align-items-center">
      <h3>${user.username}</h3>
      ${
        !isSameUser && !isOurFriend && !user.isSentFriendRequest
          ? `<button
              type="button"
              class="btn btn-primary btn-sm"
              data-action="create-friend-request"
              data-id="${user.id}"
              >Add Friend</button>`
          : ""
      }

      ${
        user.isSentFriendRequest
          ? `<button
              disabled
              type="button"
              class="btn btn-primary btn-sm"
              >Added Friend</button>`
          : ""
      }

      ${isOurFriend ? `<span>Your friend</span>` : ""}
  </li>
  `;
    })
    .join("");

  const addFriendButtonElements = document.querySelectorAll(
    '[data-action="create-friend-request"]'
  );

  addFriendButtonElements.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const toUserId = Number(event.target.getAttribute("data-id"));

      await fetch(`${BACKEND_URL}/api/friend_requests/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ to_user: toUserId }),
      });

      // Users();
      // UsersInit();
      Users_html();
      Users_js();
    });
  });
}
