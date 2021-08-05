import React, {useEffect, useRef, useState} from "react";
import Setting from "./components/Setting";
import Players from "./components/Players";
import getEveryRoomName from "./services/fetch";


const App = () => {
    const roomName = window.location.pathname.replace("/", "").replace("/", "")
    const nickname = localStorage.getItem("Name")
    const eyes = localStorage.getItem("Eyes")
    const mouth = localStorage.getItem("Mouth")
    const color = localStorage.getItem("Color")
    const [playerList, setPlayerList] = useState([{}])
    const url = "ws://" + window.location.host + "/ws/game/" + roomName + "/"
    const client = new WebSocket(url)
    useEffect(() => {
        client.onopen = () => {
            if (sessionStorage.getItem("Leader")){
                console.log("Leader Joined")
                client.send(JSON.stringify({
                    "ContentType": "LeaderJoined",
                    "nickname": nickname,
                    "eyes": eyes,
                    "mouth": mouth,
                    "color": color
                }))
            } else {
                client.send(JSON.stringify({
                    "ContentType": "PlayerJoined",
                    "nickname": nickname,
                    "eyes": eyes,
                    "mouth": mouth,
                    "color": color
                }))
            }
        }
    }, [])
    return (
        <div className={"body"}>
            <div className={"main-container"}>
                <Setting/>
                <Players playerList={playerList}/>
            </div>
        </div>
    )
}


export default App
