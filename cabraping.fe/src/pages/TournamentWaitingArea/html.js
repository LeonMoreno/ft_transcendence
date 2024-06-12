export async function TournamentWaitingArea_html() {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        window.location.href = '/#';
        return;
    }

    return `
        <div id="waitingArea" class="container mt-4 mb-7">
            <h1>Tournament Waiting Area</h1>
            <!--- div id="tournamentDetails">Waiting for more participants to join...</div --->
            <ul id="waitingParticipantsList" class="list-unstyled"></ul>
            <p>Charging.....</p>
             <h5>Once all four participants have joined, click on 'Let's Play!' below.</h5>
            <button id="startTournamentButton" class="btn btn-success mt-3 mb-5" disabled>Let's Play!</button>
            <button id="cancelTournamentButton" class="btn btn-danger mt-3 mb-5">Cancel Tournament</button>
            <div style="height: 200px;"></div> <!-- Spacer element -->
        </div>
    `;
};


