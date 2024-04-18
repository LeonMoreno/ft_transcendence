import { getToken } from "../../utils/get-token";

const BACKEND_URL = "http://localhost:8000";
let myUserData = {};
let friendRequests = [];

export async function Friends_html() {
  const jwt = getToken();

  const responseMe = await fetch(`${BACKEND_URL}/api/me/`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  myUserData = await responseMe.json();
  if (!myUserData) {
    return null;
  }

  return `
    <div class="container-sm min-vh-100">
      <h2>All of My Friends</h2>
      <ul id="friends-list" class="list-group">
        <!-- friendsData -->
        <p>No Friends Yet</p>
      </ul>

      <h2>Friend Requests</h2>
      <p>We are the invitee</p>
      <ul id="friend-requests-list" class="list-group">
        <!-- friendsData -->
        <p>No Friend Requests Yet</p>
      </ul>
    </div>
  `;
}
