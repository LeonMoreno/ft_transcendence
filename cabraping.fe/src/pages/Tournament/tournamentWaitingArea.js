import { getHash } from '../../utils/getHash.js';
import { getToken } from "../../utils/get-token.js";

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
            return participants;
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
function updateParticipantsList(participants) {
    const participantsList = document.getElementById('participantsList');
    participantsList.innerHTML = '';

    participants.forEach(participant => {
        const listItem = document.createElement('li');
        listItem.textContent = `${participant.username} - ${participant.accepted_invite ? 'Joined' : 'Waiting'}`;
        participantsList.appendChild(listItem);
    });
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
        //if event listener startButton, go to remote users module
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

    const isCreator = localStorage.getItem('username') === 'creator_username'; // check

    const participants = await fetchParticipants(tournamentId);
    updateParticipantsList(participants);
    updateStartButton(participants);
    updateCancelButton(isCreator);

    setInterval(async () => {
        const participants = await fetchParticipants(tournamentId);
        updateParticipantsList(participants);
        updateStartButton(participants);
    }, 5000);
}

export { initializeTournamentWaitingArea };
