// import image from '../../assets/logo.svg';
import { getHash } from "../../utils/getHash.js";
import { showNotification, showNotificationPopup } from '../../components/showNotification.js';
import { BACKEND_URL, WS_URL } from "../../components/wcGlobal.js";
import { sendAcceptedGameNotifications, sendChannelCreatedNotifications, sendGameInviteNotifications } from "../../components/wcGlobal-funcions-send-message.js";
import { getToken } from "../../utils/get-token.js";
import { validateAndSanitizeInput } from "../../components/security.js";
import { CancelGame_selecte } from "./uitls.js";

let image = "assets/logo.svg";

let sockets = {}; // Object to store WebSocket connections
let usersList = []; // Global variable to store the list of users
let blockUsersList = []; // Global variable to store the list of blocks users
let channels = []; // Global variable to store the list of channels

let UserName = "default";
let channel = -1;
let user_id = -1;
let communication_user_id = -1;
let gameId = -1;
let channel_now = "general";
let channel_title = "general";
let array_channels;
let myUser = null;

export async function Chat_Update_js() {

  //console.log("= reload ? Chat_Update_js:");
  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
      return;
  }

  // Extract user_id from JWT
  user_id = getUserIdFromJWT();

  const responseMyUser = await fetch(`${BACKEND_URL}/api/me/`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  myUser = await responseMyUser.json();

  //console.log("= reload ? myUser:", myUser);
  if (myUser.code === "user_not_found" || myUser.code === "token_not_valid") {
    window.location.replace("/#logout");
  }
  UserName = myUser.username;

  channels = await getUserChannels(myUser.id);

  //console.log("update channels:", channels);

  //console.log(">>>>> channel_now:", channel_now);
  if (channel_now !== "/"){
    switchChannel(channel_now);
  }

  if (channels.length > 0) {
    await updateChannelList(channels); // Call the new function to update the channels dropdown
    channel = channels[0].id; // Sets the first channel as the current channel
    // Subscribe to all channels
    channels.forEach(channel => {
      createWebSocketConnection(channel.id);
  });
  }

  checkRequestGame();
}

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
    //console.log(`-> 🦾 this.route :${route}`);

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
      inviteGameButtonButton.addEventListener('click', () => inviteGame(jwt));
    }

    const acceptGameButton = document.getElementById('acceptGameButton');
    if (acceptGameButton) {
      acceptGameButton.disabled = true;
      acceptGameButton.addEventListener('click', () => acceptGame());
    }

    const cancelGameButton = document.getElementById('cancelGameButton');
    if (cancelGameButton) {
      cancelGameButton.disabled = true;
      cancelGameButton.addEventListener('click', () => CancelGame_selecte(gameId));
    }

    // Agregar evento para el botón "Users"
    const usersRouteButton = document.getElementById('usersRouteButton');
    if (usersRouteButton) {
      usersRouteButton.disabled = true;
      usersRouteButton.addEventListener('click', () => window.location.href = `#user/${communication_user_id}`);
    }

    const button = document.getElementById('addChannel');
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

    let userId = getUserIdFromJWT();
    const channels = await getUserChannels(userId);
    // channels = await getUserChannels_filter_blockuser(userId);

    // let filter = await getUserChannels_filter_blockuser(userId);
    // console.log("getUserChannels_filter_blockuser", filter);

    if (channels.length > 0) {
      await updateChannelList(channels); // Call the new function to update the channels dropdown
      channel = channels[0].id; // Sets the first channel as the current channel

      // Subscribe to all channels
      channels.forEach(channel => {
        createWebSocketConnection(channel.id);
    });
    }

    checkRequestGame();
  }

  // Función para mostrar amigos conectados
export function showActiveFriends(friends, check_id) {

  //console.log(">> showActiveFriends > friends:", friends);
  if (!friends.some(friend => String(friend.id) === String(check_id))){
    return null
  }

  const activeUserIds = JSON.parse(localStorage.getItem('id_active_users')) || [];
  //console.log(">> showActiveFriends > activeUserIds:", activeUserIds);
  const activeFriends = friends.filter(friend => activeUserIds.includes(String(friend.id)));
  //console.log(">> showActiveFriends > activeFriends:", activeFriends);

  // if (activeFriends[0] && String(activeFriends[0].id) === String(check_id)) {
  if (activeFriends.length > 0 && activeFriends.some(friend => String(friend.id) === String(check_id))) {
    return true
  }
  return false
}

