import { getHash } from '../../utils/getHash.js';
import { getToken } from "../../utils/get-token.js";
import { showNotificationPopup } from '../../components/showNotification.js';
import { handleTournamentWebSocketMessage, activeWebSockets, connectWebSocketGlobal, BACKEND_URL } from '../../components/wcGlobal.js';
import { connectTournamentWebSocket } from "../Tournament/funcions-js.js";
import { getUserIdFromJWT } from '../Chat/funcions-js.js';
import { handle_Tournmanet_game_invitte } from './game-logic.js';


// Check if all participants have accepted the invitation
function allParticipantsAccepted(participants) {
    return participants.every(participant => participant.accepted_invite);
}

// Enable or disable the start button based on participant status
function updateStartButton(participants) {
    const tournamentId = getHash() || null;
    if (!tournamentId) {
        console.error("Tournament ID is null or invalid");
        return;
    }
    const startButton = document.getElementById('startTournamentButton');
    if (!startButton) {
        console.error("startTournamentButton element not found");
        return;
    }

    if (allParticipantsAccepted(participants)) {
        startButton.disabled = false;
        if (!startButton.dataset.listenerAttached) {
            startButton.addEventListener('click', async function() {
                // const userId = localStorage.getItem('userId'); // Ensure userId is defined
                const userId = getUserIdFromJWT(); // Ensure userId is defined
                if (!userId) {
                    console.error("userId is not defined");
                    return;
                }

                try {
                    const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/set_ready/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            status: "in_progress"
                        })
                    });

                    if (response.ok) {
                        // Diego to do - logic game - update everigone
                        handle_Tournmanet_game_invitte(tournamentId);
                    } else {
                        console.error('Failed to notify the server about readiness');
                    }
                } catch (error) {
                    console.error('Error notifying the server about readiness:', error);
                }
            });
            startButton.dataset.listenerAttached = true;
        }
    } else {
        startButton.disabled = true;
    }
}

// Fetch the list of participants from the server
export async function fetchParticipants(tournamentId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/participants/status/?tournament_id=${tournamentId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const participants = await response.json(); 
            return participants.map(participant => ({
                username: participant.user.username, 
                accepted_invite: participant.accepted_invite
            }));
        } else {
            console.error('Failed to fetch participants status');
            return [];
        }
    } catch (error) {
        console.error('Error fetching participants:', error);
        return [];
    }
}

// Update the participant list in the UI
export function updateWaitingParticipantsList(participants) {
    const participantsList = document.getElementById('waitingParticipantsList');
    if (participantsList) {
        participantsList.innerHTML = ''; // Clear the current list

        participants.forEach(participant => {
            const participantName = participant.username || 'Unknown';
            const status = participant.accepted_invite ? 'Joined' : 'Waiting';
            const listItem = document.createElement('li');
            listItem.textContent = `${participantName} - ${status}`;
            participantsList.appendChild(listItem);
        });

        updateStartButton(participants);
    }
}

function updateCancelButton(isCreator) {
    const cancelButton = document.getElementById('cancelTournamentButton');
    if (cancelButton) {
        cancelButton.disabled = false; // Enable the button for all participants
        if (!cancelButton.dataset.listenerAttached) {
            cancelButton.addEventListener('click', function() {
                const tournamentId = localStorage.getItem('currentTournamentId');
                const creatorUsername = localStorage.getItem(`creatorUsername_${tournamentId}`);
                const currentUsername = localStorage.getItem('username');

                if (currentUsername === creatorUsername) {
                    console.log("Creator canceled the tournament.");
                    const message = {
                        type: 'tournament_canceled',
                        event: 'tournament_canceled',
                        message: 'The tournament has been canceled by the creator.',
                        tournament_id: tournamentId
                    };
                    if (activeWebSockets[tournamentId]) {
                        activeWebSockets[tournamentId].send(JSON.stringify(message));
                    } else {
                        console.error("WebSocket connection not found for tournament", tournamentId);
                    }
                } else {
                    showNotificationPopup('Cancellation failed.', 'Only the creator can cancel the tournament.');
                }
            });
            cancelButton.dataset.listenerAttached = true;
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Set up the event listener for the start button
    const startButton = document.getElementById('startTournamentButton');
    if (startButton) {
        startButton.addEventListener('click', async function() {
            const tournamentId = getHash() || null;
            if (!tournamentId) {
                console.error("Tournament ID is null or invalid");
                return;
            }

            // const userId = localStorage.getItem('userId');
            const userId = getUserIdFromJWT();
            if (!userId) {
                console.error("userId is not defined");
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/set_ready/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tournament_id: tournamentId,
                        user_id: userId
                    })
                });

                if (response.ok) {
                    console.log('User is ready for the tournament');
                } else {
                    console.error('Failed to notify the server about readiness');
                }
            } catch (error) {
                console.error('Error notifying the server about readiness:', error);
            }
        });
    }

    // Set up the event listener for the cancel button
    const cancelButton = document.getElementById('cancelTournamentButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            const tournamentId = localStorage.getItem('currentTournamentId');
            const message = {
                type: 'tournament_canceled',
                event: 'tournament_canceled',
                message: 'The tournament has been canceled by the creator.',
                tournament_id: tournamentId
            };
            if (activeWebSockets[tournamentId]) {
                activeWebSockets[tournamentId].send(JSON.stringify(message));
            } else {
                console.error("WebSocket connection not found for tournament", tournamentId);
            }
        });
    }
});

