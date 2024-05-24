import { getToken } from "../../utils/get-token.js";
import { showNotification } from "../../components/showNotification.js"

const BACKEND_URL = "http://localhost:8000";

//Function to display notifications using a modal
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

/*document.addEventListener('DOMContentLoaded', function() {
    const tournamentId = sessionStorage.getItem('currentTournamentId');
    if (tournamentId) {
        fetchTournamentDetails(tournamentId);
        monitorInvitationStatus(tournamentId);
    } else {
        window.location.href = '/'; // Redirect to home if no ID is found
    }
});

async function fetchTournamentDetails(tournamentId) {
    const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const data = await response.json();
        document.getElementById('tournamentDetails').textContent = `Tournament Name: ${data.name}`;
        data.participants.forEach(participant => {
            updateParticipantsList(participant.username, participant.status);
        });
    }
}

// Using websocket for real time updates
function monitorInvitationStatus(tournamentId) {
    const socket = new WebSocket(`ws://localhost:8000/ws/tournament/${tournamentId}/`);

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const participants = data.participants;
        participants.forEach(participant => {
            updateParticipantsList(participant.username, participant.status);
        });
    };

    socket.onclose = function(event) {
        console.error('WebSocket closed unexpectedly');
    };
}*/  

/*async function userExists(username) {
    console.log(`Checking if user exists: ${username}`);
    try {
        const response = await fetch(`${BACKEND_URL}/api/users/${username}/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response status: ${response.status}`);

        if (response.status === 404) {
            console.log(`User ${username} not found.`);
            return { exists: false, message: "User not found. Please double-check their nickname." };
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        return { exists: true };
    } catch (error) {
        console.error('Error checking if user exists:', error);
        return { exists: false, message: "An error occurred while checking if the user exists." };
    }
}

async function checkUserOnlineStatus(username) {
    console.log(`Checking online status for user: ${username}`);
    try {
        // Check if the user exists first
        const userCheck = await userExists(username);
        if (!userCheck.exists) {
            displayErrorMessage(userCheck.message);
            return { isOnline: false, message: userCheck.message };
        }

        const response = await fetch(`${BACKEND_URL}/api/users/${username}/status/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`User online status: ${data.isOnline}`);
        return data.isOnline;
    } catch (error) {
        console.error('Error checking user online status:', error);
        displayErrorMessage("An error occurred while checking the user's online status.");
        return { isOnline: false, message: "An error occurred while checking the user's online status." };
    }
}

// Function to handle adding a participant
async function handleAddParticipant(e) {
    e.preventDefault();
    const participantName = document.getElementById('participantNameInput').value.trim();
    if (!participantName) {
        displayErrorMessage('Participant name cannot be empty.');
        return;
    }
    const userStatus = await checkUserOnlineStatus(participantName);
    if (userStatus.isOnline) {
        sendInvitation(participantName);
        updateParticipantsList(participantName, true);
    } else {
        displayErrorMessage(userStatus.message || "Participant is not online or does not exist.");
        console.log(userStatus.message || "Participant is not online or does not exist.");
    }
    document.getElementById('participantNameInput').value = ''; // Clear input after adding
}*/

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
           // throw new Error(`Error: ${response.status} ${response.statusText}`);
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
        // Check if the user exists first
        const exists = await userExists(username);
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
           // throw new Error(`Error: ${response.status} ${response.statusText}`);
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
    if (e.type === 'keydown' && e.key !== 'Enter') {
        return; // Only handle Enter key for keydown events
    }
    e.preventDefault();
    const participantName = document.getElementById('participantNameInput').value.trim();
    if (!participantName) {
        displayErrorMessage('Participant name cannot be empty.');
        return;
    }
    const isOnline = await checkUserOnlineStatus(participantName);
    if (isOnline === null) {
        // User does not exist
        displayErrorMessage("User not found. Please double-check their username.");
    } else if (isOnline) {
        sendInvitation(participantName);
        updateParticipantsList(participantName, true);
    } else {
        displayErrorMessage("Participant is not online.");
        console.log("Participant is not online.");
    }
    document.getElementById('participantNameInput').value = ''; // Clear input after adding
}

