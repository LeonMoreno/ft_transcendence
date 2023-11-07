import image from '../assets/logo.svg';
import getHash from "../utils/getHash";

let socket;

// handleSendClick = () => {
function handleSendClick() {
  const textarea = document.getElementById('messageTextarea');
  if (textarea) {
    const message = textarea.value;
    if (message.trim() !== '') {
      // Enviar el mensaje al servidor a través del WebSocket.
      console.log(message);
      socket.send(message);

      // Limpia el textarea después de enviar el mensaje.
      textarea.value = '';
      addMessageToChat(message);
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
    messageUsername.textContent = 'Username';
    const messageText = document.createElement('p');
    messageText.textContent = message;

    messageContent.appendChild(messageUsername);
    messageContent.appendChild(messageText);

    messageDiv.appendChild(userImage);
    messageDiv.appendChild(messageContent);

    messageList.appendChild(messageDiv);
  }
}


function handleButtonClick() {
  alert('Botón presionado!');
}


export function ChatInit() {

  // Create WebSocket connection.
  if (!socket)
  {
    socket = new WebSocket("ws://localhost:3000");

    // Connection opened
    socket.addEventListener("open", (event) => {
      // socket.send("Hello Server!");
      console.log("start socket");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      const message = event.data;
      addMessageToChat(message);
    });
  }

  let route = getHash();
  console.log(`-> 🦾 this.route :${route}`);

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
}


export function Chat() {
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
    `;
}

export default Chat;

