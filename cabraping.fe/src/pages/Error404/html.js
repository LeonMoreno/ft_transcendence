export function Error404_html() {
  return `
    <div class="Error404 min-vh-100 d-flex flex-column align-items-center justify-content-center">
      <h1 class="display-1 text-danger">404</h1>
      <h2 class="mb-3">Page Not Found</h2>
      <p class="text-muted mb-3">Cabraping apologizes but the page you are looking for does not exist.</p>
      <a href="#/" class="btn btn-primary mt-2">Go to Home</a>
    </div>
    <style>
      .Error404 {
        background-color: #f8f9fa;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 0 20px; /* Add some padding for smaller screens */
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
        margin-top: 20px; /* Add space between the paragraph and the button */
      }
      @media (max-width: 768px) {
        .Error404 h1 {
          font-size: 4rem;
        }
        .Error404 h2 {
          font-size: 1.5rem;
        }
        .Error404 p {
          font-size: 1rem;
        }
      }
      @media (max-width: 576px) {
        .Error404 h1 {
          font-size: 3rem;
        }
        .Error404 h2 {
          font-size: 1.2rem;
        }
        .Error404 p {
          font-size: 0.9rem;
        }
      }
    </style>
  `;
}

