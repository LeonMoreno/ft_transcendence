import { getHash } from '../../utils/getHash.js';
import { getToken } from "../../utils/get-token.js";
import { showNotificationPopup } from '../../components/showNotification.js';
import { handleTournamentWebSocketMessage, activeWebSockets, connectWebSocketGlobal } from '../../components/wcGlobal.js';

// Extract the IP address from the URL used to access the frontend
const frontendURL = new URL(window.location.href);
const serverIPAddress = frontendURL.hostname;
const serverPort = 8000; // Specify the port your backend server is running on
const BACKEND_URL = `http://${serverIPAddress}:${serverPort}`;

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
            console.log('😸 🤣 😸 🤣Participants fetched: 😸 🤣 😸 🤣', participants);
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
/*export function updateWaitingParticipantsList(participants) {
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

        const startTournamentButton = document.getElementById('startTournamentButton');
        if (startTournamentButton) {
            const isEnabled = participants.length >= 3; // Adjust this as per your requirement
            startTournamentButton.disabled = !isEnabled;
        }
    }
}
*/

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
    if (allParticipantsAccepted(participants)) {
        startButton.disabled = false;
        if (!startButton.dataset.listenerAttached) {
            startButton.addEventListener('click', async function() {
                try {
                    const response = await fetch(`${BACKEND_URL}/api/tournament/${tournamentId}/set_ready/`, {
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
            startButton.dataset.listenerAttached = true;
        }
    } else {
        startButton.disabled = true;
    }
}


// Enable or disable the cancel button based on user role
/*function updateCancelButton(isCreator) {
    const cancelButton = document.getElementById('cancelTournamentButton');
    if (isCreator) {
        cancelButton.disabled = false;
        if (!cancelButton.dataset.listenerAttached) {
            cancelButton.addEventListener('click', function() {
                console.log("Creator canceled the tournament.");
                const tournamentId = localStorage.getItem('currentTournamentId');
                const message = {
                    type: 'tournament_canceled',
                    event: 'tournament_canceled',
                    message: 'The tournament has been canceled by the creator.',
                    tournament_id: tournamentId
                };
                activeWebSockets[tournamentId].send(JSON.stringify(message));
                //WSsocket.send(JSON.stringify(message));
            });
            cancelButton.dataset.listenerAttached = true;
        }
    } else {
        cancelButton.disabled = true;
    }
}*/

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
                showNotificationPopup('Cancellation Failed', 'Only the creator can cancel the tournament.');
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

            try {
                const response = await fetch(`${BACKEND_URL}/api/tournament/${tournamentId}/set_ready/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tournament_id: tournamentId,
                        user_id: localStorage.getItem('userId')
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
                showNotificationPopup('Cancelation failed.', 'Only the creator can cancel the tournament.');
            }
        });
    }
});

// Initialize the Tournament Waiting Area
/*async function initializeTournamentWaitingArea(tournamentId, isCreator) {
    const participants = await fetchParticipants(tournamentId);
    updateParticipantsList(participants);
    updateStartButton(participants);
    updateCancelButton(isCreator);

    // Set an interval to refresh the participant list every few seconds
    setInterval(async () => {
        const participants = await fetchParticipants(tournamentId);
        updateParticipantsList(participants);
        updateStartButton(participants);
    }, 5000);
} */
async function initializeTournamentWaitingArea() {
    const tournamentId = getHash() || null;
    if (!tournamentId) {
        console.error("Tournament ID is null or invalid");
        return;
    }

    const creatorUsername = localStorage.getItem('creatorUsername_' + tournamentId);
    const isCreator = localStorage.getItem('username') === creatorUsername;

    //const participants = await fetchParticipants(tournamentId);
    //updateWaitingParticipantsList(participants);
    //updateStartButton(participants);
   // updateCancelButton(isCreator);

    // Ensure WebSocket connection
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState === WebSocket.CLOSED) {
        connectTournamentWebSocket(tournamentId);
    }

    setInterval(async () => {
        const participants = await fetchParticipants(tournamentId);
        updateWaitingParticipantsList(participants);
        updateStartButton(participants);
        updateCancelButton(isCreator);
    }, 5000);
}

/*export function handleTournamentCanceled(message, tournamentId) {
    const creatorUsername = localStorage.getItem('creatorUsername_' + tournamentId);
    showNotificationPopup(creatorUsername, message);
    //delete all tournament data or update status and save data?
    setTimeout(() => {
        window.location.href = '/#'; 
    }, 3000);
}*/

export function handleTournamentCanceled(data) {
    const { message, tournament_id } = data;
    showNotificationPopup('Tournament canceled.', message);
    
    // Remove tournament data from local storage
    localStorage.removeItem('pageTournament');
    localStorage.removeItem(`creatorUsername_${tournament_id}`);
    localStorage.removeItem('currentTournamentId');
    
    setTimeout(() => {
        window.location.href = '/#';
    }, 3000);
}

function startTournament() {
    console.log('All participants are ready. Starting the tournament...');
   // window.location.href = `/tournament/${tournamentId}/remote-users`;
}

export { initializeTournamentWaitingArea };
