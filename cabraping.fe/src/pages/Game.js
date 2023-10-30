const Game = () => {
  const view = `
    <div class="w-100 h-100 d-flex" >
      <div class="w-25 h-100 bg-light">
        <h3>Chat</h3>
        <div>
          <h4>Channels</h4>
          <ul>
            <li>42 quebec</li>
            <li>Global</li>
            <li>Random</li>
            <li>Team</li>
          </ul>
        </div>

        <div>
          <h4>Users</h4>
          <ul>
            <li>42 quebec</li>
            <li>Global</li>
            <li>Random</li>
            <li>Team</li>
          </ul>
        </div>
      </div>



      <div class="w-75 h-100 bg-secondary"></div>
    </div>
    `;

  return view;
};

export default Game;