// Function to send an invitation to a user
async function sendInvitation(username) {
    console.log("Sending invitation to", username);
    //change the api below to Jonathan's friend invitation? create my own with tournament name and trash talk
    const response = await fetch(`${BACKEND_URL}/api/participants/${username}/invite-participant`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log('Invitation sent successfully');
        displayNotification('Invitation sent successfully to ' + username);
    } else {
        throw new Error('Failed to send invitation'); // rachel
    }
}

/*document.addEventListener('DOMContentLoaded', function() {
    TournamentInit();
});*/

// Initialization function to setup event listeners when the page is ready
/*export function TournamentInit() {
    console.log("Initializing Tournament Page");
    const tournamentForm = document.getElementById('tournamentForm');
    if (tournamentForm) {
        tournamentForm.addEventListener('submit', handleCreateTournament);
        console.log("Event listener added to tournament form");
    }

    const addParticipantButton = document.getElementById('addParticipantButton');
    if (addParticipantButton) {
        addParticipantButton.addEventListener('click', handleAddParticipant);
        console.log("Event listener added to add participant button");
    }

    const startTournamentButton = document.getElementById('startTournamentButton');
    if (startTournamentButton) {
        startTournamentButton.addEventListener('click', startTournament);
        console.log("Event listener added to start tournament button");
    }
}

// Function to start the tournament
async function startTournament() {
    const tournamentId = sessionStorage.getItem('currentTournamentId');
    if (!tournamentId) {
        displayErrorMessage("No tournament ID found. Please create a tournament first.");
        return;
    }
    try {
        const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (response.ok) {
            console.log('Tournament started:', response);
            displayNotification("Tournament is starting!");
            window.location.href = `/tournament/waiting?tournamentId=${tournamentId}`; // Redirect to the waiting area
        } else {
            throw new Error('Failed to start the tournament');
        }
    } catch (error) {
        console.error('Error starting the tournament:', error);
        displayErrorMessage('Failed to start the tournament. Please try again.');
    }
}*/

export function TournamentInit() {
    console.log("Initializing Tournament Page");
  
    const tournamentForm = document.getElementById('tournamentForm');
    if (tournamentForm) {
      tournamentForm.addEventListener('submit', handleCreateTournament);
      console.log("Event listener added to tournament form");
    }
  
    const addParticipantButton = document.getElementById('addParticipantButton');
    if (addParticipantButton) {
      addParticipantButton.addEventListener('click', handleAddParticipant);
      console.log("Event listener added to add participant button");
    }
  
    const participantNameInput = document.getElementById('participantNameInput');
    if (participantNameInput) {
        participantNameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handleAddParticipant(event);
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
            showNotification("Tournament created successfuly", "success");
            document.getElementById('tournamentNameInput').value = '';
            sessionStorage.setItem('currentTournamentId', data.id);
            updateParticipantsList('You (Creator)', 'invited', true); // Automatically adds the creator as a participant
            const addParticipantButton = document.getElementById('addParticipantButton');
            addParticipantButton.disabled = false;
        
        } else {
            const errorMessage = await response.text(); // Log the error message from the response
            console.error('Error from server:', errorMessage); 
            throw new Error('Failed to create tournament. Server responded with an error.'); // rachel - rework this so no errors on console?
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
            throw new Error('Network response was not ok'); // rachel
        }
        
        return response;
    } catch (error) {
        console.error('Network error:', error); // Log network errors
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
  
  //export { TournamentInit };
  

/*export {
    createTournament,
    handleCreateTournament,
    handleAddParticipant,
    displayNotification,
    displayErrorMessage,
    checkUserOnlineStatus,
    sendInvitation,
    startTournament
};*/


