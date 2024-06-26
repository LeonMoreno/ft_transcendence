import { showNotification } from "../../components/showNotification.js"

export function createUser(email, password) {
  const username = email.split('@')[0];

  const img = "https://i.pinimg.com/736x/22/d8/71/22d8716223532ec51ea7b0ea471bbe67.jpg"

  fetch('http://127.0.0.1:8000/api/users/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email: email, password, avatarImageURL: img })
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