async function inviteGame(jwt) {
  if (communication_user_id < 1) {
      return;
  }

  let currentTournamentId = localStorage.getItem("currentTournamentId");
  if (currentTournamentId)
  {
    console.log("currentTournamentId:", currentTournamentId);
    const acceptGameButtonButton = document.getElementById('acceptGameButton');
    if (acceptGameButtonButton) acceptGameButtonButton.disabled = true;
    showNotification("You created a tournament", "warning");
    return;
  }

  const responseGames = await fetch(`${BACKEND_URL}/api/games/`, {
      headers: { Authorization: `Bearer ${jwt}` },
  });
  const games = await responseGames.json();

  const existingGame = games.find(
      (game) =>
          game.playMode === 2 &&
          game.invitationStatus === "PENDING" &&
          ((game.invitee.id === myUser.id && game.inviter.id === communication_user_id) ||
          (game.inviter.id === myUser.id && game.invitee.id === communication_user_id))
  );



  // const existing_invitate_Game_me = games.find(
  //   (game) =>
  //       game.playMode === 2 &&
  //       game.invitationStatus === "PENDING" &&
  //       (game.invitee.id === myUser.id || game.inviter.id === myUser.id)
  // );
  // const existing_invitate_Game_order = games.find(
  //   (game) =>
  //       game.playMode === 2 &&
  //       game.invitationStatus === "PENDING" &&
  //       (game.invitee.id === communication_user_id || game.inviter.id === communication_user_id)
  // );

  // if (existing_invitate_Game_me || existing_invitate_Game_order)
  // {
  //   showNotification('the user already has an invitation to the game', 'warning');
  //   return;
  // }

  if (existingGame) {
      showNotification('There is already a pending game invitation', 'warning');
      return;
  }

  const response = await fetch(`${BACKEND_URL}/api/games/`, {
      method: "POST",
      headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          playMode: 2,
          invitationStatus: "PENDING",
          inviter: myUser.id,
          invitee: communication_user_id,
      }),
  });

  if (response.ok) {
      showNotification('Sent invitation', 'success');
      sendGameInviteNotifications(user_id, UserName, communication_user_id, "sendGameInviteNotifications");
  } else {
      showNotification('Failed to invite user', 'error');
  }

  const inviteGameButtonButton = document.getElementById('inviteGameButton');
  if (inviteGameButtonButton) inviteGameButtonButton.disabled = true;

  await updateChannelList(channels);
}

  async function checkRequestGame() {

    // console.log("> channel_now:",channel_now);
    if (channel_now === "/")
      return

    const jwt = localStorage.getItem('jwt');
    if (!jwt || communication_user_id == -1) {
        return;
    }

    let my_id = getUserIdFromJWT();

    const responseGames = await fetch(`${BACKEND_URL}/api/games/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const games = await responseGames.json();

    const game = games.find(
      (game) =>
        game.playMode === 2 &&
        game.invitationStatus === "PENDING" &&
        (
          (game.inviter.id === my_id && game.invitee.id === communication_user_id)
          ||
          (game.inviter.id === communication_user_id && game.invitee.id === my_id)
        )
    );

    if(game){
      gameId = game.id;

      const inviteGameButtonButton = document.getElementById('inviteGameButton');
      if (inviteGameButtonButton) inviteGameButtonButton.disabled = true;

      const cancelGameButton = document.getElementById('cancelGameButton');
      if (cancelGameButton) cancelGameButton.disabled = false;
    }

    // ACCEPTED game
    const game_ACCEPTED = games.find(
      (game) =>
        game.playMode === 2 &&
        game.invitee.id === my_id &&
        game.inviter.id === communication_user_id &&
        game.invitationStatus === "ACCEPTED"
      );

    if (game_ACCEPTED){
      window.location.href = `/#game/${game_ACCEPTED.id}`;
    }

    // send notificacion
    const game_pending = games.find(
      (game) =>
        game.playMode === 2 &&
        game.invitee.id === my_id &&
        game.inviter.id === communication_user_id &&
        game.invitationStatus === "PENDING"
    );

    const acceptGameButton = document.getElementById('acceptGameButton');
    // let currentTournamentId = localStorage.getItem("currentTournamentId");
    // if (game_pending && !currentTournamentId)
    if (game_pending)
    {
      if (acceptGameButton) acceptGameButton.disabled = false;
    }else{
      if (acceptGameButton) acceptGameButton.disabled = true;
    }
}

  async function acceptGame() {

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        return;
    }

    if (gameId === "-1" || gameId === -1){
      showNotification('Erro in game', 'warning');
      return
    }

    const responseGames = await fetch(`${BACKEND_URL}/api/games/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const games = await responseGames.json();

    if (!games)
    {
      showNotification('Erro in game', 'warning');
      return;
    }

    const existing_invitate_Game_order = games.find(
        (game) =>
            game.playMode === 2 &&
            game.invitationStatus === "ACCEPTED" &&
            (game.invitee.id === communication_user_id || game.inviter.id === communication_user_id)
      );

    if (existing_invitate_Game_order)
    {
      showNotification('The user is in a game', 'warning');
      return;
    }

    const result = await fetch(
      `${BACKEND_URL}/api/games/${gameId}/accept_game/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      }
    );

    sendAcceptedGameNotifications(user_id, UserName, communication_user_id, gameId);
    // console.log({ result: await result.json() });
    // /game
    window.location.href = `/#game/${gameId}`;

  }


  async function blockUser(userId) {

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

    switchChannel(-1);
    await updateChannelList(channels);

    if (response.ok) {
      showNotification('User blocked successfully', 'success');
    } else {
      showNotification('Failed to block user', 'error');
    }

    await blocks_users_frontend(jwt);

    disconnectWebSocket(channel_now);
    Chat_Update_js();
  }

  async function disconnectWebSocket(check_channel_infucion) {

    // if (sockets[channel_now]) {
    //   sockets[channel_now].close();
    //   delete sockets[channel_now];
    // }
      // sockets[check_channel_infucion].close();
      delete sockets[check_channel_infucion];

      // console.log(">>> delete sockets[check_channel_infucion]:", sockets[check_channel_infucion]);
  }

  async function  blocks_users_frontend(jwt) {

    const responseBlockUser = await fetch(`${BACKEND_URL}/api/users-blocks/blocked/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    blockUsersList = await responseBlockUser.json();


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

  if (!validateAndSanitizeInput(textarea.value)){
    return;
  }

  if (textarea && sockets[channel_now]) { // Check if the current channel connection exists
      const message = textarea.value;
      if (message.trim() !== '') {
          let info_send = {
              "message": message,
              "channel": channel_now,
              "UserName": UserName,
              "userDetails": myUser,
          }
          sockets[channel_now].send(JSON.stringify(info_send)); // Send message through the corresponding WebSocket
          textarea.value = '';
          addMessageToChat(info_send);
      }
  }
}

async function addMessageToChat(message) {

  let block_users = await get_User_list_blockuser(user_id);

  if ( block_users.some((id) =>  id === message.userDetails.id) ){
    return;
  }

  saveMessageToLocalStorage(message);
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
      // showNotificationPopup(message.UserName, message.message);
      showNotificationPopup(message.UserName, "has sent you a message");
    }
  }
  checkRequestGame();
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

  //console.log("+++++ handleButtonClick:", modal);
  if (modal) {

    //console.log("-----> modal.style.display:", modal.style.display);
    modal.classList.remove("d-none");
    modal.classList.add("d-block");
    //console.log("-----> modal.style.display:", modal.style.display);

    fetch(`${BACKEND_URL}/api/users/`)
      .then((response) => response.json())
      .then((users) => {
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
      .catch((error) => {
        // console.log("Error fetching users:", error);
      });
  }

  const closeModalButton = document.getElementById("closeModalButton");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      // modal.style.display = "none"; // Hide the modal
      // console.log("closeModalButton on");
      modal.classList.remove("d-block");
      modal.classList.add("d-none");
    });
  }
}

async function getGameStatus(userId, games) {
  
  // const response = await fetch(`${BACKEND_URL}/api/games/`, {
  //     headers: { Authorization: `Bearer ${getToken()}` }
  // });

  // if (!response.ok) {
  //     // console.error('Error fetching games:', response.statusText);
  //     return null;
  // }

  // const games = await response.json();
  const pendingGame = games.find(game =>
      game.playMode === 2 &&
      game.invitationStatus === "PENDING" &&
      (
        (game.invitee.id === getUserIdFromJWT() && game.inviter.id === Number(userId))
        ||
        (game.invitee.id === Number(userId) && game.inviter.id === getUserIdFromJWT())
      )
  );

  if (pendingGame) {
      if (pendingGame.invitee.id === userId) {
        return 'waiting';
      } else if (pendingGame.inviter.id === userId) {
        return 'invited';
      }
  }

  return null;
}

// Function to update the channels list UI with a selector
async function updateChannelList(channels) {
  const channelsDiv = document.getElementById('chanelsLists');
  if (channelsDiv){
    // Clear previous options
    channelsDiv.innerHTML = '';

    const defaultValue = document.createElement('option');
    defaultValue.value = -1;
    defaultValue.textContent = "Select a person for messages";
    // channelsDropdown.appendChild(defaultValue);
    channelsDiv.appendChild(defaultValue);

    // Add an option for each channel
    array_channels = channels;

    const response = await fetch(`${BACKEND_URL}/api/games/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });

    if (!response.ok) {
        // console.error('Error fetching games:', response.statusText);
        return null;
    }

    const list_games = await response.json();

    for (const channel of channels) {
      const isBlocked = channel.members.some(member =>
          blockUsersList.some(blockedUser => blockedUser.id === member.id)
      );

      if (!isBlocked){
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
              option_name.textContent = differentMember.username;
              option_img.height = 40;
              option_img.src = differentMember.avatarImageURL;

              const gameStatus = await getGameStatus(differentMember.id, list_games);
              if (gameStatus) {
                  const statusSpan = document.createElement('span');
                  statusSpan.textContent = ` (${gameStatus})`;
                  if (gameStatus === "invited")
                    statusSpan.style.color = 'orange';
                  else
                    statusSpan.style.color = 'text-dark';
                  option_name.appendChild(statusSpan);
              }
          } else {
              option_name.textContent = "No disponible";
          }
          let friend_status = showActiveFriends(myUser.friends, differentMember.id);

          option_component.appendChild(option_img);
          option_component.appendChild(option_name);

          if (typeof(friend_status) === "boolean"){
              const option_frind = document.createElement('p');
              option_frind.style.height = "20px";
              option_frind.style.width = "20px";

              if (friend_status === true){
                  option_frind.className = 'mb-0 ms-3 rounded-circle bg-success';
              }else{
                  option_frind.className = 'mb-0 ms-3 rounded-circle bg-secondary';
              }
              option_component.appendChild(option_frind);
          }

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
    }

  }
}

