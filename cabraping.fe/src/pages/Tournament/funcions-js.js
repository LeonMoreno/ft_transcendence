document.addEventListener("DOMContentLoaded", function() {
    const tournamentForm = document.getElementById('tournamentForm');
    tournamentForm.addEventListener('submit', handleCreateTournament);

    for (let i = 1; i <= 4; i++) {
        const participantForm = document.getElementById(`registerParticipantForm${i}`);
        participantForm.addEventListener('submit', handleRegisterParticipant);
    }

    const startTournamentButton = document.getElementById('startTournamentButton');
    if (startTournamentButton) {
        startTournamentButton.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const tournamentId = urlParams.get('tournamentId'); 
            if (tournamentId) {
                console.log("Tournament ID: ", tournamentId);
                fetchTournamentData(tournamentId);
                checkTournamentStatus(tournamentId);
            } else {
                console.error("No tournament ID provided in the URL.");
            }
        });
    }
});

function checkTournamentStatus(tournamentId) {
    fetch(`/api/tournaments/${tournamentId}/status`) // This endpoint needs to be implemented
    .then(response => response.json())
    .then(data => {
        if (data.status === 'completed') {
            displayViewResultsButton(tournamentId);
        }
    })
    .catch(error => console.error('Error checking tournament status:', error));
}

function displayViewResultsButton(tournamentId) {
    const viewResultsButton = document.createElement('button');
    viewResultsButton.id = 'viewResultsButton';
    viewResultsButton.textContent = 'View Results';
    viewResultsButton.onclick = () => fetchTournamentResults(tournamentId);
    document.body.appendChild(viewResultsButton);
}


function handleCreateTournament(e) {
    e.preventDefault();
    const tournamentName = document.getElementById('tournamentNameInput').value;
    createTournament(tournamentName);
}

function handleRegisterParticipant(e) {
    e.preventDefault();
    const participantName = document.getElementById('participantNameInput').value;
    //need to check if backend endpoint to register participants and a way to associate them with a tournament
    const tournamentId = sessionStorage.getItem('currentTournamentId');
    if (!tournamentId) {
        displayErrorMessage('No tournament selected. Please select a tournament first.');
        return;
    }
    checkUserOnlineStatus(participantName)
        .then(isOnline => {
            if (isOnline) {
                fetch(`/api/tournaments/${tournamentId}/invite-participant`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify({ name: participantName }),
                })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    sendInvitation(participantName);
                    console.log('Invitation sent to participant:', data);
                    updateParticipantListUI(data); // Update the UI with the new participant
                })
                .catch(error => {
                    console.error('Error inviting participant:', error);
                    displayErrorMessage('Failed to invite participant. Please try again.');
                });
            } else {
                displayErrorMessage('The participant is not online. Try inviting someone else.');
            }
        })
        .catch(error => {
            console.error('Error checking user status:', error);
            displayErrorMessage('Failed to check participant status.');
        });
}

function checkUserOnlineStatus(username) {
    return fetch(`/api/users/${username}/status`, {
        headers: {'Authorization': `Bearer ${getToken()}`}
    })
    .then(response => response.json())
    .then(data => {
        if (data.isOnline) {
            sendInvitation(username);
        } else {
            console.error('User is not online');
        }
    })
    .catch(error => {
        console.error('Error checking user online status:', error);
    });
}

function sendInvitation(participantId) {
    fetch(`/api/participants/${participantId}/invite-participant`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Invitation sent successfully');
        } else {
            console.error('Failed to send invitation');
        }
    })
    .catch(error => console.error('Error sending invitation:', error));
}


