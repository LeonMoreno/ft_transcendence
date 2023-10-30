
import image from '../assets/logo.svg';

const Header = () => {
    const view = `
      <div class="d-flex justify-content-between align-items-center p-3 bg-light">
          <!-- Left Menu -->
          <div class="d-flex">
              <a href="#friends" class="m-5 text-dark text-decoration-none">Friends</a>
              <a href="#chat" class="m-5 text-dark text-decoration-none">Chats</a>
              <a href="#game" class="m-5 text-dark text-decoration-none">Games</a>
          </div>

          <!-- Logo -->
          <div>
            <a href="#" >
                <img src="${image}" alt="Logo" style="height: 50px;">
            </a>
          </div>

          <!-- Right Menu -->
          <div>
              <button class="btn btn-warning text-white">42 Auth</button>
          </div>
      </div>
     `;

    return view;
  };

  export default Header;