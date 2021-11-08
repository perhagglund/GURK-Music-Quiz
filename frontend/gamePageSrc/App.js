import React, {useEffect, useState} from "react";
<<<<<<< Updated upstream
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
=======
import Players from "../lobbyPageSrc/components/lobbyComponents/Players";
import CookieBanner from "../landingPageSrc/components/CookieBanner";
import SongSelector from "./components/SongSelector";

const App = () => {

    const [showCookieBanner, setShowCookieBanner] = useState('none')
    useEffect(() => {
        if(!localStorage.getItem("cookieAccepted")){
            setShowCookieBanner("")
        }
    }, [])
    const changeVisibility = (event) => {
        event.preventDefault()
        setShowCookieBanner('none')
        localStorage.setItem("cookieAccepted", "true")
    }
    const cookieBannerStyle = {
        "display": showCookieBanner
    }
    const playerList = [{
        "nickname": "Doniel",
        "eyes": 2,
        "mouth": 1,
        "color": 0
    },
        {
            "nickname": "Per",
            "eyes": 1,
            "mouth": 0,
            "color": 2
        },
        {
            "nickname": "Adam(Alfred)",
            "eyes": 1,
            "mouth": 3,
            "color": 2
        }]
    return (
        <div>
            <div className={"body"}>
                <div className={"body-container"}>
                    <div className={"main-container"}>
                        <SongSelector/>
                        <Players playerList={playerList}/>
                    </div>
                </div>
                <div className={"notcookie-container"} style={cookieBannerStyle}>
                    <CookieBanner onClick={changeVisibility} />
                </div>
            </div>
>>>>>>> Stashed changes
        </div>
    )
}


export default App