function createTournament(tournamentName) {
    fetch(`/api/tournaments/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name: tournamentName }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Tournament created:', data);
        sessionStorage.setItem('currentTournamentId', data.id);
        window.location.href = `/tournamentPage?tournamentId=${data.id}`;
    })
    .catch(error => {
        console.error('Error creating tournament:', error);
        displayErrorMessage('Failed to create tournament. Please try again.');
    });
}

function fetchTournamentData(tournamentId) {
    fetch(`/api/tournaments/${tournamentId}/`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('tournamentName').textContent = data.name;
            displayMatches(data.matches);
        })
        .catch(error => {
            console.error('Error fetching tournament data:', error);
            displayErrorMessage('Failed to load tournament data. Please try again.');
        });
}

function displayMatches(matches) {
    const matchesContainer = document.getElementById('matches');
    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.classList.add('col-md-4', 'mb-3');
        matchElement.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${match.participant1.user.username} vs ${match.participant2.user.username}</h5>
                    <p class="card-text">Winner: ${match.winner ? match.winner.user.username : 'TBD'}</p>
                </div>
            </div>
        `;
        matchesContainer.appendChild(matchElement);
    });
    setupMatchButtons();
}

function setupMatchButtons() {
    const matchesContainer = document.getElementById('matches');
    const beginMatchButton = document.createElement('button');
    beginMatchButton.innerText = 'Begin Match';
    beginMatchButton.className = 'btn btn-success'; // Bootstrap button class
    beginMatchButton.onclick = function() {
        playGoatSoundAndDisplayImage();
        startMatch(); //or whatever is the function that starts it
    };
    matchesContainer.appendChild(beginMatchButton); //double check
}

function playGoatSoundAndDisplayImage() {
    const goatSoundUrl = '../../assets/goat_noise.mp3';
    const goatImageUrl = '../../assets/bleating_goat.png';

    const audio = new Audio(goatSoundUrl);
    audio.play();

    const goatImage = document.createElement('img');
    goatImage.src = goatImageUrl;
    goatImage.alt = 'Goat Bleating';
    goatImage.style.maxWidth = '100px'; // Adjust as needed
    goatImage.style.position = 'fixed';
    goatImage.style.bottom = '20px';
    goatImage.style.right = '20px';
    document.body.appendChild(goatImage);

    //removes the image after the sound finishes or after a set timeout
    // audio.onended = () => {
    //     document.body.removeChild(goatImage);
    // };

    // ensuring it's shown for a certain period:
    setTimeout(() => {
        if (document.body.contains(goatImage)) {
            document.body.removeChild(goatImage);
        }
    }, 5000);
}

function displayErrorMessage(message) {
    const errorMessageContainer = document.getElementById('errorMessage');
    if (!errorMessageContainer) {
        console.error('Error message container not found');
        return;
    }
    errorMessageContainer.textContent = message;
    errorMessageContainer.style.display = 'block';
}

function fetchTournamentResults(tournamentId) {
    fetch(`/api/tournaments/${tournamentId}/results`)
      .then(response => response.json())
      .then(data => {
        if (data.winner) {
          awardWinner(`Congratulations ${data.winner.name}, you've won the ${data.tournamentName}, making you the illustrious recipient of the Chèvre Verte Award! In other words, you are the GOAT!`);
        }
      })
      .catch(error => {
        console.error('Error fetching tournament results:', error);
      });
  }
  
function awardWinner(message) {
    document.getElementById('winnerMessage').textContent = message;
    document.getElementById('winnerModal').style.display = "block";
  }
  
function closeModal() {
    document.getElementById('winnerModal').style.display = "none";
  }

function displayInvitationModal(message) {
    const modal = document.getElementById('invitationModal');
    const modalContent = document.getElementById('modal-content');
    modalContent.textContent = message;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('invitationModal').style.display = "none";
}


function getToken() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        console.error('No token found, user might not be logged in');
        window.location.href = '/login';
        return null;
    }
    return token;
}

// Assuming userID is available in your environment, perhaps passed from the server on page load
const userWebSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/user/' + userId + '/'
);

userWebSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.type === 'tournament_invitation') {
        displayInvitationModal(data.message);
    }
};

function displayInvitationModal(message) {
    const modalContent = document.getElementById('modal-content');
    modalContent.textContent = message;
   $('#invitationModal').modal('show');
}


export { handleCreateTournament, handleRegisterParticipant, fetchTournamentData };