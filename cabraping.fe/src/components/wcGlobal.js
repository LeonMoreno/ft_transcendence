import { showNotificationPopup } from "./showNotification.js";
import { Chat_js } from "../pages/Chat/funcions-js.js"
import { Friends_js } from "../pages/Friends/funcions-js.js";

let WSsocket = null;  // Variable global para almacenar la instancia del WebSocket


// Función para filtrar mensajes según el dest_user_id
function filterMessagesForUser(message, userId) {
    return message.dest_user_id === userId.toString();
}
// Función para filtrar mensajes según el dest_user_id

function FilterUSerconnect(message, userId) {
    return message.user_ids;
}

// Función para conectar al WebSocket y escuchar mensajes
export function connectWebSocketGlobal() {
    if (WSsocket && WSsocket.readyState === WebSocket.OPEN) {
        console.log('WebSocket is already connected');
        return;
    }

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        console.error('No JWT token found in localStorage');
        return;
    }

    // Decodificar el JWT y obtener el ID
    // Extract user_id from JWT
    const payload = jwt.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    const id = decodedPayload.user_id;

    console.log(`--> 👋 User id:${id}`);

    // Conectarse al WebSocket
    const wsUrl = `ws://localhost:8000/ws/notifications/${id}/`;
    WSsocket = new WebSocket(wsUrl);

    // Manejar la conexión abierta
    WSsocket.onopen = function () {
        console.log('WebSocket connection opened');
    };

    // Manejar mensajes recibidos
    WSsocket.onmessage = function (event) {
        const message = JSON.parse(event.data);

        // message
        if (filterMessagesForUser(message, id)){

            switch (message.event) {
                case "game_invite":
                    showNotificationPopup(message.user_name, message.message);
                    break;
                case "channel_created":
                    showNotificationPopup(message.user_name, message.message);
                    Chat_js();
                    break;
                case "accepted_game":
                    showNotificationPopup(message.user_name, "Accept the Game. let's go");
                    window.location.href = `/#game/${message.message}`;
                    // rediret to the game
                    break;

                default:
                    break;
            }
        }
        if (FilterUSerconnect(message, id)){
            // Friends_js
            localStorage.setItem('id_active_users', JSON.stringify(message.user_ids));
            // Friends_js();
            Chat_js();
        }
    };

    // Manejar errores
    WSsocket.onerror = function (error) {
        console.error('WebSocket error:', error);
    };

    // Manejar el cierre de la conexión
    WSsocket.onclose = function (event) {
        console.log('WebSocket connection closed:', event);
        WSsocket = null;  // Reset the socket instance to allow reconnection if needed
    };
}


// Función para enviar un mensaje específico al WebSocket
export function sendChannelCreatedNotifications(userId, userName, destUserId) {

    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return;
    }
    
    const message = {
        type: "channel_created",
        message: "A new channel has been created.",
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };
    
    console.log("----------------------");
    console.log("Send message");
    console.log(message);
    console.log("----------------------");
    WSsocket.send(JSON.stringify(message));
}

// Función para enviar un mensaje específico al WebSocket
export function sendGameInvataeNotifications(userId, userName, destUserId) {

    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return;
    }
    
    const message = {
        type: "game_invite",
        message: "You have been invited to a game",
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };
    ;
    WSsocket.send(JSON.stringify(message));
}

// Función para enviar un mensaje específico al WebSocket
export function sendAcceptedGameNotifications(userId, userName, destUserId, game_id) {

    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return;
    }
    
    const message = {
        type: "accepted_game",
        message: String(game_id),
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };
    ;
    WSsocket.send(JSON.stringify(message));
}