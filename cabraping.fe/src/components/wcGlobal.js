import { showNotificationPopup } from "./showNotification.js";
import { Chat_Update_js, getUserIdFromJWT } from "../pages/Chat/funcions-js.js";;
import { Friends_js } from "../pages/Friends/funcions-js.js";
import { Users_js } from "../pages/Users/funcions-js.js";

import { updateParticipantsList, acceptTournamentInvitation, rejectTournamentInvitation, connectTournamentWebSocket, WS_check_the_torunament_pending } from "../pages/Tournament/funcions-js.js";
import { getToken } from "../utils/get-token.js";
import { showModal, hideModal } from "../utils/modal.js";
import { startTournament, handleTournamentCanceled } from "../pages/TournamentWaitingArea/functions-js.js";
import { updateWaitingParticipantsList } from "../pages/TournamentWaitingArea/functions-js.js";

import { sendAcceptedGameNotifications, sendTournamentNotifications, sendDelleteMatchedMessage, handleUpdateWaitingList } from "./wcGlobal-funcions-send-message.js";
import { sendGameAcceptTournament_final_Waiting, sendGameAcceptTournament_Waiting, system_invitte_game_Tournmanet } from "../pages/TournamentWaitingArea/game-logic.js";

const frontendURL = new URL(window.location.href);
const serverIPAddress = frontendURL.hostname;
const serverPort = 8000; // Specify the port your backend server is running on

/**
 * Enable/disable one of the BACKEND_URL & WS_URL pair
 * Similar with Django settings.py
 */

// Production with Docker: Use HTTPS and WSS
// export var BACKEND_URL = `https://localhost`;
// export var WS_URL = `wss://localhost`;

// Local development: Use HTTP and WS
// export var BACKEND_URL = `https://${serverIPAddress}`;
// export var WS_URL = `wss://${serverIPAddress}`;
export var BACKEND_URL = `https://${serverIPAddress}`;
export var WS_URL = `wss://${serverIPAddress}`;

// export var WS_URL = `wss://${serverIPAddress}:${serverPort}`;

export let WSsocket = null; // Variable global para almacenar la instancia del WebSocket

let myUser = null;
export let activeWebSockets = {}; // Track multiple WebSocket connections

// Filter messages based on the dest_user_id
function filterMessagesForUser(message, userId) {
    return String(message.dest_user_id) === userId.toString();
}

function handleWebSocketMessage(message, userId) {
    const myUser = userId;
    execute_processes_by_category_message(message, myUser);

    // Rachel tournament
    switch (message.event) {
        case 'accepted_invite':
            handleAcceptedInvite(message);
            break;
        case 'rejected_invite':
            handleRejectedInvite(message);
            break;
        case 'game_invite':
            if (message.type === 'tournament') {
                handleTournamentInvite(message, message.tournament_id);
            }
            else if (message.message === 'system' || message.message === 'system-tournament' || message.message === 'system-tournament-final')
            {
                return;
            }
            else {
                handleGameInvite(message);
            }
            break;
        case 'tournament_invite':
            console.log("🍀--> tournament_invite🍀:", message);
            handleTournamentInvite(message, message.tournament_id);
            break;
        case 'tournament_canceled':
            handleTournamentCanceled(message);
            break;
        //case 'tournament_aborted':
          //  handleTournamentCanceled(message);
            //break;
        default:
            console.log('Unknown event type:', message.event);
    }
}

function handleAcceptedInvite(message, tournamentId) {
    console.log(`Invitation accepted by ${message.user_name}`);
    updateParticipantsList(message.user_name, 'accepted', false);
    showNotificationPopup(message.user_name, `Invitation accepted by ${message.user_name}.`);
    checkStartTournament(tournamentId);
}

function handleRejectedInvite(message, tournamentId) {
    console.log(`Invitation rejected by ${message.user_name}`);
    updateParticipantsList(message.user_name, 'rejected', false);
    showNotificationPopup(message.user_name, `Invitation rejected by ${message.user_name}. Invite someone else or delete the tournament.`);
    checkStartTournament(tournamentId);
}

