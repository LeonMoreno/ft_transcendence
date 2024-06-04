export function Error404_html() {
  return `
    <div class="Error404 min-vh-100 d-flex flex-column align-items-center justify-content-center">
      <h1 class="display-1 text-danger">404</h1>
      <h2 class="mb-4">Page Not Found</h2>
      <p class="text-muted mb-4">Cabraping apologizes but the page you're looking for doesn't exist.</p>
      <a href="#/" class="btn btn-primary">Go to Home</a>
    </div>
    <style>
      .Error404 {
        background-color: #f8f9fa;
        text-align: center;
      }
      .Error404 h1 {
        font-size: 6rem;
      }
      .Error404 h2 {
        font-size: 2rem;
      }
      .Error404 p {
        font-size: 1.2rem;
      }
      .Error404 a {
        text-decoration: none;
      }
    </style>
  `;
}

