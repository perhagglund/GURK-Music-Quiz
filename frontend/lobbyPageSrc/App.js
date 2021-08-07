import React, {useEffect, useRef, useState} from "react";
import Setting from "./components/Setting";
import Players from "./components/Players";
import getEveryRoomName from "./services/fetch";


const App = () => {
    const roomName = window.location.pathname.replace("/", "").replace("/", "")
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
    client.onmessage = (e) => {
        //const data = JSON.parse(e.data)
        //if (data.ContentType === "PlayerJoined") {
        //    setPlayerList(playerList.concat({
        //        "name": data.name,
        //        "color": Number(data.color),
        //        "eyes": Number(data.eyes),
        //        "mouth": Number(data.mouth)
        //    }))
        //}
    }

    client.onclose = () => {
        console.log("Bye")
    }
    return (
        <div className={"body"}>
            <div className={"body-container"}>
                <div className={"main-container"}>
                    <Setting/>
                    <Players playerList={playerList}/>
                </div>
            </div>
        </div>
    )
}


export default App