export function sendTournamentInvitation(tournamentId, participantUsername, participantId) {
    console.log(`😰Preparing to send tournament invitation for tournament [${tournamentId}] to [${participantUsername}] and id:[${participantId}]`);
    const tournamentName = localStorage.getItem(`tournamentName_${tournamentId}`);
    const creatorUsername = localStorage.getItem('username');
    const userId = getUserIdFromJWT();

    console.log(` 😰 activeWebSockets:`, activeWebSockets);
    console.log(` 😰 activeWebSockets[tournamentId]:`, activeWebSockets[tournamentId]);

    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState === WebSocket.CLOSED) {
        // const wsUrl = `ws://localhost:8000/ws/tournament/${tournamentId}/`;
        let jwt = getToken();
        const wsUrl = `ws://localhost:8000/ws/tournament/${tournamentId}/?token=${jwt}`;
        const tournamentSocket = new WebSocket(wsUrl);
        console.log(`🤖 tournamentSocket:`, tournamentSocket);

        tournamentSocket.onopen = function() {
            console.log(`🛜 WebSocket connection opened for tournament ${tournamentId}`);
            activeWebSockets[tournamentId] = tournamentSocket;
            sendMessage();
        };

        tournamentSocket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            console.log(`🛜 🛜TESTY TEST! Received WebSocket message for tournament ${tournamentId}:`);
            console.log(`🛜 🛜Received WebSocket message for tournament ${tournamentId}:`, data); // this is not printing to the console
            handleTournamentWebSocketMessage(data, tournamentId); // rachel - this is not being called
        };

        tournamentSocket.onclose = function(event) {
            console.log(`😅WebSocket connection closed for tournament ${tournamentId}:`, event);
            delete activeWebSockets[tournamentId];
        };

        tournamentSocket.onerror = function(error) {
            console.error(`🚨WebSocket error for tournament ${tournamentId}:`, error);
        };
    } else {

        // funcion to notify the invitee
        const data = create_data_for_TournamentWebSocket({
            tournamentId: tournamentId,
            event: "game_invite",
            type: "tournament",
            dest_user_id: String(participantId)
        });
        console.log("--> participantId:", participantId);
        console.log("👋 👋 data:", data);
        // destUserId;
        // handleTournamentWebSocketMessage(data, tournamentId);
        sendTournamentNotifications(userId, creatorUsername, String(participantId), tournamentId, tournamentName);
        // sendMessage();
    }

    async function sendMessage() {
        // const userId = localStorage.getItem('userId'); // ID of the sender
        const userId = getUserIdFromJWT(); // ID of the sender
        const creatorUsername = localStorage.getItem('username'); // Username of the sender
        const tournamentName = localStorage.getItem(`tournamentName_${tournamentId}`);
        console.log('Fetching recipient ID for username:', participantUsername);
        const recipientId = await getUserIdByUsername(participantUsername); // Function to get user ID by username

        if (!userId || !recipientId) {
            console.error('User ID or recipient ID is not set. User ID:', userId, 'Recipient ID:', recipientId);
            return;
        }

        const message = {
            type: 'tournament',
            event: 'tournament_invite',
            user_id: userId,
            message: `${creatorUsername} is inviting you to join the tournament ${tournamentName}. Do you think you have what it takes to win the prestigious Chèvre Verte Award?`,
            user_name: creatorUsername,
            dest_user_id: recipientId,
            tournament_id: tournamentId,
            tournament_name: tournamentName
        };

        console.log(`Sending tournament invitation message: ${JSON.stringify(message)}`);
        activeWebSockets[tournamentId].send(JSON.stringify(message)); // rachel - this is not sending?
    }
}

