import image from '../assets/logo.svg';
import getHash from "../utils/getHash";

const BACKEND_URL = "http://localhost:8000";

// let socket;
// let socket;
let sockets = {}; // Objeto para almacenar conexiones WebSocket

let UserName = "default";
let channel = "general";
let channel_now = "general";
let myUser = null;

function handleSendClick() {
  const textarea = document.getElementById('messageTextarea');
  // if (textarea && sockets[channel]) { // Verificar si la conexión del canal actual existe
  if (textarea && sockets[channel_now]) { // Verificar si la conexión del canal actual existe
      const message = textarea.value;
      if (message.trim() !== '') {
          let info_send = {
              "message": message,
              "channel": channel_now,
              "UserName": UserName,
          }
          console.log("-> sockets[channel_now]:", sockets[channel_now]);
          sockets[channel_now].send(JSON.stringify(info_send)); // Enviar mensaje a través del WebSocket correspondiente
          textarea.value = '';
          addMessageToChat(info_send);
      }
  }
}
// function handleSendClick() {
//   const textarea = document.getElementById('messageTextarea');
//   if (textarea) {
//     const message = textarea.value;
//     if (message.trim() !== '') {

//       const jwt = localStorage.getItem('jwt');
//       if (jwt) {
//         const payload = jwt.split('.')[1];
//         const decodedPayload = JSON.parse(atob(payload));
//         UserName = decodedPayload.user_id;
//       }

//       let info_send = {
//         "message": message,
//         "channel": channel,
//         "UserName": UserName,
//       }

//       // Enviar el mensaje al servidor a través del WebSocket.
//       console.log("-> info_send");
//       console.log(info_send);
//       socket.send(JSON.stringify(info_send ));

