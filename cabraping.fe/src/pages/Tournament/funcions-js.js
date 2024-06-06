import { getToken } from "../../utils/get-token.js";
import { showNotification, showNotificationPopup } from '../../components/showNotification.js';
import { sendTournamentInvitation, activeWebSockets, handleTournamentWebSocketMessage, getUserIdByUsername } from '../../components/wcGlobal.js';

// Extract the IP address from the URL used to access the frontend
const frontendURL = new URL(window.location.href);
const serverIPAddress = frontendURL.hostname;
const serverPort = 8000; // Specify the port your backend server is running on
const BACKEND_URL = `http://${serverIPAddress}:${serverPort}`;
//const BACKEND_URL = "http://localhost:8000";
//let invitedParticipants = [];  // List to keep track of invited participants
//let acceptedParticipants = []; // List to keep track of accepted participants

function TournamentInit() {
    console.log("Initializing Tournament Page");

    loadTournamentData();

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
            saveTournamentData();
        });
        console.log("Event listener added for enter key on participant name input");
    } else {
        console.error("Participant name input not found");
    }
}

// Save tournament data to localStorage
function saveTournamentData() {
    const tournamentName = document.getElementById('tournamentNameInput').value;
    if (tournamentName)
    {
        const participants = Array.from(document.getElementById('participantsList').children).map(item => ({
            name: item.textContent.split(' - ')[0],
            status: item.textContent.split(' - ')[1]
        }));
        const data = {
            tournamentName,
            participants
        };
        localStorage.setItem('pageTournament', JSON.stringify(data));
        console.log("🥶 -> saveTournamentData:", data);
    } else {
        console.error('Necessary elements for saving tournament data are not available.');
    }
}

// Load tournament data from localStorage
/*function loadTournamentData() {
    const data = JSON.parse(localStorage.getItem('pageTournament'));
    console.log("🥶 loadTournamentData:", data);
    console.log("🥶 loadTournamentData:", (document.getElementById('tournamentNameInput').value !== ""));
    if (data && data.tournamentName !== "") {
        document.getElementById('tournamentNameInput').value = data.tournamentName || '';
        document.getElementById('tournamentNameInput').disabled = true;
        document.getElementById('tournamentForm').querySelector('button').disabled = true;
        const participantsList = document.getElementById('participantsList');
        participantsList.innerHTML = '';
        data.participants.forEach(participant => {
            const listItem = document.createElement('li');
            listItem.textContent = `${participant.name} - ${participant.status}`;
            participantsList.appendChild(listItem);
        });
        document.getElementById('addParticipantButton').disabled = false;
    }
}*/

// Load tournament data from localStorage
function loadTournamentData() {
    const data = JSON.parse(localStorage.getItem('pageTournament'));
    console.log("🥶 loadTournamentData:", data);

    if (data && data.tournamentName) {
        const tournamentNameInput = document.getElementById('tournamentNameInput');
        const tournamentFormButton = document.getElementById('tournamentForm').querySelector('button');
        const participantsList = document.getElementById('participantsList');
        const addParticipantButton = document.getElementById('addParticipantButton');

        // Set and disable the tournament name input
        tournamentNameInput.value = data.tournamentName;
        tournamentNameInput.disabled = true;
        
        // Disable the tournament form button
        tournamentFormButton.disabled = true;
        
        // Clear the current participants list and update with stored participants
        participantsList.innerHTML = '';
        data.participants.forEach(participant => {
            const listItem = document.createElement('li');
            listItem.textContent = `${participant.name} - ${participant.status}`;
            participantsList.appendChild(listItem);
        });

        // Enable the add participant button
        addParticipantButton.disabled = false;

        console.log("🥶 loadTournamentData: Tournament data loaded successfully");
    } else {
        console.log("🥶 loadTournamentData: No tournament data found in localStorage or tournamentName is empty");
    }
}


