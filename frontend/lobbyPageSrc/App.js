import React, {useRef, useState} from "react";
import Setting from "./components/Setting";
import Players from "./components/Players";
import Character from "../landingPageSrc/components/character";


const App = () => {
    const roomName = window.location.pathname
    const nickname = localStorage.getItem("TEMP-Name"); localStorage.removeItem("TEMP-Name")
    const color = localStorage.getItem("TEMP-Color"); localStorage.removeItem("TEMP-Color")
    const eyes = localStorage.getItem("TEMP-Eyes"); localStorage.removeItem("TEMP-Eyes")
    const mouth = localStorage.getItem("TEMP-Mouth"); localStorage.removeItem("TEMP-Mouth")
    const [playerList, setPlayerList] = useState([
        {
            "name": nickname,
            "color": Number(color),
            "eyes": Number(eyes),
            "mouth": Number(mouth)
        }
    ])


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
