import React, {useEffect, useRef, useState} from "react";
import Setting from "./components/Setting";
import Players from "./components/Players";
import Character from "../landingPageSrc/components/character";


const App = () => {
    const roomName = window.location.pathname
    const nickname = localStorage.getItem("TEMP-Name");
    const color = localStorage.getItem("TEMP-Color");
    const eyes = localStorage.getItem("TEMP-Eyes");
    const mouth = localStorage.getItem("TEMP-Mouth");
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
    const url = "ws://" + window.location.host + "/ws/game" + roomName
    const client = new WebSocket(url)
    /*useEffect(() => {
        client.onopen = () => {
            console.log("Hello")
            client.send(JSON.stringify({
                "Content-Type": "Joined",
                "name": nickname,
                "color": Number(color),
                "eyes": Number(eyes),
                "mouth": Number(mouth)
            }))
        }
    }, [])

    client.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.ContentType === "PlayerJoined") {
            setPlayerList(playerList.concat({
                "name": data.name,
                "color": Number(data.color),
                "eyes": Number(data.eyes),
                "mouth": Number(data.mouth)
            }))
        }
    }

    client.onclose = () => {
        localStorage.removeItem("TEMP-Name")
        localStorage.removeItem("TEMP-Color")
        localStorage.removeItem("TEMP-Eyes")
        localStorage.removeItem("TEMP-Mouth")
    }*/


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
