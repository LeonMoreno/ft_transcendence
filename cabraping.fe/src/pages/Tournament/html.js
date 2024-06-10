const Tournament_html = async () => {

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        window.location.href = '/#';
        return;
    }

    return `
      <!-- Tournament.html -->
      <div id="tournament" class="container mt-4 mb-6">
          <h1>Create Tournament</h1>
          <form id="tournamentForm" class="row g-3">
              <div class="col-sm-7 col-md-6">
                  <input type="text" id="tournamentNameInput" class="form-control" placeholder="Enter Tournament Name" required>
              </div>
              <div class="col-sm-5 col-md-4">
                  <button type="submit" class="btn btn-primary w-100">Create Tournament</button>
              </div>
          </form>
          <div id="participantInvitationSection" class="mt-4">
              <h2>Register Participants</h2>
              <div class="row g-3">
                  <div class="col-sm-7 col-md-6">
                      <input type="text" id="participantNameInput" class="form-control" placeholder="Enter Participant Nickname" required>
                  </div>
                  <div class="col-sm-5 col-md-4">
                      <button id="addParticipantButton" class="btn btn-secondary w-100" disabled>Add Participant</button>
                  </div>
              </div>
              <div style="height: 10px;"></div>
              <h6>Participant list:</h6>
              <ul id="participantsList" class="list-unstyled mt-2"></ul>
          </div>
          <button id="goToWaitingAreaButton" class="btn btn-success mt-3 mb-5" disabled>Go To Tournament Waiting Area</button>
          <button id="cancelCreateButton" class="btn btn-danger mt-3 mb-5">Cancel</button>
      </div>
      <!-- Modal for notifications -->
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
