import image from '../../assets/logo.svg';
import getHash from "../../utils/getHash";
import { showNotification } from '../../components/showNotification';

const BACKEND_URL = "http://localhost:8000";

let sockets = {}; // Object to store WebSocket connections
let usersList = []; // Global variable to store the list of users

let UserName = "default";
let channel = -1;
let user_id = -1;
let channel_now = "general";
let channel_title = "general";
let array_channels;
let myUser = null;

export async function Chat_js() {

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        window.location.href = '/#';
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
  
    const button = document.getElementById('addChannel');
    console.log(button);
    if (button) {
      button.addEventListener('click', handleButtonClick);
    }
  
    // Listen for clicks on the send button.
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
      sendButton.addEventListener('click', handleSendClick);
    }
  
    // Manage clicks on the add channel button.
    const saveChannelButton = document.getElementById('saveChannelButton');
    if (saveChannelButton) {
      saveChannelButton.addEventListener('click', handleSaveChannelClick);
    }
  
    let userId = getUserIdFromJWT(jwt);
    const channels = await getUserChannels(userId);
  
    if (channels.length > 0) {
      // updateChannelListAndSubscribe(channels);
      updateChannelList(channels); // Call the new function to update the channels dropdown
      channel = channels[0].id; // Sets the first channel as the current channel
    }
  
    const channelsDropdown = document.getElementById('channelsDropdown');
    if (channelsDropdown) {
      channelsDropdown.addEventListener('click', async () => {
        let userId = getUserIdFromJWT(localStorage.getItem('jwt'));
        const channels = await getUserChannels(userId);
        updateChannelList(channels);
      });
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
          }
          console.log("-> sockets[channel_now]:", sockets[channel_now]);
          sockets[channel_now].send(JSON.stringify(info_send)); // Send message through the corresponding WebSocket
          textarea.value = '';
          addMessageToChat(info_send);
      }
  }
}

function addMessageToChat(message) {

  console.log("--> 🎉message.channel:", message.channel);
  console.log("--> 🎉channel:", channel_now);
  console.log("--> 🎉condicion:",message.channel === channel_now)
  if (message.channel === channel_now) {
    const messageList = document.getElementById('messageList');
    if (messageList) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'mb-3 d-flex align-items-start';

      const userImage = document.createElement('img');
      userImage.src = `${image}`;
      userImage.alt = 'User Image';
      userImage.className = 'rounded-circle mr-2';
      userImage.width = 40;

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
    }
  }
}

