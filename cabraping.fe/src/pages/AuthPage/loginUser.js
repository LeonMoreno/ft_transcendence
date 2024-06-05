import { showNotification } from "../../components/showNotification.js"
import { displayErrorMessage } from '../Tournament/funcions-js.js';
import { initializeLogoutButtons } from '../Logout/funcions-js.js';

// Extract the IP address from the URL used to access the frontend
const frontendURL = new URL(window.location.href);
const serverIPAddress = frontendURL.hostname;
const serverPort = 8000; // Specify the port your backend server is running on
const BACKEND_URL = `http://${serverIPAddress}:${serverPort}`;

export async function loginUser(username, password) {
  try {
      const response = await fetch(`${BACKEND_URL}/api/login/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'User not found') {
            displayErrorMessage("You need to sign up before trying to sign in.");
        } else if (errorData.error === 'Incorrect password') {
            displayErrorMessage("The password you entered is incorrect. Please try again.");
        } else {
            displayErrorMessage(errorData.error || 'Incorrect username or password');
        }
        return;
    }

      const data = await response.json();
      console.log('Response body:', data);

      localStorage.setItem('jwt', data.access);
      localStorage.setItem('userId', data.user.id); // Save user ID
      localStorage.setItem('username', data.user.username); // Save username

      console.log('JWT Token:', data.access);

      showNotification("Successful login", "success");

      initializeLogoutButtons();

      setTimeout(() => {
          window.location.href = '/#';
      }, 500);

  } catch (error) {
      console.error('Login error:', error);
      displayErrorMessage('An error occurred during login. Have you signed up before trying to log in?');
  }
}