export async function getUserIdByUsername(username) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/users?username=${username}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`, 
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const users = await response.json();
            console.log('API response for user:', users); // Debugging log

            if (Array.isArray(users) && users.length > 0) {
                // Adjust this based on your API's response structure
                const user = users.find(user => user.username === username);
                if (user && user.id) {
                    return user.id;
                } else {
                    console.error('No user found with the given username');
                    return null;
                }
            } else {
                console.error('No users found in the response');
                return null;
            }
        } else {
            console.error('Failed to fetch user ID by username');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user ID by username:', error);
        return null;
    }
}

// Function to send a POST request to update the invite status
async function updateInviteStatus(tournamentId, accepted) {

    console.log("🚨🚨updateInviteStatus🚨🚨:", tournamentId, ", accepted:", accepted);

    const participants = await fetchParticipants(tournamentId);
    console.log("🚨🚨>participants:", participants);
    // const currentUserId = localStorage.getItem('userId');
    const currentUserId = getUserIdFromJWT();
    console.log("🚨🚨>currentUserId:", currentUserId);
    const participant = participants.find(p => String(p.user.id) === String(currentUserId));

    console.log("🚨🚨->participant:", participant);

    console.log("---------------");
    console.log("participant:", participant);
    if (!participant)
        return;

    const url = `${BACKEND_URL}/api/participants/${participant.id}/update_accepted_invite/`;
    const body = JSON.stringify({ accepted_invite: accepted });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error updating invite status:', errorText);
            showNotificationPopup('Error.', 'Error updating invite status: ' + errorText);
            return false;
        }

        const data = await response.json();
        console.log('🚨🚨-->>Invite status updated successfully:', data);
        //showNotificationPopup('Success.', 'Invite status updated successfully');
        return true;

    } catch (error) {
        console.error('Network error:', error);
        showNotificationPopup('Error.', 'Network error: ' + error.message);
        return false;
    }
}

export async function fetchParticipants(tournamentId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Error fetching tournament participants:', response.statusText);
            return null;
        }

        const tournament = await response.json();
        const participants = tournament.participants || [];
        console.log('Fetched participants:', participants); // Debugging statement
        return tournament.participants || [];
    } catch (error) {
        console.error('Network error fetching tournament participants:', error);
        return null;
    }
}


export function handleTournamentInvite(data, tournamentId) {
    console.log(`Tournament invitation received for tournament ${tournamentId}:`, data);
    // Set the message in the modal
    const message = `${data.user_name} invited you to the ${data.tournament_name} tournament!`;
    document.getElementById('tournamentInviteMessage').innerText = message;

    // Ensure WebSocket connection for the tournament
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState === WebSocket.CLOSED) {
        connectTournamentWebSocket(tournamentId);
    }

    // Show the modal
    showModal('tournamentInviteModal');

    // Attach event listeners for modal buttons
    document.getElementById('acceptTournamentInvite').onclick = async () => {

        // acceptTournamentInvitation
        const success = await updateInviteStatus(tournamentId, true);

        console.log("😆 updateInviteStatus:", success);

        // if (success) {
            acceptTournamentInvitation(tournamentId, data.user_name);
            hideModal('tournamentInviteModal');
        // }

    };
    document.getElementById('rejectTournamentInvite').onclick = async () => {

        const success = await updateInviteStatus(tournamentId, false);

        console.log("😆 updateInviteStatus:", success);

        rejectTournamentInvitation(tournamentId, data.user_name);
        hideModal('tournamentInviteModal');
    };

    updateParticipantsList(data, 'invited', tournamentId);
}


function handleGameInvite(data) {
    console.log('Game Invite:', data);
    showNotificationPopup(data.user_name, `You have been matched to play a game! ${data.user_name}`);
    //updateParticipantsList(data.user_name, 'invited');
}

export function create_data_for_TournamentWebSocket({tournamentId, event, type, dest_user_id} ) {
    // const userId = localStorage.getItem('userId');
    const userId = getUserIdFromJWT();
    const creatorUsername = localStorage.getItem('username');
    return {tournamentId: tournamentId, event: event , type: type, userName: creatorUsername, user_id: userId, dest_user_id: dest_user_id }
}

export async function handleTournamentWebSocketMessage(data, tournamentId) {
    console.log(`Received WebSocket message for tournament ${tournamentId}:`, data);
    let participants = [];
    switch (data.event) {
        case 'game_invite':
            if (data.type === 'tournament') {
                handleTournamentInvite(data, tournamentId);
            } else {
                handleGameInvite(data);
            }
            break;
        case 'accepted_invite':
        case 'rejected_invite':
        case 'user_connected':
        case 'user_disconnected':
        case 'update_user_list':
            participants = await fetchParticipants(tournamentId);
            updateWaitingParticipantsList(participants);
            break;
        case 'all_ready':  
            startTournament();
            break;
        case 'tournament_canceled':
        //case 'tournament_aborted':
            handleTournamentCanceled(data);
            break;
        default:
            console.log('Unknown event type:', data.event);
    }
}

function checkStartTournament(tournamentId) {
    const startTournamentButton = document.getElementById('startTournamentButton');
    checkAllParticipantsAccepted(tournamentId).then(allAccepted => {
        if (allAccepted) {
            startTournamentButton.disabled = false;
        } else {
            startTournamentButton.disabled = true;
        }
    });
}

// function execute_processes_by_category(message, myUser) {
function execute_processes_by_category_message(message, myUser) {
    switch (message.event) {
        case "channel_created":
            showNotificationPopup(message.user_name, message.message);
            Chat_Update_js();
            break;
        case "game_invite":
            console.log("💩 game_invite:", message);
            if (message.type && message.type === 'tournament') {
                return;
            } else if (message.message === 'system'){
                console.log("-> Matching showNotificationPopup");
                console.log("-> Matching showNotificationPopup message:", message,);
                console.log("-> Matching showNotificationPopup myUser:", myUser,);
                sendGameAccept_Waiting(message.dest_user_id, message.user_id, myUser);
            } else if (message.message === 'system-tournament'){
                console.log("-> system-tournament - Matching showNotificationPopup");
                console.log("-> system-tournament - Matching showNotificationPopup message:", message,);
                console.log("-> system-tournament - Matching showNotificationPopup myUser:", myUser,);
                console.log("-> system-tournament - Matching showNotificationPopup message.dest_user_id:", message.dest_user_id, ", message.user_id:", message.user_id);
                sendGameAcceptTournament_Waiting(message.dest_user_id, message.user_id, myUser)
                // sendGameAccept_Waiting(message.dest_user_id, message.user_id, myUser);
            } else if (message.message === 'system-tournament-final'){
                console.log("-> system-tournament - final showNotificationPopup");
                console.log("-> system-tournament - final showNotificationPopup message:", message,);
                console.log("-> system-tournament - final showNotificationPopup myUser:", myUser,);
                console.log("-> system-tournament - final showNotificationPopup message.dest_user_id:", message.dest_user_id, ", message.user_id:", message.user_id);
                // diego - aceptarjuego
                // sendGameAcceptTournament_Waiting(message.dest_user_id, message.user_id, myUser)
                // sendGameAcceptTournament_final_Waiting
                sendGameAcceptTournament_final_Waiting(message.dest_user_id, message.user_id, myUser);
            }else{
                showNotificationPopup(message.user_name, message.message);
            }
            break;
        case "accepted_game":
            console.log("💩 accepted_game:", message);
            Chat_Update_js();
            window.location.href = `/#game/${message.message}`;
            break;
        default:
            run_processes_per_message(message);
            break;
    }
}

