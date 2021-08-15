import React, {useEffect, useState} from "react";
import {Redirect} from "react-router-dom";
import Setting from "./components/lobbyComponents/Setting";
import Players from "./components/lobbyComponents/Players";
import Chat from "./components/lobbyComponents/chat";


const App = () => {
    const roomName = window.location.pathname.split("/")[1]
    if(!sessionStorage.getItem("Leader")){
        window.location.pathname = roomName + "/joinGame"
    }
    const nickname = sessionStorage.getItem("Name")
    const eyes = sessionStorage.getItem("Eyes")
    const mouth = sessionStorage.getItem("Mouth")
    const color = sessionStorage.getItem("Color")
    const [playerList, setPlayerList] = useState([{
        "name": "adam",
        "color": 3,
        "eyes": 1,
        "mouth": 3
    }, {
        "name": "per",
        "color": 1,
        "eyes": 2,
        "mouth": 3
    }, {
        "name": "doniel",
        "color": 2,
        "eyes": 0,
        "mouth": 1
    }])
    const [messages, setMessages] = [{
        "type": "chatMessage",
        "username": "per",
        "message": "Hej, jag är lite bög",
        "time": "geytime"
    }, {
        "type": "chatMessage",
        "username": "doniel",
        "message": "Hej, jag är lite bög",
        "time": "Geytime"
    }, {
        "type": "chatMessage",
        "username": "Adam",
        "message": "Hej Hej mina bögar",
        "time": "HeteroTime"
    }]
    const url = "ws://" + window.location.host + "/ws/game/" + roomName + "/"
    console.log(url)
    const client = new WebSocket(url)
    useEffect(() => {
        client.onopen = () => {
            if (sessionStorage.getItem("Leader") === "true") {
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

    client.onmessage = (e) => {
        const data = JSON.parse(e.data)
        console.log("Hej")
        if (data.ContentType === "NewLeader") {
            sessionStorage.setItem("Leader", "true")
            console.log("LeaderLeft")
        }
    }

    client.onclose = () => {
        sessionStorage.clear()
    }
    return (
        <div className={"body"}>
            <div className={"body-container"}>
                <div className={"main-container"}>
                    <Setting/>
                    <Players playerList={playerList}/>
                </div>
                <Chat messages={messages}/>
            </div>
        </div>
    )
}


export default App
