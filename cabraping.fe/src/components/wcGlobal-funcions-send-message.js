import { WSsocket, BACKEND_URL, WS_URL } from "./wcGlobal.js";

// Función para enviar un mensaje específico al WebSocket
export function sendAcceptedGameNotifications(userId, userName, destUserId, game_id) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "accepted_game",
        message: String(game_id),
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };

    WSsocket.send(JSON.stringify(message));
}

export function sendTournamentNotifications(userId, userName, destUserId, tournament_id, tournament_name) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return;
    }

    const message = {
        type: 'tournament_invite',
        message: 'You have been invited to join the tournament!',
        user_id: userId,
        user_name: userName,
        dest_user_id: destUserId,
        tournament_id: tournament_id,
        tournament_name: tournament_name
    };

    WSsocket.send(JSON.stringify(message));
}

// Función para enviar un mensaje específico al WebSocket
export function sendFriendRequestNotifications(userId, userName, destUserId) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "notify",
        message: "Send friend request",
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };

    WSsocket.send(JSON.stringify(message));
}

// Función para enviar un mensaje específico al WebSocket
export function sendFriendAcceptdNotifications(userId, userName, destUserId) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "notify",
        message: "Send accept friend",
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };

    WSsocket.send(JSON.stringify(message));
}

export function sendFriendDeletedNotifications(userId, userName, destUserId) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "notify",
        message: "Send accept friend",
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };

    WSsocket.send(JSON.stringify(message));
}

// Function to join the matchmaking queue
export function joinMatchmakingQueue(userId, userName) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "join_queue",
        user_id: String(userId),
        user_name: userName,
    };

    WSsocket.send(JSON.stringify(message));
}

// Función para enviar el mensaje de espera de coincidencia
export function sendWaitMatchedMessage(userId) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "wait_matched",
        message: "You are now waiting for a match.",
        user_id: String(userId)
    };

    WSsocket.send(JSON.stringify(message));
}

export function sendDelleteMatchedMessage(userId, otherId) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        "type": "delete_matched",
        "matched_user_ids": [String(userId), String(otherId)]
    }

    WSsocket.send(JSON.stringify(message));
}



export async function sendGameInitate_Waiting(userId, inviteId) {
    const jwt = localStorage.getItem('jwt');

    const response = await fetch(`${BACKEND_URL}/api/games/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            invitationStatus: "PENDING",
            inviter: userId,
            invitee: inviteId,
        }),
    });

    return response;
}

// Función para manejar el evento "update_waiting_list"
export async function handleUpdateWaitingList(message, userId, myUser) {
    const waitingIds = message.waiting_ids;
    console.log("---> Matching: waitingIds:", waitingIds, ",userId:", userId, ", myUser:", myUser);
    if (waitingIds.length >= 2) {
        for (let i = 1; i < waitingIds.length; i += 2) {
            if (waitingIds[i] === userId) {
                console.log("---> Matching: sendGameInitate_Waiting:", userId, waitingIds[i - 1]);
                let status = await sendGameInitate_Waiting(userId, waitingIds[i - 1]);
                if (status.ok) {
                    console.log("---> Matching: Se mando la invitacion a l juego:", userId, myUser.username, waitingIds[i - 1], "system");
                    sendGameInvataeNotifications(userId, myUser.username, waitingIds[i - 1], "system");
                }
                break;
            }
        }
    }
}

// Función para enviar un mensaje específico al WebSocket
export function sendChannelCreatedNotifications(userId, userName, destUserId) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "channel_created",
        message: "has created a new channel.",
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };

    WSsocket.send(JSON.stringify(message));
}

// Función para enviar un mensaje específico al WebSocket Diego
export function sendGameInvataeNotifications(userId, userName, destUserId, text) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "game_invite",
        message: text,
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };

    console.log("???");
    console.log("sendGameInvataeNotifications",message);

    WSsocket.send(JSON.stringify(message));
}

// Función para enviar un mensaje específico al WebSocket
export function sendGameInvataeTournamentNotifications(userId, userName, destUserId, text) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "notify",
        message: text,
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };

    WSsocket.send(JSON.stringify(message));
}

// Función para enviar un mensaje específico al WebSocket
export function sendGameAcceptTournamentNotifications(userId, userName, destUserId, text) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "notify",
        message: text,
        user_id: String(userId),
        user_name: userName,
        dest_user_id: String(destUserId)
    };

    WSsocket.send(JSON.stringify(message));
}

// Función para enviar un mensaje específico al WebSocket
export function sendWinnerOfGameTournamentNotifications(userId, userName, text) {
    if (!WSsocket || WSsocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket is not connected');
        return;
    }

    const message = {
        type: "notify",
        message: text,
        user_id: String(userId),
        user_name: userName,
        dest_user_id: 0
    };

    WSsocket.send(JSON.stringify(message));
}