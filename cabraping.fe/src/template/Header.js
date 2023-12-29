
// import image from '../assets/logo.svg';

// const Header = () => {
//     const view = `
//       <div class="d-flex justify-content-between align-items-center p-3 bg-light">
//           <!-- Left Menu -->
//           <div class="d-flex">
//               <a href="#friends" class="m-5 text-dark text-decoration-none">Friends</a>
//               <a href="#chat" class="m-5 text-dark text-decoration-none">Chats</a>
//               <a href="#game" class="m-5 text-dark text-decoration-none">Games</a>
//           </div>

//           <!-- Logo -->
//           <div>
//             <a href="#" >
//                 <img src="${image}" alt="Logo" style="height: 50px;">
//             </a>
//           </div>

//           <!-- Right Menu -->
//           <div>
//               <button class="btn btn-warning text-white">42 Auth</button>
//           </div>
//       </div>
//      `;

//     return view;
//   };

//   export default Header;

///////////

import image from '../assets/logo.svg';

export function Header() {
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
                <button id="authButton" class="btn btn-warning text-white">Login</button>
            </div>
        </div>
    `;
    return view;
};

export function HeaderInit() {
    const authButton = document.getElementById('authButton');

    const updateButton = () => {
        const jwt = localStorage.getItem('jwt');
        console.log("--> 🤖");
        console.log(jwt);
        console.log("--> jwt:");
        if (jwt) {
            authButton.textContent = 'Logout';
            authButton.style.backgroundColor = 'red'; // Set button background to red

        } else {
            authButton.textContent = 'Login';
            authButton.style.backgroundColor = ''; // Reset to default
        }
    };

    // Event listener for the button
    authButton.addEventListener('click', () => {
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
            localStorage.removeItem('jwt'); // Logout the user
            updateButton(); // Update button to reflect logged out state
            location.reload(); // or redirect to home
        } else {
            location.href = '#auth'; // Redirect to auth for login
        }
    });

    // Initialize button text based on JWT
    updateButton();
}