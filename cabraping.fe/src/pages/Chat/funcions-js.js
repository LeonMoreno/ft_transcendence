// import image from '../../assets/logo.svg';
import { getHash } from "../../utils/getHash.js";
import { showNotification, showNotificationPopup } from '../../components/showNotification.js';

let image = "assets/logo.svg";

const BACKEND_URL = "http://localhost:8000";

let sockets = {}; // Object to store WebSocket connections
let usersList = []; // Global variable to store the list of users
let blockUsersList = []; // Global variable to store the list of blocks users
let channels = []; // Global variable to store the list of channels

let UserName = "default";
let channel = -1;
let user_id = -1;
// let communication_user_id = -1;
let communication_user_id = -1;
let channel_now = "general";
let channel_title = "general";
let array_channels;
let myUser = null;

export async function Chat_js() {

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        return;
    }

    // Extract user_id from JWT
    const payload = jwt.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    user_id = decodedPayload.user_id; // Update user_id variable with the user ID extracted from the JWT

    let route = getHash();
    console.log(`-> 🦾 this.route :${route}`);

    channel_now = route;

    if (route != '/'){
      channel = route;
    }

    const responseMyUser = await fetch(`${BACKEND_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    myUser = await responseMyUser.json();
    if (myUser.code === "user_not_found" || myUser.code === "token_not_valid") {
      window.location.replace("/#logout");
    }
    UserName = myUser.username;

    blocks_users_frontend(jwt);

    // Agregar evento para el botón "Block User"
    const blockUserButton = document.getElementById('blockUserButton');
    if (blockUserButton) {
      blockUserButton.disabled = true;
      blockUserButton.addEventListener('click', () => blockUser(communication_user_id));
    }

    // Agregar evento para el botón "Block User"
    const inviteGameButtonButton = document.getElementById('inviteGameButton');
    if (inviteGameButtonButton) {
      inviteGameButtonButton.disabled = true;
      inviteGameButtonButton.addEventListener('click', () => inviteGame());
    }

    // Agregar evento para el botón "Users"
    const usersRouteButton = document.getElementById('usersRouteButton');
    if (usersRouteButton) {
      usersRouteButton.disabled = true;
      // usersRouteButton.addEventListener('click', () => window.location.href = '#users');
      usersRouteButton.addEventListener('click', () => window.location.href = `#user/${communication_user_id}`);
    }
    
    const acceptGameButton = document.getElementById('acceptGameButton');
    if (acceptGameButton) {
      acceptGameButton.disabled = true;
      // usersRouteButton.addEventListener('click', () => window.location.href = `#user/${communication_user_id}`);
    }

    const button = document.getElementById('addChannel');
    console.log(button);
    if (button) {
      button.addEventListener('click', handleButtonClick);
    }

    // Listen for clicks on the send button.
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
      sendButton.disabled = true;
      sendButton.addEventListener('click', handleSendClick);
    }

    // Manage clicks on the add channel button.
    const saveChannelButton = document.getElementById('saveChannelButton');
    if (saveChannelButton) {
      saveChannelButton.addEventListener('click', handleSaveChannelClick);
    }

    let userId = getUserIdFromJWT(jwt);
    // const channels = await getUserChannels(userId);
    channels = await getUserChannels(userId);

    if (channels.length > 0) {
      updateChannelList(channels); // Call the new function to update the channels dropdown
      channel = channels[0].id; // Sets the first channel as the current channel

      // Subscribe to all channels
      channels.forEach(channel => {
        createWebSocketConnection(channel.id);
    });
    }

  }

  async function inviteGame() {

    const jwt = localStorage.getItem('jwt');

    const response = await fetch(`${BACKEND_URL}/api/games/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invitationStatus: "PENDING",
        inviter: user_id,
        invitee: communication_user_id,
      }),
    });

    console.log("-> response");
    console.log(response);

    if (response.ok) {
      showNotification('Sent invitation', 'success');
    } else {
      showNotification('Failed to invitation user', 'error');
    }

    const inviteGameButtonButton = document.getElementById('inviteGameButton');
    if (inviteGameButtonButton) inviteGameButtonButton.disabled = true;

  }


  async function blockUser(userId) {

    console.log("--> blockUser");
    console.log("---> communication_user_id");
    console.log(communication_user_id);

    if (user_id < 0 || communication_user_id < 0){
      return;
    }

    const jwt = localStorage.getItem('jwt');

    const response = await fetch(`${BACKEND_URL}/api/users-blocks/block/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ blocked_user_id: communication_user_id }),
    });

    console.log("--> response")
    console.log(response)
    switchChannel(-1);
    updateChannelList(channels);
    if (response.ok) {
      showNotification('User blocked successfully', 'success');
    } else {
      showNotification('Failed to block user', 'error');
    }

    blocks_users_frontend(jwt);
  }

  async function  blocks_users_frontend(jwt) {

    const responseBlockUser = await fetch(`${BACKEND_URL}/api/users-blocks/blocked/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    blockUsersList = await responseBlockUser.json();

    console.log("--> blockUsersList");
    console.log(blockUsersList);

    const responseUsers = await fetch(`${BACKEND_URL}/api/users/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    usersList = await responseUsers.json();

    const listBlockContainer = document.getElementById('list-block');

    if (listBlockContainer){
      listBlockContainer.innerHTML = '';

      blockUsersList.forEach((blockedUser) => {
        const userDiv = document.createElement('div');
        userDiv.className = 'd-flex align-items-center mb-2';

        const userImage = document.createElement('img');
        userImage.src = blockedUser.avatarImageURL;
        userImage.alt = 'User Image';
        userImage.className = 'rounded-circle mr-2';
        userImage.width = 40;
        userImage.height = 40;

        const userName = document.createElement('strong');

        userName.textContent = blockedUser.username;

        const unlockButton = document.createElement('button');
        unlockButton.className = 'btn btn-primary btn-sm ml-auto';
        unlockButton.textContent = 'to unlock';
        unlockButton.addEventListener('click', () => unlockUser(blockedUser.id));

        userDiv.appendChild(userImage);
        userDiv.appendChild(userName);
        userDiv.appendChild(unlockButton);

        listBlockContainer.appendChild(userDiv);
    });
  }
}

async function unlockUser(userId) {
  const jwt = localStorage.getItem('jwt');

  const response = await fetch(`${BACKEND_URL}/api/users-blocks/unblock/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ blocked_user_id: userId }),
  });

  if (response.ok) {
    showNotification('User unlocked successfully', 'success');
    Chat_js(); // Refrescar la lista después de desbloquear
  } else {
    showNotification('Failed to unlock user', 'error');
  }
}


function handleSendClick() {
  const textarea = document.getElementById('messageTextarea');
  if (textarea && sockets[channel_now]) { // Check if the current channel connection exists
      const message = textarea.value;
      if (message.trim() !== '') {
          let info_send = {
              "message": message,
              "channel": channel_now,
              "UserName": UserName,
              "userDetails": myUser,
          }
          console.log("-> sockets[channel_now]:", sockets[channel_now]);
          sockets[channel_now].send(JSON.stringify(info_send)); // Send message through the corresponding WebSocket
          textarea.value = '';
          addMessageToChat(info_send);
      }
  }
}

function addMessageToChat(message) {

  saveMessageToLocalStorage(message);

  // console.log("--> 🎉message.channel:", message.channel);
  // console.log("--> 🎉channel:", channel_now);
  // console.log("--> 🎉condicion:",message.channel === channel_now)
  if (message.channel === channel_now) {
    const messageList = document.getElementById("messageList");
    if (messageList) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "mb-3 d-flex align-items-start";

      const userImage = document.createElement('img');
      userImage.src = `${message.userDetails.avatarImageURL}`;
      userImage.alt = 'User Image';
      userImage.className = 'rounded-circle mr-2';
      userImage.width = 40;
      userImage.height = 40;

      const messageContent = document.createElement("div");

      const messageUsername = document.createElement("strong");
      messageUsername.textContent = message.UserName;
      const messageText = document.createElement("p");
      messageText.textContent = message.message;

      messageContent.appendChild(messageUsername);
      messageContent.appendChild(messageText);

      messageDiv.appendChild(userImage);
      messageDiv.appendChild(messageContent);

      messageList.appendChild(messageDiv);

      // Scroll to the bottom of the message list
      messageList.scrollTop = messageList.scrollHeight;

    }
  }
  else{
    if (!isUserBlocked(message.userDetails.id)) {
      showNotificationPopup(message.UserName, message.message);
    }
    // showNotificationPopup(message.UserName, message.message);
  }
}

function isUserBlocked(userId) {
  return blockUsersList.some(blockedUser => blockedUser.id === userId);
}

function saveMessageToLocalStorage(message) {
  let messages = JSON.parse(localStorage.getItem(`messages_channel_${message.channel}`)) || [];
  messages.push(message);
  localStorage.setItem(`messages_channel_${message.channel}`, JSON.stringify(messages));
}

function handleButtonClick() {
  const modal = document.getElementById("channelModal");
  const membersList = document.getElementById("channelMembers");

  if (modal) {
    modal.style.display = "block"; // Display the modal
    fetch(`${BACKEND_URL}/api/users/`)
      .then((response) => response.json())
      .then((users) => {
        usersList = users;
        // console.log("--> users:");
        // console.log(users);
        membersList.innerHTML = ''; // Clear existing list item
        users.forEach(user => {
            if (user.username != UserName){
              const listItem = document.createElement('option');
              listItem.textContent = user.username;
              listItem.value = user.id;
              membersList.appendChild(listItem);
            }
        });
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }

  const closeModalButton = document.getElementById("closeModalButton");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      modal.style.display = "none"; // Hide the modal
    });
  }
}

// Function to update the channels list UI with a selector
function updateChannelList(channels) {
  console.log("---> 🎉 channels");
  console.log(channels);
  // Get the channels dropdown element
  // const channelsDropdown = document.getElementById('channelsDropdown');
  const channelsDiv = document.getElementById('chanelsLists');
  if (channelsDiv){
    // Clear previous options
    // channelsDropdown.innerHTML = '';
    channelsDiv.innerHTML = '';

    const defaultValue = document.createElement('option');
    defaultValue.value = -1;
    defaultValue.textContent = "Select a person for messages";
    // channelsDropdown.appendChild(defaultValue);
    channelsDiv.appendChild(defaultValue);

    // Add an option for each channel
    array_channels = channels;
    channels.forEach(channel => {

      const isBlocked = channel.members.some(member =>
        blockUsersList.some(blockedUser => blockedUser.id === member.id)
    );


      console.log("💡 isBlocked:");
      console.log(isBlocked);

      if (!isBlocked){
        // const option = document.createElement('option');
        // option.value = channel.id;
        // const option_component = document.createElement('button');
        const option_component = document.createElement('div');
        option_component.className = 'd-flex align-items-center p-2 border-bottom chat-item';
        option_component.style.cursor = 'pointer';

        const option_img = document.createElement('img');
        option_img.className = 'rounded-circle me-3';
        option_img.height = 40;
        option_img.width = 40;

        const option_name = document.createElement('p');
        option_name.className = 'mb-0';

        option_component.value = channel.id;

        // Encuentra un miembro cuyo username sea diferente de UserName
        const differentMember = channel.members.find(member => member.username !== UserName);
        // Verifica si se encontró un miembro diferente
        if (differentMember) {
          // option.textContent = differentMember.username;
          option_name.textContent = differentMember.username;
          option_img.height = 40;
          option_img.src = differentMember.avatarImageURL;

        } else {
          // option.textContent = "No disponible";
          option_name.textContent = "No disponible";
        }
        // channelsDropdown.appendChild(option);
        option_component.appendChild(option_img);
        option_component.appendChild(option_name);
        channelsDiv.appendChild(option_component);


        option_component.addEventListener('click', () => switchChannel(channel.id));

        // Add hover effect using Bootstrap utility classes
        option_component.addEventListener('mouseover', () => {
            option_component.classList.add('bg-primary');
            option_name.classList.add("text-white");
          });

        option_component.addEventListener('mouseout', () => {
            option_component.classList.remove('bg-primary');
            option_name.classList.remove("text-white");
        });
      }

    });

  }


  // Set up an event listener to handle channel changes
  // channelsDropdown.addEventListener('change', (event) => {
  //   const selectedChannelId = event.target.value;
  //   switchChannel(selectedChannelId); // Function to handle channel switch
  // });
}

function switchChannel(newChannelId) {
  console.log("--> switchChannel:", newChannelId);
  // Update the current channel
  channel_now = newChannelId;

  // Clear the chat messages from the UI

  const inviteGameButtonButton = document.getElementById('inviteGameButton');
  const userButton = document.getElementById('usersRouteButton');
  const blockButton = document.getElementById('blockUserButton');
  const sendButton = document.getElementById('sendButton');
  const messageTextarea = document.getElementById('messageTextarea');
  const messageList = document.getElementById('messageList');
  messageList.innerHTML = '';


  if (newChannelId === -1) {

    // If no channel is selected, disable send functionality and close WebSocket
    if (sendButton) sendButton.disabled = true;
    if (userButton) userButton.disabled = true;
    if (blockButton) blockButton.disabled = true;
    if (inviteGameButtonButton) inviteGameButtonButton.disabled = true;
    if (messageTextarea) {
        messageTextarea.disabled = true;
        messageTextarea.placeholder = "Select a channel to send messages";
    }

    // Close any existing WebSocket connection
    if (sockets[channel_now]) {
      sockets[channel_now].close();
      delete sockets[channel_now];
    }

     // Update the channel title to reflect no channel is selected
    const channelHeader = document.getElementById('channel-title');
    if (channelHeader) channelHeader.textContent = "No Channel Selected";

    console.log("---- restar");

  }
  else{

    // Enable send functionality
    if (sendButton) sendButton.disabled = false;
    if (userButton) userButton.disabled = false;
    if (blockButton) blockButton.disabled = false;
    if (inviteGameButtonButton) inviteGameButtonButton.disabled = false;
    if (messageTextarea) {
        messageTextarea.disabled = false;
        messageTextarea.placeholder = "Enter your message here...";
    }

    // Check if there's an existing WebSocket connection for the new channel
    if (!sockets[newChannelId]) {
      // If no existing connection, create a new WebSocket connection
      createWebSocketConnection(newChannelId);
    }

    for (let index = 0; index < array_channels.length; index++) {
      if(array_channels[index].id ==newChannelId)
      {
        changeNameChanel(array_channels[index]);
      }
    }

    // Load messages from local storage
    loadMessagesFromLocalStorage(newChannelId);
  }
}

function loadMessagesFromLocalStorage(channelId) {
  const messages = JSON.parse(localStorage.getItem(`messages_channel_${channelId}`)) || [];
  const messageList = document.getElementById('messageList');

  messages.forEach(message => {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'mb-3 d-flex align-items-start';

      const userImage = document.createElement('img');
      userImage.src = `${message.userDetails.avatarImageURL}`;
      userImage.alt = 'User Image';
      userImage.className = 'rounded-circle mr-2';
      userImage.width = 40;
      userImage.height = 40;

      const messageContent = document.createElement('div');

      const messageUsername = document.createElement('strong');
      messageUsername.textContent = message.UserName;
      const messageText = document.createElement('p');
      messageText.textContent = message.message;

      messageContent.appendChild(messageUsername);
      messageContent.appendChild(messageText);

      messageDiv.appendChild(userImage);
      messageDiv.appendChild(messageContent);

      messageList.appendChild(messageDiv);
  });

  // Scroll to the bottom of the message list
  messageList.scrollTop = messageList.scrollHeight;
}

// Function to obtain the JWT user ID
function getUserIdFromJWT(jwt) {
  const payload = jwt.split(".")[1];
  const decodedPayload = JSON.parse(atob(payload));
  return decodedPayload.user_id;
}

// Function to obtain the user's channels
async function getUserChannels(userId) {
  const response = await fetch(
    `${BACKEND_URL}/user-channels/${userId}/?format=json`
  );
  const data = await response.json();
  return data;
}

// Function to create a WebSocket connection
function changeNameChanel(channel) {
  if (channel.name === UserName) {
    // Encuentra un miembro cuyo username sea diferente de UserName
    const differentMember = channel.members.find(
      (member) => member.username !== UserName
    );
    channel_title = differentMember.username;
    communication_user_id = differentMember.id;
  }
  else
  {
    // channel_title = channel.name;
    channel_title = channel.members.find(member => member.username !== UserName).username;
    communication_user_id = channel.members.find(member => member.username !== UserName).id;
  }

  console.log("----> change communication_user_id:");
  console.log(communication_user_id);
  // Update the header with the selected channel's name
  const channelHeader = document.getElementById("channel-title");
  if (channelHeader) {
    channelHeader.textContent = `${channel_title}`;
  }
  console.log("---> 🤖🤖🤖 change name :", channel_title);
}

// Function to create a WebSocket connection
function createWebSocketConnection(channelId) {
  if (sockets[channelId]) {
    console.log(`Already connected to channel ${channelId}`);
    return; // Already connected
  }

  const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${channelId}/`);
  ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      console.log("--> Mensaje ❤️: ", message);
      addMessageToChat(message);
  });
  ws.addEventListener("close", () => {
    delete sockets[channelId];
  });
  sockets[channelId] = ws; // Store WebSocket connection
}