// Establecer conexión WebSocket
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
        activeWebSockets[tournamentId] = tournamentSocket;
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
        const participantId = await getUserIdByUsername(participantName, tournamentId);
        if (participantId) {
            console.log(`Sending tournament invitation to [${participantName}], participantId:[${participantId}]`);
            sendTournamentInvitation(tournamentId, participantName, participantId);
            updateParticipantsList({ username: participantName }, 'invited');
        } else {
            displayErrorMessage("Failed to get participant ID.");
        }
    } else {
        displayErrorMessage("Participant is not online.");
        console.log("Participant is not online.");
    }
    document.getElementById('participantNameInput').value = ''; // Clear input after adding
    saveTournamentData();
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
    saveTournamentData();
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
            //updategoToWaitingAreaButtonState(participants);
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

/*function updategoToWaitingAreaButtonState(participants) {
    const goToWaitingAreaButton = document.getElementById('goToWaitingAreaButton');
    const acceptedCount = participants.filter(participant => participant.accepted_invite).length;
    if (acceptedCount === 4) { // Including the creator
        goToWaitingAreaButton.disabled = false;
    } else {
        goToWaitingAreaButton.disabled = true;
    }
}
*/
// Function to update the list of participants in the UI
/*export function updateParticipantsList(participantName, status, isCreator = false) {
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
    } 
}
*/

// Function to update the list of participants in the UI
/*export function updateParticipantsList(participantName, status, isCreator = false) {
    const currentUser = localStorage.getItem('username');
    if (participantName === currentUser && !isCreator) {
        displayErrorMessage('You cannot invite yourself to the party. Have some manners!');
        return;
    }
    const participantsList = document.getElementById('participantsList');
    if (participantsList) {
        // Check if the participant is already in the list to avoid duplication
        const existingParticipant = Array.from(participantsList.children).find(item => item.textContent.includes(participantName));
        if (existingParticipant) {
            existingParticipant.textContent = participantName + ' - ' + status;
            if (!isCreator) displayErrorMessage('This user has been invited already. Don\'t be pushy.');
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = isCreator ? participantName : participantName + ' - ' + "invited";
            participantsList.appendChild(listItem);
            if (!isCreator) showNotification('Invitation successfully sent to ' + participantName + '.', 'success');
        }

        // Check the number of invited participants and enable the button if there are at least three (excluding the creator)
        const invitedParticipants = participantsList.children.length - 1; // Exclude the creator
        const goToWaitingAreaButton = document.getElementById('goToWaitingAreaButton');
        if (goToWaitingAreaButton) {
            console.log("Navigating to tournament waiting area.");
            const isEnabled = invitedParticipants >= 3;
            goToWaitingAreaButton.disabled = !isEnabled;

            // Save the button state to local storage
            localStorage.setItem('goToWaitingAreaButtonEnabled', isEnabled);

            // Remove any existing event listeners to avoid duplicates
            const newButton = goToWaitingAreaButton.cloneNode(true);
            goToWaitingAreaButton.parentNode.replaceChild(newButton, goToWaitingAreaButton);

            if (isEnabled && newButton) {
                newButton.addEventListener('click', () => {
                    const tournamentId = localStorage.getItem('currentTournamentId');
                    console.log("Navigating to tournament waiting area with ID:", tournamentId);
                    saveTournamentData();
                    window.location.href = `/#waitroom/${tournamentId}`;
                });
                console.log("Event listener added to go to waiting area button");
            }
        } else {
            console.error("Go to waiting area button not found");
        }
    }
}

*/

