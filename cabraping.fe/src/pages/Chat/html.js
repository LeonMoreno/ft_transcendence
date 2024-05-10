// import image from '../../assets/logo.svg';

// let image = 'assets/logo.svg';

export  function Chat_html() {

  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
      window.location.href = '/#';
      return;
  }

  return `
  <div class="container-fluid h-100 d-flex flex-column flex-md-row">
    <!-- Panel Izquierdo: Chat List -->
    <div class="bg-light p-3 d-md-block vh-100" style="flex: 0 0 25%;">
      <h3>Chat</h3>
      <div class="mb-4">
        <h4 class="d-flex justify-content-between fs-5">
          Messages with all
          <button id="addChannel" class="btn btn-primary btn-sm">Add Channel</button>
        </h4>
        <select id="channelsDropdown" class="form-control">
          <option value="-1">Select a person for messages</option>
        </select>
      </div>
      <div class="mt-4">
        <h3>Block users</h3>
        <div id="list-block" class="">
        </div>
      </div>
    </div>

    <!-- Panel Medio: Chat Messages -->
    <div class="bg-white p-3 overflow-auto" style="flex-grow: 1;">
      <h3 id="channel-title" class="mb-4">
        Channel Title
      </h3>
      <button id="blockUserButton" class="btn btn-danger btn-sm ml-2">Block User</button>
      <button id="usersRouteButton" class="btn btn-secondary btn-sm ml-2">Users</button>
      <!-- Messages go here -->
      <ul id="messageList" class="list-unstyled">
        <!-- Aquí se agregarán los mensajes -->
      </ul>
      <!-- Textarea for new messages -->
      <div class="mt-3">
        <textarea id="messageTextarea" class="form-control" rows="3"></textarea>
        <button id="sendButton" class="btn btn-primary mt-2">Enviar</button>
      </div>
    </div>


  </div>


    <!-- Modal para crear un nuevo canal -->
    <div class="modal" tabindex="-1" role="dialog" id="channelModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Channel</h5>
            <button id="closeModalButton" type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">

            <p>Members</p>
            <select multiple class="form-control" id="channelMembers"></select>

          </div>
          <div class="modal-footer">
            <button type="button" id="saveChannelButton" class="btn btn-primary">Save Channel</button>
          </div>
        </div>
      </div>
    </div>
    `;
}