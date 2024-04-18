import image from '../../assets/logo.svg';

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
      <div class="mt-4 d-flex align-items-center">
        <img src="${image}" alt="User Image" class="rounded-circle mr-2" width="40">
        <div>
          <strong>username</strong>
          <button class="btn btn-link p-0">Logout</button>
        </div>
      </div>
    </div>

    <!-- Panel Medio: Chat Messages -->
    <div class="bg-white p-3 overflow-auto" style="flex-grow: 1;">
      <h3 id="channel-title" class="mb-4">#channel-alpha</h3>
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