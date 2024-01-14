import image from '../assets/logo.svg';
import getHash from "../utils/getHash";

let socket;
let UserName = "default";
let channel = "general";

// handleSendClick = () => {
function handleSendClick() {
  const textarea = document.getElementById('messageTextarea');
  if (textarea) {
    const message = textarea.value;
    if (message.trim() !== '') {

      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        const payload = jwt.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        UserName = decodedPayload.user_id;
      }

      let info_send = {
        "message": message,
        "channel": channel,
        "UserName": UserName,
      }

      // Enviar el mensaje al servidor a través del WebSocket.
      console.log("-> info_send");
      console.log(info_send);
      socket.send(JSON.stringify(info_send ));

      // Limpia el textarea después de enviar el mensaje.
      textarea.value = '';
      addMessageToChat(info_send);
    }
  }
}

function addMessageToChat(message) {
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


// function handleButtonClick() {

//   const modal = document.getElementById("channelModal");
//   if (modal) {
//     modal.style.display = 'block'; // Set the display to 'block' to make it visible
//   }

//   const closeModalButton = document.getElementById('closeModalButton');
//   if (closeModalButton) {
//     closeModalButton.addEventListener('click', () => {
//       const modal = document.getElementById("channelModal");
//       if (modal) {
//           modal.style.display = 'none'; // Hide the modal
//       }
//     });
//   }
// }

function handleButtonClick() {
  const modal = document.getElementById("channelModal");
    const membersList = document.getElementById("channelMembers");

    if (modal) {
        modal.style.display = 'block'; // Display the modal

        // Fetch the list of users
        fetch('http://127.0.0.1:8000/api/users/')
            .then(response => response.json())
            .then(users => {
                membersList.innerHTML = ''; // Clear existing list items
                users.forEach(user => {
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



export function ChatInit() {

  // Create WebSocket connection.
  if (!socket)
  {
    // socket = new WebSocket("ws://localhost:3000");
    socket = new WebSocket("ws://127.0.0.1:8000/ws/chat/");

    // Connection opened
    socket.addEventListener("open", (event) => {
      // socket.send("Hello Server!");
      console.log("start socket");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data).message;
      console.log("event.data");
      console.log(event.data);
      console.log("22message");
      console.log(message);
      console.log(message.UserName);
      console.log(message.message);
      addMessageToChat(message);
    });
  }

  let route = getHash();
  console.log(`-> 🦾 this.route :${route}`);

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

    // saveChannelButton.addEventListener('click', () => {
    //   const channelName = document.getElementById('channelName').value;
    //   const selectedMembers = [...document.getElementById('channelMembers').options]
    //                           .filter(option => option.selected)
    //                           .map(option => option.value);
    //   createChannel(channelName, selectedMembers);
    // });
  }
}

function handleSaveChannelClick() {
  // Obtén el nombre del canal y los usuarios seleccionados
  const channelName = document.getElementById('channelName').value;
  const selectedUsers = [...document.getElementById('channelMembers').querySelectorAll('input:checked')]
      .map(input => input.nextSibling.textContent);

  // Muestra la información en la consola
  console.log("Nombre del nuevo canal:", channelName);
  console.log("Usuarios seleccionados:", selectedUsers);
  console.log("Nombre del usuario actual:", UserName);
}

function createChannel(channelName, members) {
  // Deberás reemplazar esto con tu API real y el método de autenticación (por ejemplo, usando un token JWT).
  fetch('http://127.0.0.1:8000/api/channels/', {
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



export function Chat() {

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
           <ul class="list-unstyled">
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

