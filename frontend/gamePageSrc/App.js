import React, {useEffect, useState} from "react";
import { gameclient } from "../lobbyPageSrc/services/gameWebSocketConnect";

const App = () => {
    const session = sessionStorage.getItem("uniqueID")
    const [gameState, setGameState] = useState("Not Online")
    useEffect(() => {
        gameclient.onopen = () => {
            gameclient.send(JSON.stringify({
                "ContentType": "checkID",
                "id": session
            }))
            gameclient.send(JSON.stringify({
                "ContentType": "getOnlineStatusGroup"
            }))
        }
    }, [])

    gameclient.onmessage = (e) => {
        const data = JSON.parse(e.data)
        console.log(data)
        if (data.ContentType === "Accepted") {
            setGameState("Online")
        } else if (data.ContentType === "Denied") {
            window.location.href = "/"
        }
    }

    return (
        <div>
            {session}
            {gameState}
        </div>
    )
}


export default App
