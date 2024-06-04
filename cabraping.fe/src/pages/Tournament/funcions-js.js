/*import { getToken } from "../../utils/get-token.js";
import { showNotification, showNotificationPopup } from '../../components/showNotification.js';
import { activeWebSockets, handleTournamentWebSocketMessage } from '../../components/wcGlobal.js';

const BACKEND_URL = "http://localhost:8000";
let invitedParticipants = [];
let acceptedParticipants = [];

export function TournamentInit() {
    console.log("Initializing Tournament Page");

    const tournamentForm = document.getElementById('tournamentForm');
    if (tournamentForm) {
        tournamentForm.addEventListener('submit', handleCreateTournament);
        console.log("Event listener added to tournament form");
    } else {
        console.error("Tournament form not found");
    }

    const addParticipantButton = document.getElementById('addParticipantButton');
    if (addParticipantButton) {
        addParticipantButton.addEventListener('click', checkAddParticipantButton);
        console.log("Event listener added to add participant button");
    } else {
        console.error("Add participant button not found");
    }

    const participantNameInput = document.getElementById('participantNameInput');
    if (participantNameInput) {
        participantNameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                checkAddParticipantButton(event);
            }
        });
        console.log("Event listener added for Enter key on participant name input");
    } else {
        console.error("Participant name input not found");
    }

    const startTournamentButton = document.getElementById('startTournamentButton');
    if (startTournamentButton) {
        startTournamentButton.addEventListener('click', () => {
            const tournamentId = localStorage.getItem('currentTournamentId');
            startTournament(tournamentId);
        });
        console.log("Event listener added to start tournament button");
    } else {
        console.error("Start tournament button not found");
    }
}

export function connectTournamentWebSocket(tournamentId) {
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState === WebSocket.CLOSED) {
        const wsUrl = `ws://localhost:8000/ws/tournament/${tournamentId}/`;
        const tournamentSocket = new WebSocket(wsUrl);

        tournamentSocket.onopen = function() {
            console.log(`WebSocket connection opened for tournament ${tournamentId}`);
            activeWebSockets[tournamentId] = tournamentSocket;
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
    }
}

async function handleAddParticipant(e) {
    e.preventDefault();

    const participantName = document.getElementById('participantNameInput').value.trim();
    if (!participantName) {
        displayErrorMessage('Participant name cannot be empty.');
        return;
    }

    const currentUser = localStorage.getItem('username');
    if (participantName === currentUser) {
        displayErrorMessage('You cannot invite yourself to the party. Have some manners!');
        return;
    }

    const tournamentId = localStorage.getItem('currentTournamentId');
    if (!tournamentId) {
        displayErrorMessage('No tournament ID found. Please create a tournament first.');
        return;
    }

    const isOnline = await checkUserOnlineStatus(participantName);
    if (isOnline === null) {
        displayErrorMessage("User not found. Please double-check their username.");
    } else if (isOnline) {
        const participantId = await getParticipantId(participantName, tournamentId);
        if (participantId) {
            console.log(`Sending tournament invitation to ${participantName}`);
            sendTournamentInvitation(tournamentId, participantName);
            updateParticipantsList(participantName, 'invited');
        } else {
            displayErrorMessage("Failed to get participant ID.");
        }
    } else {
        displayErrorMessage("Participant is not online.");
        console.log("Participant is not online.");
    }
    document.getElementById('participantNameInput').value = ''; // Clear input after adding
}

function checkAddParticipantButton(e) {
    if (e.type === 'keydown' && e.key !== 'Enter') {
        return; // handles only enter key for keydown events
    }

    const addParticipantButton = document.getElementById('addParticipantButton');
    if (addParticipantButton.disabled) {
        e.preventDefault();
        displayErrorMessage('Please create the tournament first before adding participants.');
        return;
    }
    handleAddParticipant(e);
}

async function checkAllParticipantsAccepted(tournamentId) {
    try {
        if (!tournamentId) {
            console.error('Tournament ID is null or undefined');
            return;
        }
        const response = await fetch(`${BACKEND_URL}/api/participants/status/?tournament_id=${tournamentId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const participants = await response.json();
            const allAccepted = participants.every(participant => participant.accepted_invite);
            updateStartTournamentButtonState(participants);
            return allAccepted;
        } else {
            console.error('Failed to fetch participants status');
            return false;
        }
    } catch (error) {
        console.error('Error checking participants acceptance:', error);
        return false;
    }
}

function updateStartTournamentButtonState(participants) {
    const startTournamentButton = document.getElementById('startTournamentButton');
    const acceptedCount = participants.filter(participant => participant.accepted_invite).length;
    if (acceptedCount === 4) { // Including the creator
        startTournamentButton.disabled = false;
    } else {
        startTournamentButton.disabled = true;
    }
}

export function updateParticipantsList(participantName, status, isCreator = false) {
    const currentUser = localStorage.getItem('username');
    const participantsList = document.getElementById('participantsList');
    if (participantsList) {
        const existingParticipant = Array.from(participantsList.children).find(item => item.textContent.includes(participantName));
        if (existingParticipant) {
            existingParticipant.textContent = participantName + ' - ' + status;
            displayErrorMessage('This user has been invited already. Don\'t be pushy.');
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = isCreator ? participantName : participantName + ' - ' + "invited";
            participantsList.appendChild(listItem);
            if (!isCreator) {
                showNotificationPopup(currentUser, 'Invitation successfully sent to ' + participantName + '.', 'success');
            }
        }
        checkAllParticipantsAccepted(localStorage.getItem('currentTournamentId'));
    } else {
        displayErrorMessage("Participant list unavailable.");
    }
}

async function checkUserOnlineStatus(username) {
    console.log(`Checking online status for user: ${username}`);
    try {
        const exists = await userExists(username); // checks if the user exists first
        if (!exists) {
            displayErrorMessage("User not found. Please double-check their nickname.");
            return null; // User does not exist
        }

        const response = await fetch(`${BACKEND_URL}/api/users/${username}/status/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
            console.error(`Error checking user online status: ${response.status} ${response.statusText}`);
            displayErrorMessage("An error occurred while checking the user's online status.");
            return null;
        }

        const data = await response.json();
        console.log(`User online status: ${data.isOnline}`);
        return data.isOnline;

    } catch (error) {
        console.error('Error checking user online status:', error);
        displayErrorMessage("An error occurred while checking the user's online status.");
        return null;
    }
}

async function userExists(username) {
    console.log(`Checking if user exists: ${username}`);
    try {
        const response = await fetch(`${BACKEND_URL}/api/users/${username}/exists/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response status: ${response.status}`);

        if (response.status === 404) {
            console.log(`User ${username} not found.`);
            return false;
        }

        if (!response.ok) {
            console.error(`Error checking user existence: ${response.status} ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        return data.exists;

    } catch (error) {
        console.error('Error checking if user exists:', error);
        return false;
    }
}

function displayNotification(message) {
    const modal = document.getElementById('notificationModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeButton = document.getElementById('closeModalButton');

    if (!modal || !modalMessage || !closeButton) {
        console.error('Notification modal elements not found');
        return;
    }

    modalMessage.textContent = message;
    modal.style.display = 'block';

    closeButton.onclick = function() {
        modal.style.display = 'none';
    };
}

function displayErrorMessage(message) {
    displayNotification(message);
}

async function getParticipantId(username, tournamentId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/participants/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, tournament: tournamentId })
        });

        if (response.ok) {
            const data = await response.json();
            return data.id;
        } else {
            console.error('Failed to get participant ID');
            return null;
        }
    } catch (error) {
        console.error('Error getting participant ID:', error);
        return null;
    }
}

async function handleCreateTournament(e) {
    e.preventDefault();
    console.log("Create Tournament form submitted");
    const tournamentName = document.getElementById('tournamentNameInput').value.trim();
    if (!tournamentName) {
        displayErrorMessage('Tournament name cannot be empty.');
        return;
    }
    try {
        const response = await createTournament(tournamentName);
        console.log('Response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            showNotification("Tournament created successfully", "success");
            document.getElementById('tournamentNameInput').value = '';
            localStorage.setItem('currentTournamentId', data.id);
            localStorage.setItem(`tournamentName_${data.id}`, tournamentName); 
            updateParticipantsList('You (Creator)', 'invited', true); // Automatically adds the creator as a participant
            
            connectTournamentWebSocket(data.id);

            const addParticipantButton = document.getElementById('addParticipantButton');
            addParticipantButton.disabled = false;
        } else {
            const errorMessage = await response.text();
            console.error('Error from server:', errorMessage);
            throw new Error('Failed to create tournament. Server responded with an error.');
        }
    } catch (error) {
        console.error('Caught error:', error);
        displayErrorMessage(error.message);
    }
}

async function createTournament(tournamentName) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/tournaments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name: tournamentName })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response text:', errorText);
            throw new Error('Network response was not ok');
        }
        return response;

    } catch (error) {
        console.error('Network error:', error);
        throw error;
    }
}

function acceptInvitation(tournamentId, username) {
    const message = {
        type: 'tournament',
        event: 'accepted_invite',
        message: `User ${username} accepted the tournament invitation ${tournamentId}`,
        user_id: localStorage.getItem('userId'),
        user_name: localStorage.getItem('username'),
        dest_user_id: username,
        tournament_id: tournamentId
    };

    activeWebSockets[tournamentId].send(JSON.stringify(message));
}

function rejectInvitation(tournamentId, username) {
    const message = {
        type: 'tournament',
        event: 'rejected_invite',
        message: `User ${username} rejected the tournament invitation ${tournamentId}`,
        user_id: localStorage.getItem('userId'),
        user_name: localStorage.getItem('username'),
        dest_user_id: username,
        tournament_id: tournamentId
    };

    activeWebSockets[tournamentId].send(JSON.stringify(message));
}

async function startTournament(tournamentId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/start_tournament/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`Tournament ${tournamentId} started successfully`, data);
            // call goat image and sound?
            // call Jonathan's remote players module here
        } else {
            const errorData = await response.json();
            console.error('Failed to start tournament:', errorData);
            displayErrorMessage('Failed to start tournament: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error starting tournament:', error);
        displayErrorMessage('Error starting tournament.');
    }
}

export {
    createTournament,
    handleCreateTournament,
    handleAddParticipant,
    displayNotification,
    displayErrorMessage,
    checkUserOnlineStatus,
    startTournament,
  //  TournamentInit
};

*/