export function updateParticipantsList(participantNameOrObject, status, isCreator = false) {
    const participantName = typeof participantNameOrObject === 'object' ? participantNameOrObject.username || participantNameOrObject.name : participantNameOrObject;
    const currentUser = localStorage.getItem('username');

    if (participantName === currentUser && !isCreator) {
        displayErrorMessage('You cannot invite yourself to the party. Have some manners!');
        return;
    }

    const participantsList = document.getElementById('participantsList');
    if (participantsList) {
        // Check if the participant is already in the list to avoid duplication
        const existingParticipant = Array.from(participantsList.children).find(item => item.textContent.includes(participantName));
        if (existingParticipant) {
            existingParticipant.textContent = participantName + ' - ' + status;
            if (!isCreator) displayErrorMessage('This user has been invited already. Don\'t be pushy.');
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = isCreator ? participantName : participantName + ' - ' + "invited";
            participantsList.appendChild(listItem);
            if (!isCreator) showNotification('Invitation successfully sent to ' + participantName + '.', 'success');
        }

        // Check the number of invited participants and enable the button if there are at least three (excluding the creator)
        const invitedParticipants = participantsList.children.length - 1; // Exclude the creator
        const goToWaitingAreaButton = document.getElementById('goToWaitingAreaButton');
        if (goToWaitingAreaButton) {
            console.log("Navigating to tournament waiting area.");
            const isEnabled = invitedParticipants >= 3;
            goToWaitingAreaButton.disabled = !isEnabled;

            // Save the button state to local storage
            localStorage.setItem('goToWaitingAreaButtonEnabled', isEnabled);

            // Remove any existing event listeners to avoid duplicates
            const newButton = goToWaitingAreaButton.cloneNode(true);
            goToWaitingAreaButton.parentNode.replaceChild(newButton, goToWaitingAreaButton);

            if (isEnabled && newButton) {
                newButton.addEventListener('click', () => {
                    const tournamentId = localStorage.getItem('currentTournamentId');
                    console.log("Navigating to tournament waiting area with ID:", tournamentId);
                    saveTournamentData();
                    window.location.href = `/#waitroom/${tournamentId}`;
                });
                console.log("Event listener added to go to waiting area button");
            }
        } else {
            console.error("Go to waiting area button not found");
        }
    }
}


