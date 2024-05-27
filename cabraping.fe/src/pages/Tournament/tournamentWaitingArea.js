console.log('tournamentWaitingArea loaded');

const TournamentWaitingArea = async () => {
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

export { TournamentWaitingArea };
