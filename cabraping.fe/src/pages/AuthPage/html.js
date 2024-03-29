
// export function AuthPage() {
export function AuthPage_html() {
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
