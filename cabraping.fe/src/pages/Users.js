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
    <li>
        <h3>${user.username}</h3>
        <button>Add Friend</button>
    </li>
    `
    )
    .join("");
  usersListElement.innerHTML = usersDataString;
}
