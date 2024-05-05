const Tournament = async () => {
    return `
    <div id="tournament" class="container mt-4">
    <h1>Create Tournament</h1>
    <form id="tournamentForm" class="mb-3 d-flex">
        <input type="text" id="tournamentNameInput" class="form-control me-2" placeholder="Enter Tournament Name" required>
        <button type="submit" class="btn btn-primary">Create Tournament</button>
    </form>
    <h2>Register Participants</h2>
    <form id="registerParticipantForm1" class="mb-3 d-flex">
        <input type="text" id="participantNameInput1" class="form-control me-2" placeholder="Enter Participant Nickname" required>
        <button type="submit" class="btn btn-secondary">Send Invitation</button>
    </form>
    <form id="registerParticipantForm2" class="mb-3 d-flex">
        <input type="text" id="participantNameInput2" class="form-control me-2" placeholder="Enter Participant Nickname" required>
        <button type="submit" class="btn btn-secondary">Send Invitation</button>
    </form>
    <form id="registerParticipantForm3" class="mb-3 d-flex">
        <input type="text" id="participantNameInput3" class="form-control me-2" placeholder="Enter Participant Nickname" required>
        <button type="submit" class="btn btn-secondary">Send Invitation</button>
    </form>
    <form id="registerParticipantForm4" class="mb-3 d-flex">
        <input type="text" id="participantNameInput4" class="form-control me-2" placeholder="Enter Participant Nickname" required>
        <button type="submit" class="btn btn-secondary">Send Invitation</button>
    </form>
    <button id="startTournamentButton" class="btn btn-primary">Start Tournament</button>
    <!-- Winner Modal HTML -->
        <div id="winnerModal" class="modal">
            <div class="modal-content">
                <img src="../../assets/chevre_verte.png" class="rotating" alt="Award">
                <p id="winnerMessage"></p>
                <button onclick="closeModal()">Close</button>
            </div>
        </div>
</div>
    `;
};

export { Tournament };

import './TournamentInit.js';