function handleSaveChannelClick() {
  console.log("--> 🦾 Click 🦾");

  let selectedOptions =
    document.getElementById("channelMembers").selectedOptions;
  let selectedUsersMember = Array.from(selectedOptions).map((option) =>
    parseInt(option.value, 10)
  );

  selectedUsersMember.push(user_id);

  console.log("selectedUsersMember: ", selectedUsersMember);

  // Extract the user name using user_id
  const userName =
    usersList.find((user) => user.id == selectedUsersMember[0])?.username ||
    "Unknown User";

  const channelData = {
    // owner: UserName,
    owner: user_id,
    ownerId: user_id,
    name: userName,
    status: "working",
    members: selectedUsersMember,
  };

  // Backend endpoint (adjust according to your configuration)
  const url = `${BACKEND_URL}/channels/create/`;

  // Options for fetch request
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(channelData),
  };

  // Displays the information in the console
  console.log("channelData: ", channelData);

  // Perform POST request
  fetch(url, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      console.log("--> response");
      console.log(data.name);
      if (data.name) {
        // Verify that the response status is 200 or 201.
        showNotification("Channel successfully created", "success");
        // Actualiza la lista de canales
        getUserChannels(user_id).then(updateChannelList); // Asume que user_id es global
      } else {
        showNotification("Error there is already a chat", "error");
      }

      // Cierra el modal
      const modal = document.getElementById("channelModal");
      if (modal) {
        modal.style.display = "none";
      }
    })
    .catch((error) => {
      showNotification("Error there is already a chat", "error");
    });
}