import { getToken } from "../../utils/get-token.js";
import { showNotification, showNotificationPopup } from '../../components/showNotification.js';
import { sendTournamentInvitation, activeWebSockets, handleTournamentWebSocketMessage, getUserIdByUsername } from '../../components/wcGlobal.js';

const BACKEND_URL = "http://localhost:8000";
let invitedParticipants = [];  // List to keep track of invited participants
let acceptedParticipants = []; // List to keep track of accepted participants

function TournamentInit() {
    console.log("Initializing Tournament Page");

    const tournamentForm = document.getElementById('tournamentForm');
    if (tournamentForm) {
        tournamentForm.addEventListener('submit', handleCreateTournament);
        console.log("Event listener added to tournament form");
    } else {
        console.error("Tournament form not found");
    }

    const addParticipantButton = document.getElementById('addParticipantButton');
    if (addParticipantButton) {
        addParticipantButton.addEventListener('click', checkAddParticipantButton);
        console.log("Event listener added to add participant button");
    } else {
        console.error("Add participant button not found");
    }

    const participantNameInput = document.getElementById('participantNameInput');
    if (participantNameInput) {
        participantNameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                checkAddParticipantButton(event);
            }
        });
        console.log("Event listener added for Enter key on participant name input");
    } else {
        console.error("Participant name input not found");
    }

    const startTournamentButton = document.getElementById('startTournamentButton');
    if (startTournamentButton) {
        startTournamentButton.addEventListener('click', () => {
            const tournamentId = localStorage.getItem('currentTournamentId');
            startTournament(tournamentId);
        });
        console.log("Event listener added to start tournament button");
    } else {
        console.error("Start tournament button not found");
    }
}

