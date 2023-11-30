
export function AuthPage() {
  return `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6">
          <!-- Login Form -->
          <form id="login-form">
            <h2>Login</h2>
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" class="form-control" id="username" required>
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
        </div>
      </div>
    </div>
  `;
}

// AuthPage.js

export function AuthPageInit() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  // Handler for login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    loginUser(username, password);
  });

  // Handler for registration
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    createUser(email, password);
  });
}

// Function to log in
function loginUser(username, password) {
  fetch('http://127.0.0.1:8000/api/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // Here you can handle the token storage and user redirection
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

// Function to create a new user
function createUser(email, password) {

  const username = email.split('@')[0];

  console.log(`email : ${email}`);
  console.log(`username : ${username}`);
  console.log(`password : ${password}`);

  fetch('http://127.0.0.1:8000/api/users/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email: email, password }) // Assumes the email is the same as the username
  })
  .then(response => response.json())
  .then(data => {
    console.log('User created:', data);
    // Here you can handle the user notification and redirection
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}
