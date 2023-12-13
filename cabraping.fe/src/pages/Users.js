const BACKEND_URL = "http://localhost:8000";
let usersData = [];

export function Users() {
  return `
        <div class="container-sm">
            <h2>List of Users</h2>
            <ul id="users-list" class="list-group">
                <!-- userData -->
            </ul>
        </div>
    `;
}

export async function UsersInit() {
  const response = await fetch(`${BACKEND_URL}/api/users/?format=json`);
  usersData = await response.json();

  console.log(usersData);
  const usersListElement = document.getElementById("users-list");
  const usersDataString = usersData
    .map(
      (user) => `
    <li class="list-group-item d-flex gap-4 align-items-center">
        <h3>${user.username}</h3>
        <button
        type="button"
        class="btn btn-primary btn-sm"
        data-action="send-friend-request"
        data-id="${user.id}"
        >Add Friend</button>
    </li>
    `
    )
    .join("");

  usersListElement.innerHTML = usersDataString;

  const sendFriendRequestButttons = document.querySelectorAll(
    '[data-action="send-friend-request"]'
  );

  sendFriendRequestButttons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const userId = event.target.getAttribute("data-id");
      console.log(`Sending a friend request to user ID: ${userId}`);
      const response = await fetch(`${BACKEND_URL}/api/users/?format=json`);
      usersData = await response.json();
    });
  });
}