// Establish WebSocket connection
export function connectTournamentWebSocket(tournamentId) {
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState === WebSocket.CLOSED) {
        const wsUrl = `ws://localhost:8000/ws/tournament/${tournamentId}/`;
        const tournamentSocket = new WebSocket(wsUrl);

        tournamentSocket.onopen = function() {
            console.log(`WebSocket connection opened for tournament ${tournamentId}`);
            activeWebSockets[tournamentId] = tournamentSocket;
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
    }
}

async function handleAddParticipant(e) {
    e.preventDefault();

    const participantName = document.getElementById('participantNameInput').value.trim();
    if (!participantName) {
        displayErrorMessage('Participant name cannot be empty.');
        return;
    }

    const currentUser = localStorage.getItem('username');
    if (participantName === currentUser) {
        displayErrorMessage('You cannot invite yourself to the party. Have some manners!');
        return;
    }

    const tournamentId = localStorage.getItem('currentTournamentId');
    if (!tournamentId) {
        displayErrorMessage('No tournament ID found. Please create a tournament first.');
        return;
    }

    const isOnline = await checkUserOnlineStatus(participantName);
    if (isOnline === null) {
        displayErrorMessage("User not found. Please double-check their username.");
    } else if (isOnline) {
        const participantId = await getParticipantId(participantName, tournamentId);
        if (participantId) {
            console.log(`Sending tournament invitation to ${participantName}`);
            sendTournamentInvitation(tournamentId, participantName);
            updateParticipantsList(participantName, 'invited');
        } else {
            displayErrorMessage("Failed to get participant ID.");
        }
    } else {
        displayErrorMessage("Participant is not online.");
        console.log("Participant is not online.");
    }
    document.getElementById('participantNameInput').value = ''; // Clear input after adding
}

