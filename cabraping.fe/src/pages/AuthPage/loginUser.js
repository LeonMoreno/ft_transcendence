import { showNotification } from "../../components/showNotification.js"
import { initializeLogoutButtons } from "../../pages/Logout/funcions-js.js"

// Function to log in
/*export function loginUser(username, password) {
    fetch("http://127.0.0.1:8000/api/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
  .then(response => {
    if (response.ok) {
        showNotification("successful login", "success");
        return response.json();
    } else {
        showNotification("Incorrect username or password", "error");
        throw new Error('Login failed');
    }
  })
  .then(data => {
    console.log("data.access");
    console.log(data.access);

    localStorage.setItem('jwt', data.access);
    //showNotification("successful login", "success");
    // window.location.href = '/#';
    setTimeout(() => {
      window.location.href = '/#';
  }, 500);
  })
  //.catch((error) => {
  //  console.error('Error:', error);
  //});
}*/

export async function loginUser(username, password) {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            showNotification("Incorrect username or password", "error");
            throw new Error('Login failed');
        }

        const data = await response.json();
        console.log('Response body:', data);

        localStorage.setItem('jwt', data.access);
        localStorage.setItem('username', username);

        console.log('JWT Token:', data.access);

        showNotification("Successful login", "success");

        initializeLogoutButtons();

        setTimeout(() => {
            window.location.href = '/#';
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, "error");
    }
}
