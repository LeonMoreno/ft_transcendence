import { showNotificationPopup } from "../../components/showNotification.js";
import { sendGameInitate_Waiting, sendGameInvataeNotifications, sendGameInvataeTournamentNotifications, sendWinnerOfGameTournamentNotifications } from "../../components/wcGlobal-funcions-send-message.js";
import { BACKEND_URL } from "../../components/wcGlobal.js";
import { getToken } from "../../utils/get-token.js";
import { getUserIdFromJWT } from "../Chat/funcions-js.js";
// import { handle_Tournmanet_game_invitte } from "../TournamentWaitingArea/game-logic.js";


async function update_winer_of_tournament(tournamentId, winer) {


    const response = await fetch(`${BACKEND_URL}/api/tournaments/${tournamentId}/update_status/`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: "completed",
            champion: Number(winer)
        })
    });

    showNotificationPopup("You won congratulations the tournament", `success`);
    console.log("is finish!!!!!!!");
    window.location.href = `/#`;


}

export async function Send_data_bacnd_the_winer(first_player, secong_player, winer) {

    // localStorage.setItem('currentTournamentId', pendingTournament.id);
    let tournament_id = localStorage.getItem("currentTournamentId");
    let user_id = getUserIdFromJWT();

    if (winer !== user_id ){
        showNotificationPopup("you lost good luck for the next, ", `loss`);
        console.log("🥻🥻🥻>> winer:", winer, ", user_id:", user_id);
        window.location.href = `/#`;
        return;
    }

    showNotificationPopup("You won congratulations", `success`);

    let myUserName = localStorage.getItem("username");

    const response = await fetch(
        `${BACKEND_URL}/api/matches/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tournament: tournament_id,
            participant1: first_player,
            participant2: secong_player,
            winner: winer
          }),
        }
    );

    if (response.ok){
        console.log("🧶🧶>> Send_data_bacnd_the_winer:", user_id);

        sendWinnerOfGameTournamentNotifications(user_id, "null",  `system_Tournmanet_${tournament_id}:${winer}`);
    }

    if (winer === user_id) {
        const matchesResponse = await fetch(`${BACKEND_URL}/api/tournaments/${tournament_id}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            }
        });

        const data = await matchesResponse.json();
        const matches = data.matches;
        console.log("------------------------> matches:", matches);
        if (matches.length <= 2) {
            let system_winner = localStorage.getItem(`system_Tournmanet_${tournament_id}_winner`);

            console.log("🧶🧶>> tengo system_winner?:", system_winner);
            if (!system_winner || system_winner === "no") {
                return;
            }
            let system_final = localStorage.getItem(`system_Tournmanet_status_${tournament_id}`);
            let system_final_final = localStorage.getItem(`system_Tournmanet_status_${tournament_id}_final`);

            console.log("🧶 >>>>>> system_final:", system_final);
            console.log("🧶 >>>>>> system_final_final:", system_final_final);

            console.log("🧶🧶🧶>> system_winner:", system_winner);
            console.log("🧶🧶🧶>> winer:", winer);
            console.log("🧶🧶🧶>> user_id:", user_id);

            if (system_winner !== user_id) {
                let status = await sendGameInitate_Waiting(user_id, system_winner);
                console.log("🧶🧶🧶🧶>> user_id:", status);
                if (status.ok) {
                    console.log("---> Tournmanet_game (system_winner): Se mando la invitacion del juego con:", user_id, " de ", myUserName, ", a ", system_winner, "system-tournament-final");
                    sendGameInvataeNotifications(user_id, myUserName, system_winner, "system-tournament-final");
                    localStorage.setItem(`system_Tournmanet_status_${tournament_id}`, "final");
                    window.location.href = `/#waitroom/${tournament_id}`;
                    return true;
                }
            }
        }
        else{
            console.log("soy el ganador y voy a terminar el tournament");
            localStorage.setItem(`system_Tournmanet_status_${tournament_id}`, "no");
            update_winer_of_tournament(tournament_id, winer);
        }
    }



    return false;
}
