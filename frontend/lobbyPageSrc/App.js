import React, {useEffect, useState} from "react";
import Setting from "./components/lobbyComponents/Setting";
import Players from "./components/lobbyComponents/Players";
import Chat from "./components/lobbyComponents/chat";
import fetch from "./services/fetch"


const App = () => {
    const roomName = window.location.pathname.split("/")[1]
    if(!sessionStorage.getItem("Leader")){
        window.location.pathname = roomName + "/joinGame"
    }
    const nickname = sessionStorage.getItem("Name")
    const eyes = sessionStorage.getItem("Eyes")
    const mouth = sessionStorage.getItem("Mouth")
    const color = sessionStorage.getItem("Color")
    const [playerList, setPlayerList] = useState([{}])
    const [messages, setMessages] = useState([{
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
    }])
    const url = "ws://" + window.location.host + "/ws/game/" + roomName + "/"
    const client = new WebSocket(url)
    useEffect(() => {
        client.onopen = () => {
            if (sessionStorage.getItem("Leader") === "true") {
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
        } else if(data.ContentType === "updatePlayers"){
            fetch.updateRoomPlayers(roomName).then(r => {
                let players = []
                r.data.data.forEach(player => {
                    players = players.concat({
                        "id": players.length,
                        "nickname": player.nickname,
                        "color": player.color,
                        "mouth": player.mouth,
                        "eyes": player.eyes,
                        "leader": player.leader
                    })
                })
                setPlayerList(players)
                console.log(data.content)
                //if(data.content === "playerJoined"){
                //    setMessages(messages.concat(
                //        {
                //            "type": "joinMessage",
                //            "username": data.player,
                //            "message": "Has joined the server",
                //            "time": "HeteroTime"
                //        }
                //    ))
                //} else if(data.content === "playerLeave") {
                //    setMessages(messages.concat({
                //        "type": "leaveMessage",
                //        "username": data.player,
                //        "message": "Has left the server",
                //        "time": "HeteroTime"
                //    }))
                //}
                //console.log(messages)
            })
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
