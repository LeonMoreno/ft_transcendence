import getHash from "../../utils/getHash.js";

const BACKEND_URL = "http://localhost:8000";

export function Home_js() {

  let buttonAuth = document.getElementById('button-auth');

  if (buttonAuth) {
    buttonAuth.addEventListener('click', handleButtonClick);
  }

  return null;
}

async function redirect42() {
    const redirectURI = encodeURIComponent('http://localhost:8080');
  
    try {
      // Fetch configuration from backend
      const response = await fetch(`${BACKEND_URL}/auth42/config`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const config = await response.json();
  
      if (config) {
        const UID = config.UID;
        const SECRET = config.SECRET;
        
        console.log(UID);
        // Construct API URL with fetched UID
        const api_url = `https://api.intra.42.fr/oauth/authorize?client_id=${UID}&redirect_uri=${redirectURI}&response_type=code`;
  
        // Redirect the browser to the constructed API URL
        window.location.href = api_url;
      } else {
        console.error('Failed to fetch config.');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      // Handle error (e.g., show error message or fallback behavior)
    }
}

async function handleButtonClick() {
  
  console.log("😂😂😂 info 😂😂😂");
  console.log(getHash());

  redirect42()
}