function checkAddParticipantButton(e) {
    if (e.type === 'keydown' && e.key !== 'Enter') {
        return; // handles only enter key for keydown events
    }

    const addParticipantButton = document.getElementById('addParticipantButton');
    if (addParticipantButton.disabled) {
        e.preventDefault();
        displayErrorMessage('Please create the tournament first before adding participants.');
        return;
    }
    handleAddParticipant(e);
}

async function checkAllParticipantsAccepted(tournamentId) {
    try {
        if (!tournamentId) {
            console.error('Tournament ID is null or undefined');
            return;
        }
        const response = await fetch(`${BACKEND_URL}/api/participants/status/?tournament_id=${tournamentId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const participants = await response.json();
            const allAccepted = participants.every(participant => participant.accepted_invite);
            updateStartTournamentButtonState(participants);
            return allAccepted;
        } else {
            console.error('Failed to fetch participants status');
            return false;
        }
    } catch (error) {
        console.error('Error checking participants acceptance:', error);
        return false;
    }
}

function updateStartTournamentButtonState(participants) {
    const startTournamentButton = document.getElementById('startTournamentButton');
    const acceptedCount = participants.filter(participant => participant.accepted_invite).length;
    if (acceptedCount === 4) { // Including the creator
        startTournamentButton.disabled = false;
    } else {
        startTournamentButton.disabled = true;
    }
}

// Function to update the list of participants in the UI
export function updateParticipantsList(participantName, status, isCreator = false) {
    const currentUser = localStorage.getItem('username');
    if (participantName === currentUser) {
        displayErrorMessage('You cannot invite yourself to the party. Have some manners!');
        return;
    }
    const participantsList = document.getElementById('participantsList');
    if (participantsList) {
        // Check if the participant is already in the list to avoid duplication
        const existingParticipant = Array.from(participantsList.children).find(item => item.textContent.includes(participantName));
        if (existingParticipant) {
            existingParticipant.textContent = participantName + ' - ' + status;
            displayErrorMessage('This user has been invited already. Don\'t be pushy.');
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = isCreator ? participantName : participantName + ' - ' + "invited";
            participantsList.appendChild(listItem);
            if (!isCreator) {
                showNotification('Invitation successfully sent to ' + participantName + '.', 'success');
            }
        }
        checkAllParticipantsAccepted(localStorage.getItem('currentTournamentId'));
    } else {
        displayErrorMessage("Participant list unavailable.");
    }
}

async function checkUserOnlineStatus(username) {
    console.log(`Checking online status for user: ${username}`);
    try {
        const exists = await userExists(username); // checks if the user exists first
        if (!exists) {
            displayErrorMessage("User not found. Please double-check their nickname.");
            return null; // User does not exist
        }

        const response = await fetch(`${BACKEND_URL}/api/users/${username}/status/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
            console.error(`Error checking user online status: ${response.status} ${response.statusText}`);
            displayErrorMessage("An error occurred while checking the user's online status.");
            return null;
        }

        const data = await response.json();
        console.log(`User online status: ${data.isOnline}`);
        return data.isOnline;

    } catch (error) {
        console.error('Error checking user online status:', error);
        displayErrorMessage("An error occurred while checking the user's online status.");
        return null;
    }
}