function handleButtonClick() {
  const modal = document.getElementById("channelModal");
  const membersList = document.getElementById("channelMembers");

  if (modal) {
    modal.style.display = 'block'; // Display the modal
    fetch(`${BACKEND_URL}/api/users/`)
      .then(response => response.json())
      .then(users => {
        usersList = users;
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
      .catch(error => {
          console.error('Error fetching users:', error);
      });
  }

  const closeModalButton = document.getElementById('closeModalButton');
  if (closeModalButton) {
      closeModalButton.addEventListener('click', () => {
          modal.style.display = 'none'; // Hide the modal
      });
  }
}

// Function to update the channels list UI with a selector
function updateChannelList(channels) {

  console.log("---> 🎉 channels");
  console.log(channels);
  // Get the channels dropdown element
  const channelsDropdown = document.getElementById('channelsDropdown');
  // Clear previous options
  channelsDropdown.innerHTML = '';

  const defaultValue = document.createElement('option');
  defaultValue.value = -1;
  defaultValue.textContent = "Select a person for messages";
  channelsDropdown.appendChild(defaultValue);

  // Add an option for each channel
  array_channels = channels;
  channels.forEach(channel => {
    const option = document.createElement('option');
    option.value = channel.id;
    // option.textContent = channel.name;

    // console.log("--> 🤟 channel.name :", channel.name);
    // console.log("--> 🤟 UserName :", UserName);
    // changeNameChanel(channel);
    if (channel.name === UserName) {
      // Encuentra un miembro cuyo username sea diferente de UserName
      const differentMember = channel.members.find(member => member.username !== UserName);
      // channel_title = differentMember.username;
    
      // Verifica si se encontró un miembro diferente
      if (differentMember) {
        // console.log("--> 🤟 Different member's username: ", differentMember.username);
        option.textContent = differentMember.username;
      } else {
        // Manejar el caso donde no se encuentra un miembro diferente o todos tienen el mismo nombre
        option.textContent = "No disponible";
      }
    }
    else
    {
      option.textContent = channel.name;
      // channel_title = channel.name;
    }
    channelsDropdown.appendChild(option);
  });

  // Set up an event listener to handle channel changes
  channelsDropdown.addEventListener('change', (event) => {
    const selectedChannelId = event.target.value;
    switchChannel(selectedChannelId); // Function to handle channel switch
  });
}

function switchChannel(newChannelId) {
  console.log("--> switchChannel:", newChannelId);
  // Update the current channel
  channel_now = newChannelId;

  // Clear the chat messages from the UI
  const messageList = document.getElementById('messageList');
  messageList.innerHTML = '';

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
}

// Function to obtain the JWT user ID
function getUserIdFromJWT(jwt) {
  const payload = jwt.split('.')[1];
  const decodedPayload = JSON.parse(atob(payload));
  return decodedPayload.user_id;
}

// Function to obtain the user's channels
async function getUserChannels(userId) {
  const response = await fetch(`${BACKEND_URL}/user-channels/${userId}/?format=json`);
  const data = await response.json();
  return data;
}

// Function to create a WebSocket connection
function changeNameChanel(channel) {
  if (channel.name === UserName) {
    // Encuentra un miembro cuyo username sea diferente de UserName
    const differentMember = channel.members.find(member => member.username !== UserName);
    channel_title = differentMember.username;
  }
  else
  {
    channel_title = channel.name;
  }
  // Update the header with the selected channel's name
  const channelHeader = document.getElementById('channel-title');
  if (channelHeader) {
    channelHeader.textContent = `${channel_title}`;
  }
  console.log("---> 🤖 change name :", channel_title);
}
// Function to create a WebSocket connection
function createWebSocketConnection(channelId) {
  const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${channelId}/`);
  ws.addEventListener("message", (event) => {
      // const message = JSON.parse(event.data).message;
      const message = JSON.parse(event.data);
      console.log("--> Mensaje ❤️: ", message);
      addMessageToChat(message);
  });
  sockets[channelId] = ws; // Store WebSocket connection
}

function handleSaveChannelClick() {

  console.log("--> 🦾 Click 🦾");

  let selectedOptions = document.getElementById('channelMembers').selectedOptions;
  let selectedUsersMember = Array.from(selectedOptions).map(option => parseInt(option.value, 10));

  selectedUsersMember.push(user_id);

  console.log("selectedUsersMember: ", selectedUsersMember);

  // Extract the user name using user_id
  const userName = usersList.find(user => user.id == selectedUsersMember[0])?.username || 'Unknown User';

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
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(channelData)
  };


  // Displays the information in the console
  console.log("channelData: ", channelData);

  // Perform POST request
  fetch(url, requestOptions)
  .then(response => response.json())
  .then(data => {
    console.log("--> response");
    console.log(data.name);
    if (data.name) { // Verify that the response status is 200 or 201.
      showNotification("Channel successfully created", "success");
      // Actualiza la lista de canales
      getUserChannels(user_id).then(updateChannelList); // Asume que user_id es global
    }
    else{
      showNotification("Error there is already a chat", "error");
    }

     // Cierra el modal
     const modal = document.getElementById("channelModal");
     if (modal) {
       modal.style.display = 'none';
     }
  })
  .catch(error => {
      showNotification("Error there is already a chat", "error");
  });

}
