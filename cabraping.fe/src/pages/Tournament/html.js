const Tournament_html = async () => {

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        window.location.href = '/#';
        return;
    }

    return `
      <!-- Tournament.html -->
      <div id="tournament" class="container mt-4">
          <h1>Create Tournament</h1>
          <form id="tournamentForm">
              <input type="text" id="tournamentNameInput" class="form-control" placeholder="Enter Tournament Name" required>
              <button type="submit" class="btn btn-primary">Create Tournament</button>
          </form>
          <div id="participantInvitationSection" class="mt-4">
              <h2>Register Participants</h2>
              <input type="text" id="participantNameInput" class="form-control" placeholder="Enter Participant Nickname" required>
              <button id="addParticipantButton" class="btn btn-secondary" disabled>Add Participant</button>
              <div style="height: 10px;"></div>
              <h6>Participant list:</h6>
              <ul id="participantsList" class="list-unstyled mt-2"></ul>
          </div>
          <button id="startTournamentButton" class="btn btn-success mt-3" disabled>Start Tournament</button>
      </div>
  
      <!-- Modals for Invitations and Notifications -->
      <div id="notificationModal" class="modal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
              <div class="modal-content">
                  <div class="modal-body">
                      <p id="modalMessage"></p>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" id="closeModalButton">Close</button>
                  </div>
              </div>
          </div>
      </div>
    `;
};

export { Tournament_html };