async function userExists(username) {
    console.log(`Checking if user exists: ${username}`);
    try {
        const response = await fetch(`${BACKEND_URL}/api/users/${username}/exists/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        //const response = await getUserIdByUsername(username);
        console.log(`Response status: ${response.status}`);

        if (response.status === 404) {
            console.log(`User ${username} not found.`);
            return false;
        }

        if (!response.ok) {
            console.error(`Error checking user existence: ${response.status} ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        if (data.exists) {
            console.log(`User ${username} exists.`);
        } else {
            console.log(`User ${username} does not exist.`);
        }
        return data.exists;

    } catch (error) {
        console.error('Error checking if user exists:', error);
        return false;
    }
}

function displayNotification(message) {
    const modal = document.getElementById('notificationModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeButton = document.getElementById('closeModalButton');

    if (!modal || !modalMessage || !closeButton) {
        console.error('Notification modal elements not found');
        return;
    }

    modalMessage.textContent = message;
    modal.style.display = 'block';

    closeButton.onclick = function() {
        modal.style.display = 'none';
    };
}

function displayErrorMessage(message) {
    displayNotification(message);
}

async function getParticipantId(username, tournamentId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/participants/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, tournament: tournamentId })
        });

        if (response.ok) {
            const data = await response.json();
            return data.id;
        } else {
            console.error('Failed to get participant ID');
            return null;
        }
    } catch (error) {
        console.error('Error getting participant ID:', error);
        return null;
    }
}

async function handleCreateTournament(e) {
    e.preventDefault();
    console.log("Create Tournament form submitted");
    const tournamentName = document.getElementById('tournamentNameInput').value.trim();
    if (!tournamentName) {
        displayErrorMessage('Tournament name cannot be empty.');
        return;
    }
    try { // rachel - enable the below once the tournaments are up and running
        /*const currentTournamentId = localStorage.getItem('currentTournamentId');
        if (currentTournamentId) {
            displayErrorMessage('You cannot create another tournament while the previous one is not finished.');
            return;
        }*/
        const response = await createTournament(tournamentName);
        console.log('Response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            showNotification("Tournament created successfully", "success");
            document.getElementById('tournamentNameInput').value = '';
            localStorage.setItem('currentTournamentId', data.id);
            localStorage.setItem(`tournamentName_${data.id}`, tournamentName); 
            updateParticipantsList('You (Creator)', 'invited', true); // Automatically adds the creator as a participant
            
            connectTournamentWebSocket(data.id);

            const addParticipantButton = document.getElementById('addParticipantButton');
            addParticipantButton.disabled = false;
        } else {
            const errorMessage = await response.text(); // Log the error message from the response
            console.error('Error from server:', errorMessage);
            throw new Error('Failed to create tournament. Server responded with an error.');
        }
    } catch (error) {
        console.error('Caught error:', error);
        displayErrorMessage(error.message);
    }
}