function run_processes_per_message(message) {

    switch (message.message) {
        case "Send friend request":
            Friends_js();
            Users_js();
            Chat_Update_js();
            break;
        case "Send accept friend":
            Friends_js();
            Users_js();
            Chat_Update_js();
            break;
        case "Send delete friend":
            Friends_js();
            Users_js();
            Chat_Update_js();
            break;
        default:
            break;
    }
}


// Function to connect to the WebSocket and listen for messages
export async function connectWebSocketGlobal() {
    if (WSsocket && WSsocket.readyState === WebSocket.OPEN) {
        console.log('WebSocket is already connected');
        return;
    }

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        console.log('No JWT token found in localStorage'); // rachel - I changed this to log from error because it was bugging me on the console, ha!
        return;
    }

    if (!myUser) {
        const responseMyUser = await fetch(`${BACKEND_URL}/api/me/`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        myUser = await responseMyUser.json();
    }

  const payload = jwt.split(".")[1];
  const decodedPayload = JSON.parse(atob(payload));
  const id = decodedPayload.user_id;

  console.log(`--> 👋 User id:${id}`);

  //   // Conectarse al WebSocket
  const wsUrl = `${WS_URL}/ws/notifications/${id}/?token=${jwt}`;
  WSsocket = new WebSocket(wsUrl);

  console.log(WSsocket);

    WSsocket.onopen = function () {
        console.log('🤯  WebSocket connection opened');
    };

    WSsocket.onmessage = function (event) {
        const message = JSON.parse(event.data);

        console.log("--> 🎉 > 🎉 WSsocket.onmessage:", message);

        if (filterMessagesForUser(message, id)){
            handleWebSocketMessage(message, id);
        }

        switch (message.event) {
            case 'update_user_list':
                localStorage.setItem('id_active_users', JSON.stringify(message.user_ids));
                Chat_Update_js();
                Friends_js();
                Users_js();
                break;
            case 'update_waiting_list':
                console.log("--> Matching: 🍀 update_waiting_list 🍀", message);
                localStorage.setItem('update_waiting_list', JSON.stringify(message.waiting_ids));
                let id = getUserIdFromJWT();
                handleUpdateWaitingList(message, String(id), myUser);
                break;
            default:
                break;
        }

        Torunament_game_diego(message);


    };

    WSsocket.onerror = function (error) {
        console.log('WebSocket error:', error);
    };

    WSsocket.onclose = function (event) {
        console.log('WebSocket connection closed:', event);
        WSsocket = null;
    };
}

