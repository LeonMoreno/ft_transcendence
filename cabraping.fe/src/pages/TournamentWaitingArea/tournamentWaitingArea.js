import { getHash } from '../../utils/getHash.js';
import { getToken } from "../../utils/get-token.js";

// Extract the IP address from the URL used to access the frontend
const frontendURL = new URL(window.location.href);
const serverIPAddress = frontendURL.hostname;
const serverPort = 8000; // Specify the port your backend server is running on
const BACKEND_URL = `http://${serverIPAddress}:${serverPort}`;

// Fetch the list of participants from the server
async function fetchParticipants(tournamentId) {
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
            const participantName = participant.user.username || 'Unknown';
            const status = participant.accepted_invite ? 'Joined' : 'Waiting';
            console.log(`Participant: ${participantName}, Status: ${status}`); // Debugging log

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


// Check if all participants have accepted the invitation
function allParticipantsAccepted(participants) {
    return participants.every(participant => participant.accepted_invite);
}

// Enable or disable the start button based on participant status
function updateStartButton(participants) {
    const startButton = document.getElementById('startTournamentButton');
    if (allParticipantsAccepted(participants)) {
        startButton.disabled = false;
        //if event listener startButton click, go to remote users module
    } else {
        startButton.disabled = true;
    }
}

// Enable or disable the cancel button based on user role
function updateCancelButton(isCreator) {
    const cancelButton = document.getElementById('cancelTournamentButton');
    if (isCreator) {
        cancelButton.disabled = false;
    } else {
        cancelButton.disabled = true;
    }
}

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
    const tournamentId = getHash() || null; // Get the tournament ID from the URL or set to null if invalid
    if (!tournamentId) {
        console.error("Tournament ID is null or invalid");
        return; // Exit the function if tournamentId is not valid
    }

    const creatorUsername = localStorage.getItem('creatorUsername_' + tournamentId); // Get creator's username from local storage
    const isCreator = localStorage.getItem('username') === creatorUsername;

    const participants = await fetchParticipants(tournamentId);
    updateWaitingParticipantsList(participants);
    updateStartButton(participants);
    updateCancelButton(isCreator);

    setInterval(async () => {
        const participants = await fetchParticipants(tournamentId);
        updateWaitingParticipantsList(participants);
        updateStartButton(participants);
    }, 5000);
}

export { initializeTournamentWaitingArea };
