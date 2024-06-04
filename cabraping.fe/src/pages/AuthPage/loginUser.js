import { showNotification } from "../../components/showNotification.js"
import { displayErrorMessage } from '../Tournament/funcions-js.js';
import { initializeLogoutButtons } from '../Logout/funcions-js.js';

const BACKEND_URL = "http://localhost:8000";

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
        } else {
            displayErrorMessage(errorData.error || 'Incorrect username or password');
        }
          throw new Error('Login failed');
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
      displayErrorMessage('An error occurred during login');
  }
}