async function checkUserOnlineStatus(username) {
    console.log(`Checking online status for user: ${username}`);
    try {
        const response = await fetch(`${BACKEND_URL}/api/users/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Error fetching users: ${response.status} ${response.statusText}`);
            displayErrorMessage("An error occurred while fetching users.");
            return null;
        }

        const users = await response.json();
        // Check if the username exists in the users list
        const user = users.find(user => user.username === username);

        if (!user) {
            displayErrorMessage("User not found. Please double-check their username.");
            return null; // User does not exist
        }

        // Check if the user ID is in the list of active users from localStorage
        const activeUsers = JSON.parse(localStorage.getItem('id_active_users')) || [];
        const isActive = activeUsers.includes(String(user.id));

        console.log(`User ${username} is ${isActive ? 'online' : 'offline'}`);
        return isActive;

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
    try {
        const response = await createTournament(tournamentName);
        console.log('Response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            showNotification("Tournament created successfully", "success");
            document.getElementById('tournamentNameInput').value = tournamentName;
            document.getElementById('tournamentNameInput').disabled = true;
            document.getElementById('tournamentForm').querySelector('button').disabled = true;
            localStorage.setItem('currentTournamentId', data.id);
            localStorage.setItem(`tournamentName_${data.id}`, tournamentName); 
            localStorage.setItem('creatorUsername_' + data.id, localStorage.getItem('username')); // Store creator's username
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
    saveTournamentData();
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

// async function startTournament(tournamentId) {
//     try {
//         const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/start_tournament/`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${getToken()}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (response.ok) {
//             const data = await response.json();
//             console.log(`Tournament ${tournamentId} started successfully`, data);
//         } else {
//             const errorData = await response.json();
//             console.error('Failed to start tournament:', errorData);
//             displayErrorMessage('Failed to start tournament: ' + errorData.message);
//         }
//     } catch (error) {
//         console.error('Error starting tournament:', error);
//         displayErrorMessage('Error starting tournament.');
//     }

//     window.addEventListener('beforeunload', saveTournamentData);
// }


/*export function acceptTournamentInvitation(tournamentId, username) {
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected or already closed for tournament:', tournamentId);
        connectTournamentWebSocket(tournamentId);
    }

    const message = {
        type: 'tournament',
        event: 'accepted_tournament',
        message: `User ${username} accepted the tournament invitation for tournament ${tournamentId}`,
        user_id: localStorage.getItem('userId'),
        user_name: localStorage.getItem('username'),
        dest_user_id: username,
        tournament_id: tournamentId
    };

    activeWebSockets[tournamentId].send(JSON.stringify(message));
    window.location.hash = '#/tournamentWaitingArea';
}

export function rejectTournamentInvitation(tournamentId, username) {
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected or already closed for tournament:', tournamentId);
        connectTournamentWebSocket(tournamentId);
    }

    const message = {
        type: 'tournament',
        event: 'rejected_tournament',
        message: `User ${username} rejected the tournament invitation for tournament ${tournamentId}`,
        user_id: localStorage.getItem('userId'),
        user_name: localStorage.getItem('username'),
        dest_user_id: username,
        tournament_id: tournamentId
    };

    console.log("Tournament invitation rejected.");

    activeWebSockets[tournamentId].send(JSON.stringify(message));
    
    // Hide the modal
    const modalElement = document.getElementById('tournamentInviteModal');
    modalElement.style.display = 'none';
}
*/

export function acceptTournamentInvitation(tournamentId, username) {
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected or already closed for tournament:', tournamentId);
      connectTournamentWebSocket(tournamentId);
      activeWebSockets[tournamentId].onopen = () => {
        sendAcceptMessage(tournamentId, username);
      };
    } else {
      sendAcceptMessage(tournamentId, username);
    }
  }
  
  function sendAcceptMessage(tournamentId, username) {
    const message = {
      type: 'tournament',
      event: 'accepted_tournament',
      message: `User ${username} accepted the tournament invitation for tournament ${tournamentId}`,
      user_id: localStorage.getItem('userId'),
      user_name: localStorage.getItem('username'),
      dest_user_id: username,
      tournament_id: tournamentId
    };
  
    activeWebSockets[tournamentId].send(JSON.stringify(message));
    
    // Save data only if elements are available
    const tournamentNameInput = document.getElementById('tournamentNameInput');
    const participantsList = document.getElementById('participantsList');
    if (tournamentNameInput && participantsList) {
        saveTournamentData();
    } else {
        console.log("Skipping saveTournamentData as elements are not available.");
    }

    window.location.href = `/#waitroom/${tournamentId}`;
  }
  
  export function rejectTournamentInvitation(tournamentId, username) {
    if (!activeWebSockets[tournamentId] || activeWebSockets[tournamentId].readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected or already closed for tournament:', tournamentId);
      connectTournamentWebSocket(tournamentId);
      activeWebSockets[tournamentId].onopen = () => {
        sendRejectMessage(tournamentId, username);
      };
    } else {
      sendRejectMessage(tournamentId, username);
    }
  }
  
  function sendRejectMessage(tournamentId, username) {
    const message = {
      type: 'tournament',
      event: 'rejected_tournament',
      message: `User ${username} rejected the tournament invitation for tournament ${tournamentId}`,
      user_id: localStorage.getItem('userId'),
      user_name: localStorage.getItem('username'),
      dest_user_id: username,
      tournament_id: tournamentId
    };
  
    console.log("Tournament invitation rejected.");
  
    activeWebSockets[tournamentId].send(JSON.stringify(message));
  
    // Hide the modal
    const modalElement = document.getElementById('tournamentInviteModal');
    modalElement.style.display = 'none';
  }
  
  export {
    createTournament,
    handleCreateTournament,
    handleAddParticipant,
    displayNotification,
    displayErrorMessage,
    checkUserOnlineStatus,
    //startTournament,
    TournamentInit,
    saveTournamentData,
    loadTournamentData,
};
