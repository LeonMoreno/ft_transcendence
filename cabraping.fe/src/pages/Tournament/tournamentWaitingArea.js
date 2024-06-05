console.log('tournamentWaitingArea loaded');

const TournamentWaitingArea_html = async () => {
    return `
        <div id="waitingArea" class="container mt-4">
            <h1>Tournament Waiting Area</h1>
            <div id="tournamentDetails">Waiting for more participants to join...</div>
            <ul id="participantsList" class="list-unstyled"></ul>
            <button id="startTournamentButton" class="btn btn-success mt-3" disabled>Let's Play!</button>
            <button id="cancelTournamentButton" class="btn btn-danger mt-3">Cancel Tournament</button>
        </div>
    `;
};

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
async function initializeTournamentWaitingArea(tournamentId, isCreator) {
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
}

export { TournamentWaitingArea_html, initializeTournamentWaitingArea };
