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
    <!-- Invitation Modal -->
<div class="modal fade" id="invitationModal" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalLabel">Tournament Invitation</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <p id="modal-content"></p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary">Accept</button>
            </div>
        </div>
    </div>
</div>

    
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

//export const Tournament_html = Tournament;


//import './TournamentInit.js';