// Initialize the Tournament Waiting Area
async function initializeTournamentWaitingArea() {

    let jwt = localStorage.getItem('jwt');
    if (!jwt) {
      window.location.href = '/#';
      return;
    }

    const tournamentId = getHash() || null;
    if (!tournamentId) {
        console.error("Tournament ID is null or invalid");
        return;
    }

    const creatorUsername = localStorage.getItem('creatorUsername_' + tournamentId);
    const isCreator = localStorage.getItem('username') === creatorUsername;

    // Ensure WebSocket connection
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState === WebSocket.CLOSED) {
        connectTournamentWebSocket(tournamentId);
    }

    setInterval(async () => {
        const participants = await fetchParticipants(tournamentId);
        updateWaitingParticipantsList(participants);
        updateCancelButton(isCreator);
    }, 5000);
}

export function startTournament() {
    console.log('All participants are ready. Starting the tournament...');
    // window.location.href = `/tournament/${tournamentId}/remote-users`;
}

export function handleTournamentCanceled(data) {
    const { message, tournament_id } = data;
    showNotificationPopup('Tournament canceled.', message);
    
    // Remove tournament data from local storage
    localStorage.removeItem('pageTournament');
    localStorage.removeItem(`creatorUsername_${tournament_id}`);
    localStorage.removeItem('currentTournamentId');
    
    // Clear the participants list in the waiting area
    const participantsList = document.getElementById('waitingParticipantsList');
    if (participantsList) {
        participantsList.innerHTML = '';
    }
    
    // Clear form inputs
    const tournamentNameInput = document.getElementById('tournamentNameInput');
    if (tournamentNameInput) {
        tournamentNameInput.value = '';
    }
    const participantNameInput = document.getElementById('participantNameInput');
    if (participantNameInput) {
        participantNameInput.value = '';
    }

    // Close WebSocket connections
    if (activeWebSockets[tournament_id]) {
        activeWebSockets[tournament_id].close();
        delete activeWebSockets[tournament_id];
    }

    setTimeout(() => {
        window.location.href = '/#';
    }, 3000);
}

export { initializeTournamentWaitingArea };