function switchChannel(newChannelId) {
  // Update the current channel
  channel_now = newChannelId;
  // Clear the chat messages from the UI

  const inviteGameButtonButton = document.getElementById('inviteGameButton');
  const acceptGameButtonButton = document.getElementById('acceptGameButton');
  const cancelGameButton = document.getElementById('cancelGameButton');
  const userButton = document.getElementById('usersRouteButton');
  const blockButton = document.getElementById('blockUserButton');
  const sendButton = document.getElementById('sendButton');
  const messageTextarea = document.getElementById('messageTextarea');
  const messageList = document.getElementById('messageList');

  if (!acceptGameButtonButton || !inviteGameButtonButton || !userButton || !blockButton || !sendButton || !messageTextarea || !messageList)
  {
    return;
  }
  messageList.innerHTML = '';

  if (newChannelId === -1) {

    // If no channel is selected, disable send functionality and close WebSocket
    if (sendButton) sendButton.disabled = true;
    if (userButton) userButton.disabled = true;
    if (blockButton) blockButton.disabled = true;
    if (inviteGameButtonButton) inviteGameButtonButton.disabled = true;
    if (acceptGameButtonButton) acceptGameButtonButton.disabled = true;
    if (cancelGameButton) cancelGameButton.disabled = true;
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

  }
  else{

    // Enable send functionality
    if (sendButton) sendButton.disabled = false;
    if (userButton) userButton.disabled = false;
    if (blockButton) blockButton.disabled = false;
    if (inviteGameButtonButton) inviteGameButtonButton.disabled = false;
    if (acceptGameButtonButton) acceptGameButtonButton.disabled = false;
    if (cancelGameButton) cancelGameButton.disabled = true;
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
    // console.log("--> checkRequestGame();");
    checkRequestGame();
  }
}

