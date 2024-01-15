export function AuthPage() {
  const jwt = localStorage.getItem("jwt");
  if (jwt) {
    window.location.href = "/#";
    return;
  }

  return `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6">
          <!-- Login Form -->
          <form id="login-form">
            <h2>Login</h2>
            <div class="mb-3">
              <label for="username" class="form-label">Email</label>
              <input type="email" class="form-control" id="username" required>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
          </form>
        </div>
        <div class="col-md-6">
          <!-- Registration Form -->

          <form id="signup-form">
          <h2>Create Account</h2>
          <!-- Add additional fields as per your user model -->
          <div class="mb-3">
          <label for="new-username" class="form-label">Email</label>
          <input type="email" class="form-control" id="new-username" required>
          </div>
          <div class="mb-3">
          <label for="new-password" class="form-label">Password</label>
          <input type="password" class="form-control" id="new-password" required>
          </div>
          <button type="submit" class="btn btn-success">Create Account</button>
          </form>

          <div class="notification-container" id="notification-container" ></div>
        </div>
      </div>
    </div>
  `;
}

{/* <div id="notification-container" style="position: fixed; top: 20px; right: 20px; z-index: 1000;"></div> */}
// AuthPage.js

export function AuthPageInit() {
  const jwt = localStorage.getItem("jwt");
  if (jwt) {
    window.location.href = "/#";
    return;
  }

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  // Handler for login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    loginUser(username, password);
  });

  // Handler for registration
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    createUser(email, password);
  });
}

// Function to log in
function loginUser(username, password) {
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
    // window.location.href = '/#';
    setTimeout(() => {
      window.location.href = '/#';
  }, 500);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

function showNotification(message, type) {
  const container = document.getElementById('notification-container');
  const notification = document.createElement('div');
  notification.classList.add('notification', type);
  notification.textContent = message;

  container.appendChild(notification);

  // Automatically remove the notification after 5 seconds
  setTimeout(() => {
      container.removeChild(notification);
  }, 5000);
}


// Function to create a new user
// function createUser(email, password) {

//   const username = email.split('@')[0];

//   console.log(`email : ${email}`);
//   console.log(`username : ${username}`);
//   console.log(`password : ${password}`);

//   fetch('http://127.0.0.1:8000/api/users/', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ username, email: email, password }) // Assumes the email is the same as the username
//   })
//   .then(response => response.json())
//   .then(data => {
//     console.log('User created:', data);
//     showNotification("User created successfully!", "success");

//     // Here you can handle the user notification and redirection
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//     showNotification("Error creating user!", "error");

//   });
// }

function createUser(email, password) {
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