/*import { getHash } from '../../utils/getHash.js';
import { getToken } from "../../utils/get-token.js";
import { showNotificationPopup } from '../../components/showNotification.js';
import { fetchParticipants, handleTournamentWebSocketMessage, activeWebSockets, connectWebSocketGlobal } from '../../components/wcGlobal.js';
import { connectTournamentWebSocket } from "../Tournament/funcions-js.js";
import { TournamentWaitingArea_html } from './html.js';

// Extract the IP address from the URL used to access the frontend
const frontendURL = new URL(window.location.href);
const serverIPAddress = frontendURL.hostname;
const serverPort = 8000; // Specify the port your backend server is running on
const BACKEND_URL = `http://${serverIPAddress}:${serverPort}`;

// Fetch the list of participants from the server

export function updateWaitingParticipantsList(participants) {
    const participantsList = document.getElementById('waitingParticipantsList');
    if (participantsList) {
        participantsList.innerHTML = ''; // Clear the current list

        participants.forEach(participant => {
            const participantName = participant.username || 'Unknown';
            const status = participant.accepted_invite ? 'Joined' : 'Waiting';
            console.log(`Participant: ${participantName}, Status: ${status}`); // Debugging log

            const listItem = document.createElement('li');
            listItem.textContent = `${participantName} - ${status}`;
            participantsList.appendChild(listItem);
        });

        const startTournamentButton = document.getElementById('startTournamentButton');
        if (startTournamentButton) {
            //const isEnabled = participants.length >= 3; // Adjust this as per your requirement
            const isEnabled = participants.filter(p => p.accepted_invite).length >= 4; // Ensure at least 4 participants have accepted
            startTournamentButton.disabled = !isEnabled;
        }
    }
}


// Check if all participants have accepted the invitation
function allParticipantsAccepted(participants) {
    return participants.every(participant => participant.accepted_invite);
}

// Enable or disable the start button based on participant status
function updateStartButton(participants) {
    const tournamentId = getHash() || null;
    if (!tournamentId) {
        console.error("Tournament ID is null or invalid");
        return;
    }
    const startButton = document.getElementById('startTournamentButton');
    if (!startButton) {
        console.error("startTournamentButton element not found");
        return;
    }

    if (allParticipantsAccepted(participants)) {
        startButton.disabled = false;
        if (!startButton.dataset.listenerAttached) {
            startButton.addEventListener('click', async function() {
                const userId = localStorage.getItem('userId'); 
                if (!userId) {
                    console.error("userId is not defined");
                    return;
                }
                try {
                    const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/set_ready/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            tournament_id: tournamentId,
                            user_id: userId
                        })
                    });

                    if (response.ok) {
                        const username = localStorage.getItem('username');
                        console.log(`Participant ${username} is ready for the tournament`);
                    } else {
                        console.error('Failed to notify the server about readiness');
                    }
                } catch (error) {
                    console.error('Error notifying the server about readiness:', error);
                }
            });
            startButton.dataset.listenerAttached = true;
        }
    } else {
        startButton.disabled = true;
    }
}

function updateCancelButton() {
    const cancelButton = document.getElementById('cancelTournamentButton');
    cancelButton.disabled = false; // Enable the button for all participants

    if (!cancelButton.dataset.listenerAttached) {
        cancelButton.addEventListener('click', function() {
            const tournamentId = localStorage.getItem('currentTournamentId');
            const creatorUsername = localStorage.getItem(`creatorUsername_${tournamentId}`);
            const currentUsername = localStorage.getItem('username');

            if (currentUsername === creatorUsername) {
                console.log("Creator canceled the tournament.");
                const message = {
                    type: 'tournament_canceled',
                    event: 'tournament_canceled',
                    message: 'The tournament has been canceled by the creator.',
                    tournament_id: tournamentId
                };
                if (activeWebSockets[tournamentId]) {
                    activeWebSockets[tournamentId].send(JSON.stringify(message));
                } else {
                    console.error("WebSocket connection not found for tournament", tournamentId);
                }
            } else {
                showNotificationPopup('Cancellation failed', 'Only the creator can cancel the tournament.');
            }
        });
        cancelButton.dataset.listenerAttached = true;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Set up the event listener for the start button
    const startButton = document.getElementById('startTournamentButton');
    if (startButton) {
        startButton.addEventListener('click', async function() {
            const tournamentId = getHash() || null;
            if (!tournamentId) {
                console.error("Tournament ID is null or invalid");
                return;
            }

            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error("userId is not defined");
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/set_ready/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tournament_id: tournamentId,
                        user_id: userId
                    })
                });

                if (response.ok) {
                    console.log('User is ready for the tournament');
                } else {
                    console.error('Failed to notify the server about readiness');
                }
            } catch (error) {
                console.error('Error notifying the server about readiness:', error);
            }
        });
    }

    // Set up the event listener for the cancel button
    const cancelButton = document.getElementById('cancelTournamentButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            const tournamentId = localStorage.getItem('currentTournamentId');
            const creatorUsername = localStorage.getItem(`creatorUsername_${tournamentId}`);
            const currentUsername = localStorage.getItem('username');
            if (currentUsername === creatorUsername) {
                const message = {
                    type: 'tournament_canceled',
                    event: 'tournament_canceled',
                    message: 'The tournament has been canceled by the creator.',
                    tournament_id: tournamentId
                };
                if (activeWebSockets[tournamentId]) {
                    activeWebSockets[tournamentId].send(JSON.stringify(message));
                } else {
                    console.error("WebSocket connection not found for tournament", tournamentId);
                }
            } else {
                showNotificationPopup('Cancellation failed.', 'Only the creator can cancel the tournament.');
            }
        });
    }

    const tournamentId = getHash() || null;
    if (!tournamentId) {
        console.error("Tournament ID is null or invalid");
        return;
    }

    const creatorUsername = localStorage.getItem('creatorUsername_' + tournamentId);
    const isCreator = localStorage.getItem('username') === creatorUsername;

    // Ensure WebSocket connection
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState === WebSocket.CLOSED) {
        connectTournamentWebSocket(tournamentId);
    }

    setInterval(async () => {
        const participants = await fetchParticipants(tournamentId);
        updateWaitingParticipantsList(participants);
        updateCancelButton(isCreator);
    }, 5000);
}


export { initializeTournamentWaitingArea };*/