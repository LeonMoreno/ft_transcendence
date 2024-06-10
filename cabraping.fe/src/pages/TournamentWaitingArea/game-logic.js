import { sendDelleteMatchedMessage,  sendGameInitate_Waiting, sendGameInvataeTournamentNotifications, sendGameInvataeNotifications, sendAcceptedGameNotifications } from "../../components/wcGlobal-funcions-send-message.js";
import { BACKEND_URL } from "../../components/wcGlobal.js";
import { getUserIdFromJWT } from "../Chat/funcions-js.js";
import { fetchTournaments } from "../Tournament/funcions-js.js";

let userId;
let myUserName;
let list_palyers_id;
let send_id;


export async function sendGameAcceptTournament_Waiting(new_userId, dest_user_id, new_myUserName) {

    console.log("?????????????????????????");
    console.log("??> sendGameAcceptTournament_Waiting:");
    let find_me = false;
    const jwt = localStorage.getItem('jwt');
    const update_waiting_list = await list_of_Tournament(getUserIdFromJWT(jwt));
    if (!jwt || !update_waiting_list) {
        return;
    }

    console.log("----> Tournament: in sendGameAccept_Waiting:", update_waiting_list);
    console.log("----> Tournament: in new_userId:", new_userId);
    console.log("----> Tournament: in dest_user_id:", dest_user_id);

    // const waitingIds = JSON.parse(update_waiting_list);
    const waitingIds = update_waiting_list;
    if (waitingIds.length >= 2) {
        for (let i = 1; i < waitingIds.length; i += 2) {
            console.log("-----> Matching: i:",i, ", waitingIds[i]:", waitingIds[i]);
            console.log("-----> Matching: if 1:", (waitingIds[i] === Number(new_userId)) );
            console.log("-----> Matching: if 2:", (waitingIds[i - 1] === Number(dest_user_id)) );
            if (waitingIds[i] === Number(new_userId) && waitingIds[i - 1] === Number(dest_user_id)) {
                find_me = true;
                break;
            }
        }
    }

    console.log("----> Tournament: find_me:", find_me);
    if (!find_me) {
        return;
    }

    console.log("----> Tournament: userId:", new_userId, ", dest_user_id:", dest_user_id);
    const responseGames = await fetch(`${BACKEND_URL}/api/games/`, {
        headers: { Authorization: `Bearer ${jwt}` },
    });
    const games = await responseGames.json();

    const game = games.find(
        (game) =>
            game.invitee.id === Number(new_userId) &&
            game.inviter.id === Number(dest_user_id) &&
            game.invitationStatus === "PENDING"
    );

    if (game) {
        const response = await fetch(
            `${BACKEND_URL}/api/games/${game.id}/accept_game/`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            console.log("error in system");
        }
        // sendAcceptedGameNotifications(new_userId, new_myUserName, dest_user_id, game.id);
        sendAcceptedGameNotifications(new_userId, new_myUserName, dest_user_id, game.id);
        sendDelleteMatchedMessage(new_userId, dest_user_id);
        window.location.href = `/#game/${game.id}`;
    }
}

export async function sendGameAcceptTournament_final_Waiting(new_userId, dest_user_id, new_myUserName) {

    console.log("?????????????????????????");
    console.log("??> sendGameAcceptTournament_final_Waiting:");
    let find_me = false;
    const jwt = localStorage.getItem('jwt');
    const update_waiting_list = await list_of_Tournament(getUserIdFromJWT(jwt));
    if (!jwt || !update_waiting_list) {
        return;
    }

    console.log("----> final: in sendGameAccept_Waiting:", update_waiting_list);
    console.log("----> final: in new_userId:", new_userId);
    console.log("----> final: in dest_user_id:", dest_user_id);

    // Verificar si ambos IDs existen en `waitingIds`
    const waitingIds = update_waiting_list;
    if (waitingIds.includes(Number(new_userId)) && waitingIds.includes(Number(dest_user_id))) {
        find_me = true;
    }

    console.log("----> final: find_me:", find_me);
    if (!find_me) {
        return;
    }

    console.log("----> final: userId:", new_userId, ", dest_user_id:", dest_user_id);
    const responseGames = await fetch(`${BACKEND_URL}/api/games/`, {
        headers: { Authorization: `Bearer ${jwt}` },
    });
    const games = await responseGames.json();

    const game = games.find(
        (game) =>
            game.invitee.id === Number(new_userId) &&
            game.inviter.id === Number(dest_user_id) &&
            game.invitationStatus === "PENDING"
    );

    if (game) {
        const response = await fetch(
            `${BACKEND_URL}/api/games/${game.id}/accept_game/`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response.ok) {
            console.log("error in system");
        }
        // sendAcceptedGameNotifications(new_userId, new_myUserName, dest_user_id, game.id);
        sendAcceptedGameNotifications(new_userId, new_myUserName, dest_user_id, game.id);
        sendDelleteMatchedMessage(new_userId, dest_user_id);
        window.location.href = `/#game/${game.id}`;
    }
}

async function list_of_Tournament(id) {

    let tem_list = []

    let tournaments = await fetchTournaments();

    console.log("Tournament: id:", id);
    console.log("Tournament: tournaments:", tournaments);

    if (!tournaments)
    {
        alert("1Problem with the backend reload page");
        return null;
    }
    const pendingTournament = tournaments.find(t => t.status === 'in_progress' && t.participants.some(p => p.user.id === id));

    console.log("in_progressTournament:", pendingTournament);
    if (!pendingTournament)
    {
        alert("2Problem with the backend reload page");
        return null;
    }


    pendingTournament.participants.map((participant) => tem_list.push(participant.user.id))

    return tem_list;
}

export async function system_invitte_game_Tournmanet() {

    userId = getUserIdFromJWT();
    myUserName = localStorage.getItem("username");

    console.log("🤖---> system_invitte_game_Tournmanet");


    list_palyers_id = await list_of_Tournament(userId);

    // pendingTournament.participants.map((participant) => list_palyers_id.push(participant.user.id))

    console.log("---> Tournmanet_game: list_palyers_id:", list_palyers_id);
    console.log("---> Tournmanet_game: list_palyers_id:", list_palyers_id, ",userId:", userId, ", myUserName:", myUserName);
    if (list_palyers_id.length >= 2) {
        for (let i = 0; i < list_palyers_id.length; i += 2) {
            if (list_palyers_id[i] === userId) {
                console.log("---> Tournmanet_game: sendGameInitate_Waiting:", userId, list_palyers_id[i + 1]);
                let status = await sendGameInitate_Waiting(userId, list_palyers_id[i + 1]);
                if (status.ok) {
                    console.log("---> Tournmanet_game: Se mando la invitacion del juego con:", userId," de ", myUserName, ", a ",list_palyers_id[i + 1], "system-tournament");
                    sendGameInvataeNotifications(userId, myUserName, list_palyers_id[i + 1], "system-tournament");
                    return true;
                }
                return false;
            }
        }
    }

}


export async function handle_Tournmanet_game_invitte(tournament_id) {

    let status = await system_invitte_game_Tournmanet()

    if ( status === true)
    {
        console.log("----> _Tournmanet handle_Tournmanet_game_invitte");
        sendGameInvataeTournamentNotifications(userId, myUserName, 0, `system_Tournmanet_${tournament_id}`);
        localStorage.setItem(`system_Tournmanet_status_${tournament_id}`, "in");
    }
}