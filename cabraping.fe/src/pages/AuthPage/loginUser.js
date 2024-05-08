import { showNotification } from "../../components/showNotification.js"

// Function to log in
export function loginUser(username, password) {
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
    showNotification("successful login", "success");
    // window.location.href = '/#';
    setTimeout(() => {
      window.location.href = '/#';
  }, 500);
  })
  //.catch((error) => {
  //  console.error('Error:', error);
  //});
}