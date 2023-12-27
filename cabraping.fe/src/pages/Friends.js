const BACKEND_URL = "http://localhost:8000";
let friendRequestsData = [];

export async function Friends() {
  console.log("Friends");

  return `
    <div class="container-sm">
      <h2>All of My Friends</h2>
      <ul id="friends-list" class="list-group">
        <!-- friendsData -->
        <p>No Friends Yet</p>
      </ul>

      <h2>Friend Requests</h2>
      <ul id="friend-requests-list" class="list-group">
        <!-- friendsData -->
        <p>No Friend Requests Yet</p>
      </ul>
    </div>
  `;
}

export async function FriendsRender() {
  console.log("FriendsRender");

  const friendRequestsListElement = document.getElementById(
    "friend-requests-list"
  );
  friendRequestsListElement.innerHTML = "";

  const jwt = localStorage.getItem("jwt");
  const response = await fetch(`${BACKEND_URL}/api/friend_requests/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  friendRequestsData = await response.json();
  if (friendRequestsData.length <= 0) {
    friendRequestsListElement.innerHTML = "<p>No Friend Requests Yet</p>";
    return null;
  }

  const friendRequestsDataString = friendRequestsData
    .map(
      (
        friendRequest
      ) => `<li id="${friendRequest.id}" class="list-group-item d-flex gap-4 align-items-center">
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
  </li>`
    )
    .join("");

  friendRequestsListElement.innerHTML = friendRequestsDataString;
}

export async function FriendsInit() {
  console.log("FriendsInit");

  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    window.location.href = "/#auth";
    return;
  }

  const confirmButtonElements = document.querySelectorAll(
    '[data-action="confirm"]'
  );
  const deleteButtonElements = document.querySelectorAll(
    '[data-action="delete"]'
  );

  confirmButtonElements.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const friendRequestId = event.target.getAttribute("data-id");

      const response = await fetch(
        `${BACKEND_URL}/api/friend_requests/${friendRequestId}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ intent: "confirm" }),
        }
      );

      const updatedFriendRequest = await response.json();

      console.log("updatedFriendRequest:", updatedFriendRequest);

      FriendsRender();
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

      console.log("Deleted status:", response.status);
      FriendsRender();
    });
  });
}
