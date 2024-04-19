import { getToken } from "../../utils/get-token";

const BACKEND_URL = "http://localhost:8000";
let myUserData = {};
let friendRequests = [];


export async function FriendsRender() {
  const jwt = getToken();

  const friendsListElement = document.getElementById("friends-list");
  friendsListElement.innerHTML = "";

  friendRequests = myUserData.friends;
  if (!Array.isArray(friendRequests)) {
    return null;
  }

  if (friendRequests.length <= 0) {
    friendsListElement.innerHTML = "<p>No friends yet</p>";
    return null;
  }

  friendsListElement.innerHTML = friendRequests
    .map(
      (
        user
      ) => `<li id="${user.id}" class="list-group-item d-flex gap-4 align-items-center">
  <h3>${user.username}</h3>
</li>`
    )
    .join("");
}

export async function FriendRequestsRender() {
  const jwt = getToken();

  const friendRequestsListElement = document.getElementById(
    "friend-requests-list"
  );
  friendRequestsListElement.innerHTML = "";

  const responseFriendRequests = await fetch(
    `${BACKEND_URL}/api/friend_requests/me`,
    {
      headers: { Authorization: `Bearer ${jwt}` },
    }
  );
  friendRequests = await responseFriendRequests.json();

  friendRequests = friendRequests.filter((friendRequest) => {
    const toOurUser = friendRequest.to_user.id === myUserData.id;
    if (toOurUser) return friendRequest;
  });

  if (friendRequests.length <= 0) {
    friendRequestsListElement.innerHTML = "<p>No Friend Requests Yet</p>";
    return null;
  }

  const friendRequestsDataString = friendRequests
    .map((friendRequest) => {
      return `<li id="${friendRequest.id}" class="list-group-item d-flex gap-4 align-items-center">
    <h3>${friendRequest.from_user.username}</h3>
    <div className="d-flex gap-4">
      <button
        type="button"
        class="btn btn-sm btn-primary"
        data-action="confirm"
        data-id="${friendRequest.id}">Confirm</button>
      <button
        type="button"
        class="btn btn-sm btn-secondary "
        data-action="delete"
        data-id="${friendRequest.id}">Delete</button>
    </div>
  </li>`;
    })
    .join("");

  friendRequestsListElement.innerHTML = friendRequestsDataString;
}

// export async function FriendsInit() {
export async function Friends_js() {
  const jwt = getToken();

  const confirmButtonElements = document.querySelectorAll(
    '[data-action="confirm"]'
  );
  const deleteButtonElements = document.querySelectorAll(
    '[data-action="delete"]'
  );

  confirmButtonElements.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const friendRequestId = event.target.getAttribute("data-id");

      await fetch(`${BACKEND_URL}/api/friend_requests/${friendRequestId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ intent: "confirm" }),
      });

      Friends();
      FriendsRender();
      FriendRequestsRender();
    });
  });

  deleteButtonElements.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const friendRequestId = event.target.getAttribute("data-id");

      const response = await fetch(
        `${BACKEND_URL}/api/friend_requests/${friendRequestId}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );

      Friends();
      FriendsRender();
      FriendRequestsRender();
    });
  });
}
