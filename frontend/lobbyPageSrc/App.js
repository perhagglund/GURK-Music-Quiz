import React from "react";
import Setting from "./components/Setting";
import Players from "./components/Players";
import Character from "../landingPageSrc/components/character";


const App = () => {
    const roomName = window.location.pathname
    const nickname = localStorage.getItem("TEMP-Name")
    const color = localStorage.getItem("TEMP-Color")
    const eyes = localStorage.getItem("TEMP-Eyes")
    const mouth = localStorage.getItem("TEMP-Mouth")
    localStorage.removeItem("TEMP-Name")
    localStorage.removeItem("TEMP-Color")
    localStorage.removeItem("TEMP-Eyes")
    localStorage.removeItem("TEMP-Mouth")
    return (
        <div className={"body"}>
            <Setting/>
            <Players/>
            <Character color={parseInt(color)} eyes={parseInt(eyes)} mouth={parseInt(mouth)}/>
            <div className={"Hello"}>{nickname}</div>
            {roomName}
        </div>
    )
}


export default App
