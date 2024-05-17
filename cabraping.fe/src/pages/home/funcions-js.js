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
    const redirectURI = encodeURIComponent('http://localhost:8000/callback/');
  
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


async function getAccessToken(authorization_code) {
  const redirectURI = encodeURIComponent('http://localhost:8000/callback/');

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

      // Construct the URL
      const url = 'https://api.intra.42.fr/oauth/token';
      const data = `?grant_type=authorization_code` +
               `&client_id=${UID}` +
               `&client_secret=${SECRET}` +
               `&code=${authorization_code}` +
               `&redirect_uri=${redirectURI}`;

      return url + data;

      // Redirect the browser to the constructed API URL
      window.location.href = api_url;
    } else {
      console.error('Failed to fetch config.');
    }
  } catch (error) {
    console.error('Error fetching config:', error);
    // Handle error (e.g., show error message or fallback behavior)
  }
  // Fetch configuration from backend
  //const response = await fetch(`${BACKEND_URL}/auth42/config`);
  //const config = await response.json();
  
  //const client_id = config.UID;
  //const client_secret = config.SECRET;
  //const redirectURI = encodeURIComponent('http://localhost:8080');

  // Construct the URL
  //const url = 'https://api.intra.42.fr/oauth/token';
  //const data = `?grant_type=authorization_code` +
  //             `&client_id=${client_id}` +
  //             `&client_secret=${client_secret}` +
  //             `&code=${authorization_code}` +
  //             `&redirect_uri=${redirectURI}`;

  //return url + data;
}
/*
// Example usage:
const authorizationCode = 'your_authorization_code';  // Replace with actual authorization code

getAccessToken(authorizationCode).then(accessTokenURL => {
  console.log('Access Token URL:', accessTokenURL);
}).catch(error => {
  console.error('Error:', error);
});


const urlParams = new URLSearchParams(window.location.search);
const authorizationCode = urlParams.get('code');
console.log(authorizationCode);

getAccessToken(authorizationCode).then(accessTokenURL => {
  console.log('Access Token URL:', accessTokenURL);
}).catch(error => {
  console.error('Error:', error);
});
*/

async function handleButtonClick() {
  
  console.log("😂😂😂 info 😂😂😂");
  console.log(getHash());

  redirect42()


}

