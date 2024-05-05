document.addEventListener("DOMContentLoaded", function() {
    const tournamentForm = document.getElementById('tournamentForm');
    tournamentForm.addEventListener('submit', handleCreateTournament);

    const participantForm = document.getElementById('registerParticipantForm');
    participantForm.addEventListener('submit', handleRegisterParticipant);

    const startTournamentButton = document.getElementById('startTournamentButton');
    if (startTournamentButton) {
        startTournamentButton.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const tournamentId = urlParams.get('tournamentId'); // Get tournament ID from URL query parameter

            if (tournamentId) {
                console.log("Tournament ID: ", tournamentId);
                fetchTournamentData(tournamentId);  // Call to start the tournament
            } else {
                console.error("No tournament ID provided in the URL.");
            }
        });
    }
});


function handleCreateTournament(e) {
    e.preventDefault();
    const tournamentName = document.getElementById('tournamentNameInput').value;
    createTournament(tournamentName);
}

function handleRegisterParticipant(e) {
    e.preventDefault();
    const participantName = document.getElementById('participantNameInput').value;
    //need to check if backend endpoint to register participants and a way to associate them with a tournament
    const tournamentId = sessionStorage.getItem('currentTournamentId'); // Store and retrieve the current tournament ID in/from sessionStorage
    fetch(`/api/tournaments/${tournamentId}/participants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            //assuming authentication is required:
            'Authorization': `Bearer ${getToken()}`, 
        },
        body: JSON.stringify({ name: participantName }),
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        // Handle success
        console.log('Participant registered:', data);
        // Optionally, update UI to show the new participant
    })
    .catch(error => {
        console.error('Error registering participant:', error);
        // Optionally, update UI to show error message
    });
}

function createTournament(tournamentName) {
    fetch(`/api/tournaments/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}` //check if this is the right function
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
}

function setupMatchButtons() {
    const matchesContainer = document.getElementById('matches');
    const beginMatchButton = document.createElement('button');
    beginMatchButton.innerText = 'Begin Match';
    beginMatchButton.className = 'btn btn-success'; // Bootstrap button class
    beginMatchButton.onclick = function() {
        // Logic to start the match
        playGoatSoundAndDisplayImage(); // Assuming this function plays the goat sound and displays the image
        // Additional logic to start the match could go here
    };
    matchesContainer.appendChild(beginMatchButton); // This appends the button to your matches container. Adjust as needed based on your UI structure.
}

// Make sure to call this function at the appropriate time in your tournament setup process


// Function to play goat sound and display goat image
function playGoatSoundAndDisplayImage() {
    // Assuming the URLs are correct relative to your public directory
    const goatSoundUrl = './assets/goat_noise.mp3';
    const goatImageUrl = './assets/bleating_goat.png';

    // Create and play the audio
    const audio = new Audio(goatSoundUrl);
    audio.play();

    // Create and display the goat image
    const goatImage = document.createElement('img');
    goatImage.src = goatImageUrl;
    goatImage.alt = 'Goat Bleating';
    goatImage.style.maxWidth = '100px'; // Adjust as needed
    goatImage.style.position = 'fixed';
    goatImage.style.bottom = '20px';
    goatImage.style.right = '20px';
    document.body.appendChild(goatImage);

    // Remove the image after the sound finishes or after a set timeout
    // audio.onended = () => {
    //     document.body.removeChild(goatImage);
    // };

    // Alternatively, remove the image after a delay if you want to ensure it's shown for a certain period
    setTimeout(() => {
        if (document.body.contains(goatImage)) {
            document.body.removeChild(goatImage);
        }
    }, 5000); // Adjust time as needed
}

function displayErrorMessage(message) {
    // Example of displaying an error message to the user
    const errorMessageContainer = document.getElementById('errorMessage');
    if (!errorMessageContainer) {
        console.error('Error message container not found');
        return;
    }
    errorMessageContainer.textContent = message;
    errorMessageContainer.style.display = 'block';
}


// Example usage
// Bind this function to your "Begin Match" button's click event
document.getElementById('beginMatchButton').addEventListener('click', playGoatSoundAndDisplayImage);

function getToken() {
    const token = localStorage.getItem('jwt');
    if (!token) {
        console.error('No token found, user might not be logged in');
        // Redirect to login page or show a login prompt
        window.location.href = '/login';
        return null;
    }
    return token;
}

