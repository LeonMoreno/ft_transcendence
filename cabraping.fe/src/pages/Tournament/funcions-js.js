import { getToken } from "../../utils/get-token.js";
import { showNotification } from "../../components/showNotification.js";

const BACKEND_URL = "http://localhost:8000";

// Function to display notifications using a modal
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
            const invitationSent = await sendInvitation(participantId, participantName, tournamentId);
            if (invitationSent) {
                updateParticipantsList(participantName, 'invited');
            } else {
                displayErrorMessage("Failed to send invitation.");
            }
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

// Function to send an invitation to a user
async function sendInvitation(participantId, username, tournamentId) {
    console.log("Sending invitation to", username);
    try {
        const response = await fetch(`${BACKEND_URL}/api/participants/${participantId}/invite/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, tournament: tournamentId })
        });

        if (response.ok) {
            console.log('Invitation sent successfully');
            displayNotification('Invitation sent successfully to ' + username);
            return true;
        } else {
            const errorData = await response.json();
            console.error('Failed to send invitation:', errorData);
            displayErrorMessage('Failed to send invitation: ' + errorData.message);
            return false;
        }
    } catch (error) {
        console.error('Error sending invitation:', error);
        displayErrorMessage('Error sending invitation.');
        return false;
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
            return data.id; // Assuming the API returns the participant's ID
        } else {
            console.error('Failed to get participant ID');
            return null;
        }
    } catch (error) {
        console.error('Error getting participant ID:', error);
        return null;
    }
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

// Function to update the list of participants in the UI
function updateParticipantsList(participantName, status, isCreator = false) {
    const participantsList = document.getElementById('participantsList');
    if (participantsList) {
        // Check if the participant is already in the list to avoid duplication
        const existingParticipant = Array.from(participantsList.children).find(item => item.textContent.includes(participantName));
        if (existingParticipant) {
            existingParticipant.textContent = participantName + ' - ' + status;
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = isCreator ? participantName : participantName + ' - ' + "invited";
            participantsList.appendChild(listItem);
        }
        checkAllParticipantsAccepted();
    } else {
        displayErrorMessage("Participant list unavailable.");
    }
}

function checkAllParticipantsAccepted() {
    const participants = document.getElementById('participantsList').getElementsByTagName('li');
    let allAccepted = true;
    for (let participant of participants) {
        if (!participant.textContent.includes('accepted')) {
            allAccepted = false;
        }
    }
    document.getElementById('startTournamentButton').disabled = !allAccepted;
}

function startTournament(event) {
    event.preventDefault();
    console.log("Start Tournament button clicked");
}

export {
    createTournament,
    handleCreateTournament,
    handleAddParticipant,
    displayNotification,
    displayErrorMessage,
    checkUserOnlineStatus,
    sendInvitation,
    startTournament,
    TournamentInit
};