async function createTournament(tournamentName) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/tournaments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name: tournamentName })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response text:', errorText);
            throw new Error('Network response was not ok');
        }
        return response;

    } catch (error) {
        console.error('Network error:', error);
        throw error;
    }
}

function acceptInvitation(tournamentId, username) {
    const message = {
        type: 'tournament',
        event: 'accepted_invite',
        message: `User ${username} accepted the tournament invitation ${tournamentId}`,
        user_id: localStorage.getItem('userId'),
        user_name: localStorage.getItem('username'),
        dest_user_id: username,
        tournament_id: tournamentId
    };

    activeWebSockets[tournamentId].send(JSON.stringify(message));
}

function rejectInvitation(tournamentId, username) {
    const message = {
        type: 'tournament',
        event: 'rejected_invite',
        message: `User ${username} rejected the tournament invitation ${tournamentId}`,
        user_id: localStorage.getItem('userId'),
        user_name: localStorage.getItem('username'),
        dest_user_id: username,
        tournament_id: tournamentId
    };

    activeWebSockets[tournamentId].send(JSON.stringify(message));
}

async function startTournament(tournamentId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/start_tournament/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`Tournament ${tournamentId} started successfully`, data);
            // call goat image and sound?
            // call Jonathan's remote players module here
        } else {
            const errorData = await response.json();
            console.error('Failed to start tournament:', errorData);
            displayErrorMessage('Failed to start tournament: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error starting tournament:', error);
        displayErrorMessage('Error starting tournament.');
    }
}

export {
    createTournament,
    handleCreateTournament,
    handleAddParticipant,
    displayNotification,
    displayErrorMessage,
    checkUserOnlineStatus,
    startTournament,
    TournamentInit
};