function loadMessagesFromLocalStorage(channelId) {
  const messages = JSON.parse(localStorage.getItem(`messages_channel_${channelId}`)) || [];
  const messageList = document.getElementById('messageList');


  let check_channel = channels.find((channel_check) => channel_check.id === channel_now);
  if (!check_channel)
    return
  let members_channel =  check_channel.members;

  messages.forEach(message => {
    // userImage.src = `${message.userDetails.avatarImageURL}`;

      let data_user = members_channel.find((data) => data.id === message.userDetails.id)

      const messageDiv = document.createElement('div');
      messageDiv.className = 'mb-3 d-flex align-items-start';

      const userImage = document.createElement('img');
      userImage.src = `${data_user.avatarImageURL}`;
      userImage.alt = 'User Image';
      userImage.className = 'rounded-circle mr-2';
      userImage.width = 40;
      userImage.height = 40;

      const messageContent = document.createElement('div');

      const messageUsername = document.createElement('strong');
      messageUsername.textContent = data_user.UserName;
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
export function getUserIdFromJWT() {

  // const jwt = getToken();
  const jwt = getToken();

  if (!jwt){
    return -1;
  }

  const payload = jwt.split(".")[1];
  const decodedPayload = JSON.parse(atob(payload));
  return decodedPayload.user_id;
}

// Function to obtain the user's channels
async function getUserChannels(userId) {
  const response = await fetch(
    `${BACKEND_URL}/api/user-channels/${userId}/?format=json`
  );
  // console.log("response:", await response);
  const data = await response.json();

  // console.log("getUserChannels:", data);
  return data;
}

// async function getUserChannels_filter_blockuser(userId) {
async function get_User_list_blockuser() {
 
  // block list
  const responseBlockUser = await fetch(`${BACKEND_URL}/api/users-blocks/blocked/`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  blockUsersList = await responseBlockUser.json();

  let blockUsersList_id = blockUsersList.map((Block_user) => Block_user.id);

  return blockUsersList_id;
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

  // Update the header with the selected channel's name
  const channelHeader = document.getElementById("channel-title");
  if (channelHeader) {
    channelHeader.textContent = `${channel_title}`;
  }
}

// Function to create a WebSocket connection
function createWebSocketConnection(channelId) {
  if (sockets[channelId]) {
    // console.log(`Already connected to channel ${channelId}`);
    return; // Already connected
  }

  const jwt = localStorage.getItem("jwt");
  const ws = new WebSocket(`${WS_URL}/ws/chat/${channelId}/?token=${jwt}`);
  ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      addMessageToChat(message);
  });
  ws.addEventListener("close", () => {
    delete sockets[channelId];
  });
  sockets[channelId] = ws; // Store WebSocket connection
}

function handleSaveChannelClick() {

  let selectedOptions =
    document.getElementById("channelMembers").selectedOptions;
  let selectedUsersMember = Array.from(selectedOptions).map((option) =>
    parseInt(option.value, 10)
  );

  selectedUsersMember.push(user_id);

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
  const url = `${BACKEND_URL}/api/channels/create/`;

  // Options for fetch request
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(channelData),
  };

  // Displays the information in the console

  // Perform POST request
  fetch(url, requestOptions)
    .then((response) => response.json())
    .then( async (data) => {
      if (data.name) {
        // Verify that the response status is 200 or 201.
        await Chat_Update_js();
        showNotification("Channel successfully created", "success");
        // Actualiza la lista de canales
        getUserChannels(user_id).then(updateChannelList); // Asume que user_id es global
        // getUserChannels_filter_blockuser(user_id).then(updateChannelList); // Asume que user_id es global
        // sendChannelCreatedMessage
        sendChannelCreatedNotifications(user_id, UserName, selectedUsersMember[0])
      } else {
        showNotification(data.error, "error");
      }

      // Cierra el modal
      const modal = document.getElementById("channelModal");
      if (modal) {
        // modal.style.display = "none";
        // console.log("------>>> style.display");
        modal.classList.remove("d-block");
        modal.classList.add("d-none");
      }
    })
    .catch((error) => {
      showNotification("Error there is already a chat", "error");
    });
}
