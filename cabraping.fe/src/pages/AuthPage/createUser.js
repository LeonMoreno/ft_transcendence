import { showNotification } from "../../components/showNotification"

export function createUser(email, password) {
  const username = email.split('@')[0];

  fetch('http://127.0.0.1:8000/api/users/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email: email, password })
  })
  .then(response => {
      if(response.status === 200 || response.status === 201) {
          return response.json(); // Proceed with the success response
      } else {
          // When the response is not 200 or 201, handle it as an error
          throw new Error(`Server responded with status: ${response.status}`);
      }
  })
  .then(data => {
      // Assuming data contains the response for a successful user creation
      showNotification("User created successfully", "success");
  })
  .catch((error) => {
      // Catch any error from the server response or the fetch operation itself
      // Error message can be more user-friendly or detailed based on the actual server response
      showNotification("Error creating user! " + error.message, "error");
  });
}


// function showNotification(message, type) {
//   const container = document.getElementById('notification-container');
//   const notification = document.createElement('div');
//   notification.classList.add('notification', type);
//   notification.textContent = message;

//   container.appendChild(notification);

//   // Automatically remove the notification after 5 seconds
//   setTimeout(() => {
//       container.removeChild(notification);
//   }, 5000);
// }