/*import { getToken } from "../../utils/get-token.js";
import { showNotification } from '../../components/showNotification.js';

const BACKEND_URL = "http://localhost:8000";
const userId = localStorage.getItem('userId'); // Ensure user ID is stored in localStorage after login
const socket = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}/`);

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);

    switch (data.event) {
        case 'game_invite':
            if (data.type === 'tournament') {
                handleTournamentInvite(data);
            } else {
                handleGameInvite(data);
            }
            break;
        case 'accepted_game':
            handleAcceptedGame(data);
            break;
        case 'user_connected':
            updateParticipantsList(data.user_id, 'connected');
            break;
        case 'user_disconnected':
            updateParticipantsList(data.user_id, 'disconnected');
            break;
        case 'update_user_list':
            updateParticipantsList(data.user_ids, 'updated');
            break;
        default:
            console.log('Unknown event type:', data.event);
    }
};

function handleGameInvite(data) {
    console.log('Game Invite:', data);
    showNotification(`You have been invited to a game by ${data.user_name}.`);
    updateParticipantsList(data.user_name, 'invited');
}

async function checkAllParticipantsAccepted(tournamentId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/participants/status/?tournament_id=${tournamentId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const participants = await response.json();
            const allAccepted = participants.every(participant => participant.accepted_invite);
            if (allAccepted) {
                startTournament(tournamentId);
            }
        } else {
            console.error('Failed to fetch participants status');
        }
    } catch (error) {
        console.error('Error checking participants acceptance:', error);
    }
}

function startTournament(tournamentId) {
    console.log(`Starting tournament ${tournamentId}`);
    // Call Jonathan's remote players mode or any other logic for starting the tournament
}

/*function sendInvitation(type, username, tournamentId = null) {
    if (type === 'simple') {
        sendSimpleGameInvitation(username);
    } else if (type === 'tournament') {
        sendTournamentInvitation(tournamentId, username);
    }
}

function sendSimpleGameInvitation(username) {
    const message = {
        type: 'simple',
        event: 'game_invite',
        message: `You are invited to join a game.`,
        user_id: userId,
        user_name: localStorage.getItem('username'),
        dest_user_id: username
    };

    socket.send(JSON.stringify(message));
}

function sendTournamentInvitation(tournamentId, username) {
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
        const message = {
            type: 'tournament',
            event: 'game_invite',
            message: `You are invited to join the tournament ${tournamentId}. Do you think you have what it takes to win the prestigious Chèvre Verte Award?`,
            user_id: userId,
            user_name: localStorage.getItem('username'),
            dest_user_id: username,
            tournament_id: tournamentId
        };
        activeWebSockets[tournamentId].send(JSON.stringify(message));
    }
}

function handleTournamentWebSocketMessage(data, tournamentId) {
    switch (data.event) {
        case 'game_invite':
            if (data.type === 'tournament') {
                handleTournamentInvite(data);
            } else {
                handleGameInvite(data);
            }
            break;
        case 'accepted_game':
            handleAcceptedGame(data);
            break;
        case 'user_connected':
            updateParticipantsList(data.user_id, 'connected');
            break;
        case 'user_disconnected':
            updateParticipantsList(data.user_id, 'disconnected');
            break;
        case 'update_user_list':
            updateParticipantsList(data.user_ids, 'updated');
            break;
        default:
            console.log('Unknown event type:', data.event);
    }
}

function handleTournamentInvite(data) {
    console.log('Tournament Invite:', data);
    showNotification(`You have been invited to a tournament by ${data.user_name}. Tournament: ${data.tournament_name}`);
    const tournamentId = data.tournament_id;
    checkAllParticipantsAccepted(tournamentId);
}

function handleAcceptedGame(data) {
    console.log('Accepted Game:', data);
    showNotification(`${data.user_name} has accepted your game invitation.`);
    updateParticipantsList(data.user_name, 'accepted');
}

function updateParticipantsList(participantName, status, isCreator = false) {
    const participantsList = document.getElementById('participantsList');
    if (participantsList) {
        const existingParticipant = Array.from(participantsList.children).find(item => item.textContent.includes(participantName));
        if (existingParticipant) {
            existingParticipant.textContent = participantName + ' - ' + status;
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = isCreator ? participantName : participantName + ' - ' + "invited";
            participantsList.appendChild(listItem);
        }
        checkAllParticipantsAccepted(sessionStorage.getItem('currentTournamentId'));
    } else {
        displayErrorMessage("Participant list unavailable.");
    }
}

async function getParticipantId(username, tournamentId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/participants/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, tournament: tournamentId })
        });

        if (response.ok) {
            const data = await response.json();
            return data.id;
        } else {
            console.error('Failed to get participant ID');
            return null;
        }
    } catch (error) {
        console.error('Error getting participant ID:', error);
        return null;
    }
}

async function handleAddParticipant(e) {
    e.preventDefault();

    const participantName = document.getElementById('participantNameInput').value.trim();
    if (!participantName) {
        displayErrorMessage('Participant name cannot be empty.');
        return;
    }

    const tournamentId = sessionStorage.getItem('currentTournamentId');
    if (!tournamentId) {
        displayErrorMessage('No tournament ID found. Please create a tournament first.');
        return;
    }

    const isOnline = await checkUserOnlineStatus(participantName);
    if (isOnline === null) {
        displayErrorMessage("User not found. Please double-check their username.");
    } else if (isOnline) {
        const participantId = await getParticipantId(participantName, tournamentId);
        if (participantId) {
            sendTournamentInvitation(tournamentId, participantName);
            updateParticipantsList(participantName, 'invited');
        } else {
            displayErrorMessage("Failed to get participant ID.");
        }
    } else {
        displayErrorMessage("Participant is not online.");
        console.log("Participant is not online.");
    }
    document.getElementById('participantNameInput').value = ''; // Clear input after adding
}

function checkAddParticipantButton(e) {
    if (e.type === 'keydown' && e.key !== 'Enter') {
        return; // handles only enter key for keydown events
    }

    const addParticipantButton = document.getElementById('addParticipantButton');
    if (addParticipantButton.disabled) {
        e.preventDefault();
        displayErrorMessage('Please create the tournament first before adding participants.');
        return;
    }
    handleAddParticipant(e);
}

async function checkUserOnlineStatus(username) {
    console.log(`Checking online status for user: ${username}`);
    try {
        const exists = await userExists(username); // checks if the user exists first
        if (!exists) {
            displayErrorMessage("User not found. Please double-check their nickname.");
            return null; // User does not exist
        }

        const response = await fetch(`${BACKEND_URL}/api/users/${username}/status/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
            console.error(`Error checking user online status: ${response.status} ${response.statusText}`);
            displayErrorMessage("An error occurred while checking the user's online status.");
            return null;
        }

        const data = await response.json();
        console.log(`User online status: ${data.isOnline}`);
        return data.isOnline;

    } catch (error) {
        console.error('Error checking user online status:', error);
        displayErrorMessage("An error occurred while checking the user's online status.");
        return null;
    }
}

async function userExists(username) {
    console.log(`Checking if user exists: ${username}`);
    try {
        const response = await fetch(`${BACKEND_URL}/api/users/${username}/exists/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response status: ${response.status}`);

        if (response.status === 404) {
            console.log(`User ${username} not found.`);
            return false;
        }

        if (!response.ok) {
            console.error(`Error checking user existence: ${response.status} ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        return data.exists;

    } catch (error) {
        console.error('Error checking if user exists:', error);
        return false;
    }
}

function displayNotification(message) {
    const modal = document.getElementById('notificationModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeButton = document.getElementById('closeModalButton');

    modalMessage.textContent = message;
    modal.style.display = 'block';

    closeButton.onclick = function() {
        modal.style.display = 'none';
    };
}

function displayErrorMessage(message) {
    displayNotification(message);
}

function TournamentInit() {
    console.log("Initializing Tournament Page");

    const tournamentForm = document.getElementById('tournamentForm');
    if (tournamentForm) {
        tournamentForm.addEventListener('submit', handleCreateTournament);
        console.log("Event listener added to tournament form");
    }

    const addParticipantButton = document.getElementById('addParticipantButton');
    if (addParticipantButton) {
        addParticipantButton.addEventListener('click', checkAddParticipantButton);
        console.log("Event listener added to add participant button");
    }

    const participantNameInput = document.getElementById('participantNameInput');
    if (participantNameInput) {
        participantNameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                checkAddParticipantButton(event);
            }
        });
        console.log("Event listener added for Enter key on participant name input");
    }

    const startTournamentButton = document.getElementById('startTournamentButton');
    if (startTournamentButton) {
        startTournamentButton.addEventListener('click', startTournament);
        console.log("Event listener added to start tournament button");
    }
}

async function handleCreateTournament(e) {
    e.preventDefault();
    console.log("Create Tournament form submitted");
    const tournamentName = document.getElementById('tournamentNameInput').value.trim();
    if (!tournamentName) {
        displayErrorMessage('Tournament name cannot be empty.');
        return;
    }
    try {
        const response = await createTournament(tournamentName);
        console.log('Response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            showNotification("Tournament created successfully", "success");
            document.getElementById('tournamentNameInput').value = '';
            sessionStorage.setItem('currentTournamentId', data.id);
            updateParticipantsList('You (Creator)', 'invited', true); // Automatically adds the creator as a participant
            const addParticipantButton = document.getElementById('addParticipantButton');
            addParticipantButton.disabled = false;
        } else {
            const errorMessage = await response.text(); // Log the error message from the response
            console.error('Error from server:', errorMessage);
            throw new Error('Failed to create tournament. Server responded with an error.');
        }
    } catch (error) {
        console.error('Caught error:', error);
        displayErrorMessage(error.message);
    }
}

async function createTournament(tournamentName) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/tournaments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name: tournamentName })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response text:', errorText);
            throw new Error('Network response was not ok');
        }
        return response;

    } catch (error) {
        console.error('Network error:', error);
        throw error;
    }
}

export {
    createTournament,
    handleCreateTournament,
    handleAddParticipant,
    displayNotification,
    displayErrorMessage,
    checkUserOnlineStatus,
    sendTournamentInvitation,
    startTournament,
    TournamentInit
}
*/