//       // Limpia el textarea después de enviar el mensaje.
//       textarea.value = '';
//       addMessageToChat(info_send);
//     }
//   }
// }

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
    const adminList = document.getElementById("channelAdmins");

    if (modal) {
        modal.style.display = 'block'; // Display the modal

        // Fetch the list of users
        // fetch(`http://127.0.0.1:8000/api/users/`)
        fetch(`${BACKEND_URL}/api/users/`)
            .then(response => response.json())
            .then(users => {
                membersList.innerHTML = ''; // Clear existing list items
                adminList.innerHTML = '';
                users.forEach(user => {

                    if (user.username != UserName){
                      const listItem = document.createElement('li');

                      const checkbox = document.createElement('input');
                      checkbox.type = 'checkbox';
                      checkbox.value = user.id;
                      checkbox.id = 'user-' + user.id;

                      const label = document.createElement('label');
                      label.htmlFor = 'user-' + user.id;
                      label.textContent = user.username; // Adjust according to your user object

                      listItem.appendChild(checkbox);
                      listItem.appendChild(label);
                      membersList.appendChild(listItem);
                    }
                });
                adminList.innerHTML = membersList.innerHTML;
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



export async function ChatInit() {

  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
      window.location.href = '/#';
      return;
  }


  // Create WebSocket connection.
  // if (!socket)
  // {
    // socket = new WebSocket("ws://127.0.0.1:8000/ws/chat/");

    // // Connection opened
    // socket.addEventListener("open", (event) => {
    //   // socket.send("Hello Server!");
    //   console.log("start socket");
    // });

    // // Listen for messages
    // socket.addEventListener("message", (event) => {
    //   const message = JSON.parse(event.data).message;
    //   console.log("event.data");
    //   console.log(event.data);
    //   console.log("22message");
    //   console.log(message);
    //   console.log(message.UserName);
    //   console.log(message.message);
    //   addMessageToChat(message);
    // });
  // }

  let route = getHash();
  console.log(`-> 🦾 this.route :${route}`);

  channel_now = route;

  if (route != '/'){
    channel = route;
  }

  const button = document.getElementById('addChanel');
  console.log(button);
  if (button) {
    button.addEventListener('click', handleButtonClick);
  }

  // Escuchar clics en el botón de enviar.
  const sendButton = document.getElementById('sendButton');
  if (sendButton) {
    sendButton.addEventListener('click', handleSendClick);
  }


  // Manejar clics en el botón de agregar canal.
  const saveChannelButton = document.getElementById('saveChannelButton');
  if (saveChannelButton) {
    saveChannelButton.addEventListener('click', handleSaveChannelClick);

  }

  // let userId;

  let userId = getUserIdFromJWT(jwt);
  const channels = await getUserChannels(userId);

  if (channels.length > 0) {
    updateChannelListAndSubscribe(channels);
    channel = channels[0].id; // Establece el primer canal como el canal actual
  }
  // if (channels.length > 0) {
  //   channel = channels[0].id;
  //   channels.forEach(canal => {
  //       createWebSocketConnection(canal.id);
  //   });
  //   updateChannelList(channels);
  // }


  if (jwt) {
      const payload = jwt.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      userId = decodedPayload.user_id; // Asegúrate de que esta es la clave correcta para el ID del usuario
      // Realizar una solicitud al endpoint para obtener los canales del usuario
      console.log("userId:" + userId);
      // fetch(`http://localhost:8000/user-channels/${userId}/?format=json`)
      fetch(`${BACKEND_URL}/user-channels/${userId}/?format=json`)
          .then(response => response.json())
          .then(channels => {
              console.log("channels: ", channels);
              // Actualizar la UI con los nombres de los canales
              const channelsList = document.getElementById('channelsList'); // Asegúrate de que este es el ID correcto
              channelsList.innerHTML = ''; // Limpiar la lista actual
              channels.forEach(channel => {
                  console.log("channel: ", channel);
                  console.log("channel.name: " + channel.name);
                  const listItem = document.createElement('li');
                  if (channel.name.length != 0){
                    // listItem.textContent = channel.name; // Asume que los objetos de canal tienen un campo 'name'
                    listItem.innerHTML = `<a href="#chat/${channel.id}" class="text-decoration-none">${channel.name}</a>`;

                  }else{
                    listItem.innerHTML = `<a href="#chat/${channel.id}" class="text-decoration-none">${channel.id}</a>`;
                    // listItem.textContent = "default " + channel.id; // Asume que los objetos de canal tienen un campo 'name'
                  }
                  channelsList.appendChild(listItem);
              });
          })
          .catch(error => {
              console.error('Error fetching channels:', error);
          });
  }

  const responseMyUser = await fetch(`${BACKEND_URL}/api/me/`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  myUser = await responseMyUser.json();
  if (myUser.code === "user_not_found" || myUser.code === "token_not_valid") {
    window.location.replace("/#logout");
  }
  UserName = myUser.username;
}

// Función para obtener el ID del usuario del JWT
function getUserIdFromJWT(jwt) {
  const payload = jwt.split('.')[1];
  const decodedPayload = JSON.parse(atob(payload));
  return decodedPayload.user_id;
}

// Función para obtener los canales del usuario
async function getUserChannels(userId) {
  const response = await fetch(`${BACKEND_URL}/user-channels/${userId}/?format=json`);
  const data = await response.json();
  return data;
}

async function updateChannelListAndSubscribe(channels) {
  const channelsList = document.getElementById('channelsList');
  channelsList.innerHTML = '';
  channels.forEach(c => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="#chat/${c.id}">${c.name}</a>`;
    channelsList.appendChild(listItem);
    createWebSocketConnection(c.id);
  });
}

// Función para crear una conexión WebSocket
function createWebSocketConnection(channelId) {
  const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${channelId}/`);
  ws.addEventListener("message", (event) => {
      // const message = JSON.parse(event.data).message;
      const message = JSON.parse(event.data);
      console.log("--> Mensaje ❤️: ", message);
      addMessageToChat(message);
  });
  sockets[channelId] = ws; // Almacenar la conexión WebSocket
}

// function createWebSocketConnection(channelId) {
//   const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${channelId}/`);
//   ws.addEventListener("message", (event) => {
//       const message = JSON.parse(event.data).message;
//       addMessageToChat(message);
//   });
//   // Guardar la conexión WebSocket si es necesario
// }

// Función para actualizar la lista de canales en la UI
function updateChannelList(channels) {
  const channelsList = document.getElementById('channelsList');
  channelsList.innerHTML = '';
  channels.forEach(channel => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<a href="#chat/${channel.id}" class="text-decoration-none">${channel.name}</a>`;
      channelsList.appendChild(listItem);
  });
}


function handleSaveChannelClick() {
  // Obtén el nombre del canal y los usuarios seleccionados
  const channelName = document.getElementById('channelName').value;
  let selectedUsersMember = [...document.getElementById('channelMembers').querySelectorAll('input:checked')]
      .map(input => input.nextSibling.textContent);
  let selectedUsersAdmin = [...document.getElementById('channelAdmins').querySelectorAll('input:checked')]
      .map(input => input.nextSibling.textContent);

  selectedUsersMember.push(UserName);
  selectedUsersAdmin.push(UserName);

  // Unir los dos arrays
  let combinedArray = selectedUsersMember.concat(selectedUsersAdmin);

  // Eliminar duplicados
  selectedUsersMember = [...new Set(combinedArray)];


  // Obtener información sobre la privacidad del canal
  let isPrivate = document.getElementById('privateChannelCheckbox').checked;
  const channelPassword = isPrivate ? document.getElementById('channelPassword').value : '';

  if (isPrivate === true)
  {
    isPrivate = "private"
  }
  else
  {
    isPrivate = "public";
  }

  const channelData = {
    owner:UserName,
    name: channelName,
    status: isPrivate,
    password: channelPassword,
    members: selectedUsersMember,
    admins: selectedUsersAdmin
  };

  // Endpoint del backend (ajusta según tu configuración)
  const url = `${BACKEND_URL}/channels/create/`;
  
  // Opciones para la solicitud fetch
  const requestOptions = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(channelData)
  };


  // Muestra la información en la consola
  console.log("channelData: ", channelData);

  // Realizar la solicitud POST
  fetch(url, requestOptions)
  .then(response => response.json())
  .then(data => {
      console.log('Canal creado con éxito:', data);
      window.location.reload();
      // Aquí puedes manejar la respuesta del servidor, como actualizar la UI
  })
  .catch(error => {
      console.error('Error al crear el canal:', error);
  });

}

function createChannel(channelName, members) {
  // Deberás reemplazar esto con tu API real y el método de autenticación (por ejemplo, usando un token JWT).
  // fetch('http://127.0.0.1:8000/api/channels/', {
  fetch(`${BACKEND_URL}/api/channels/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`, // Asumiendo que estás usando JWT para autenticación
    },
    body: JSON.stringify({ name: channelName, members: members })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Channel created:', data);
    // Aquí puedes actualizar la lista de canales en la UI.
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}



// export function Chat() {
export  function Chat() {

  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
      window.location.href = '/#';
      return;
  }

  return `
    <div class="d-flex h-100">
       <!-- Left Panel: Channels -->
       <div class="w-25 h-100 bg-light p-3">
         <h3>Chat</h3>
         <div class="mb-4">
           <h4 class="d-flex justify-content-between">
             Channels
             <button id="addChanel"  class="btn btn-primary btn-sm">Add Channel</button>
           </h4>
           <ul id="channelsList" class="list-unstyled">
             <li class="mb-2"><a href="#chat/channel-alpha" class="text-decoration-none">#channel-alpha</a></li>
             <li class="mb-2"><a href="#chat/channel-beta" class="text-decoration-none">#channel-beta</a></li>
             <li class="mb-2"><a href="#chat/channel-charlie" class="text-decoration-none">#channel-charlie</a></li>
           </ul>
         </div>

         <h4 class="d-flex justify-content-between">
           Messages
           <button id="addMessages" class="btn btn-primary btn-sm">Add Messages</button>
         </h4>
         <ul class="list-unstyled">
           <li class="mb-2"><a href="#chat/username-a" class="text-decoration-none">username-a</a></li>
           <li class="mb-2"><a href="#chat/username-b" class="text-decoration-none">username-b</a></li>
           <li class="mb-2"><a href="#chat/username-c" class="text-decoration-none">username-c</a></li>
         </ul>

         <div class="mt-4 d-flex align-items-center">
           <img src="${image}" alt="User Image" class="rounded-circle mr-2" width="40">
           <div>
             <strong>username</strong>
             <button class="btn btn-link p-0">Logout</button>
           </div>
         </div>
       </div>

       <!-- Middle Panel: Chat Messages -->
       <div class="w-75 h-100 bg-white p-3 overflow-auto">
         <h3 class="mb-4">#channel-alpha</h3>

         <!-- Messages go here -->
         <!-- Repeat for other messages -->
         <!-- Lista de mensajes -->
          <ul id="messageList" class="list-unstyled">
            <!-- Aquí se agregarán los mensajes -->
          </ul>

         <!-- Textarea for new messages -->
         <div class="mt-3">
           <textarea id="messageTextarea" class="form-control" rows="3"></textarea>
           <button id="sendButton" class="btn btn-primary mt-2">Enviar</button>
         </div>
       </div>

    </div>

    <!-- Modal para crear un nuevo canal -->
    <div class="modal" tabindex="-1" role="dialog" id="channelModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Channel</h5>
            <button id="closeModalButton" type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <input type="text" id="channelName" class="form-control mb-2" placeholder="Channel Name" required>
            <!-- Aquí deberías insertar la lógica para seleccionar usuarios -->

            <input type="checkbox" id="privateChannelCheckbox"> Canal Privado
            <input type="password" id="channelPassword" placeholder="Contraseña del Canal">

            <p>Admins</p>
            <div class="form-control" id="channelAdmins">
              <!-- Opciones de usuarios se insertarán dinámicamente -->
            </div>

            <p>Members</p>
            <div class="form-control" id="channelMembers">
              <!-- Opciones de usuarios se insertarán dinámicamente -->
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" id="saveChannelButton" class="btn btn-primary">Save Channel</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    `;
}

{/* <select multiple class="form-control" id="channelMembers"></select> */}

export default Chat;