async function Torunament_game_diego(message) {
    // WS_check_the_torunament_pending
    let value = await WS_check_the_torunament_pending();
    if (!value)
    {
        return;
    }
    console.log("🎃 String(message.dest_user_id) === '0':", (message.dest_user_id === "0"), message);
    if (message.dest_user_id === "0" || message.dest_user_id === 0)
    {
        console.log("🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃🎃");

        let tournament_id = localStorage.getItem("currentTournamentId");
        console.log("🎃 🎃 tournament_id:", tournament_id);

        if (`system_Tournmanet_${tournament_id}` === message.message){
            console.log("🎃🎃 🎃🎃system_Tournmanet:", tournament_id);
            system_invitte_game_Tournmanet();
        }

        const words = message.message.split(':');
        console.log("🎃 🎃 > words:", words);
        console.log("🎃 🎃 > words.length:", length);

        if (words.length === 2 && `system_Tournmanet_${tournament_id}` === words[0]){
            console.log("🎃🎃 🎃🎃 🎃🎃system_Tournmanet:", tournament_id);
            localStorage.setItem(`system_Tournmanet_${tournament_id}_winner`, words[1]);
            localStorage.setItem(`system_Tournmanet_status_${tournament_id}_final`, "final");
        }
    }
}

async function sendGameAccept_Waiting(userId, dest_user_id, myUser) {
    let find_me = false;
    const jwt = localStorage.getItem('jwt');
    const update_waiting_list = localStorage.getItem('update_waiting_list');
    if (!jwt || !update_waiting_list) {
        return;
    }

    console.log("----> Matching: in sendGameAccept_Waiting:", update_waiting_list);

    const waitingIds = JSON.parse(update_waiting_list);
    if (waitingIds.length >= 2) {
        for (let i = 0; i + 1 < waitingIds.length; i += 2) {
            console.log("-----> Matching: if 1:", (Number(waitingIds[i]) === Number(userId)) );
            console.log("-----> Matching: if 2:", (Number(waitingIds[i + 1]) === Number(dest_user_id)) );
            if (Number(waitingIds[i]) === Number(userId) && Number(waitingIds[i + 1]) === Number(dest_user_id)) {
                find_me = true;
                break;
            }
        }
    }

    console.log("----> Matching: find_me:", find_me);
    if (!find_me) {
        return;
    }


    const payload = jwt.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    let my_id = decodedPayload.user_id;

    console.log("----> Matching: userId:", userId, ", dest_user_id:", dest_user_id);
    const responseGames = await fetch(`${BACKEND_URL}/api/games/`, {
        headers: { Authorization: `Bearer ${jwt}` },
    });
    const games = await responseGames.json();

    const game = games.find(
        (game) =>
            game.invitee.id === Number(userId) &&
            game.inviter.id === Number(dest_user_id) &&
            game.invitationStatus === "PENDING"
    );

    if (game) {
        const response = await fetch(
            `${BACKEND_URL}/api/games/${game.id}/accept_game/`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            console.log("error in system");
        }
        sendAcceptedGameNotifications(userId, myUser.userName, dest_user_id, game.id);
        sendDelleteMatchedMessage(userId, dest_user_id);
        window.location.href = `/#game/${game.id}`;
    }
}


// rachel - function to send tournament invitation
/*export function sendTournamentInvitation(tournamentId, username) {
    console.log(`Preparing to send tournament invitation for tournament ${tournamentId} to ${username}`);
    const tournamentName = localStorage.getItem(`tournamentName_${tournamentId}`);
    const userId = localStorage.getItem('userId');

    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState === WebSocket.CLOSED) {
        const wsUrl = `ws://localhost:8000/ws/tournament/${tournamentId}/`;
        const tournamentSocket = new WebSocket(wsUrl);

        tournamentSocket.onopen = function() {
            console.log(`WebSocket connection opened for tournament ${tournamentId}`);
            activeWebSockets[tournamentId] = tournamentSocket;
            sendMessage();
        };

        tournamentSocket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            handleTournamentWebSocketMessage(data, tournamentId);
        };

        tournamentSocket.onclose = function(event) {
            console.log(`WebSocket connection closed for tournament ${tournamentId}:`, event);
            delete activeWebSockets[tournamentId];
        };

        tournamentSocket.onerror = function(error) {
            console.error(`WebSocket error for tournament ${tournamentId}:`, error);
        };
    } else {
        sendMessage();
    }

    function sendMessage() {
        const userId = localStorage.getItem('userId');
        const message = {
            type: 'tournament',
            event: 'game_invite',
            user_id: userId,
            message: `${userId} is inviting you to join the tournament ${tournamentName}. Do you think you have what it takes to win the prestigious Chèvre Verte Award?`,
            user_name: localStorage.getItem('username'),
            dest_user_id: username,
            tournament_id: tournamentId
        };
        console.log(`Sending tournament invitation message: ${JSON.stringify(message)}`);
        activeWebSockets[tournamentId].send(JSON.stringify(message));
    }
}

*/
