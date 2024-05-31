import { getToken } from "../../utils/get-token.js";
import { sendWaitMatchedMessage } from "../../components/wcGlobal.js";

export function Matching_js() {
    document.getElementById('start-matching-button').addEventListener('click', async () => {
        const jwt = getToken();
        const payload = jwt.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        const userId = decodedPayload.user_id;

        sendWaitMatchedMessage(userId);
        console.log("Wait for match message sent");
    });
}
