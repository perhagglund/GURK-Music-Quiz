import React, {useEffect, useState} from "react";
import { gameclient } from "./services/gameWebSocketConnect"
import SongSelector from "./components/SongSelector"
import CookieBanner from "../joinGamePageSrc/charSelectComponents/CookieBanner";

const App = () => {
    const session = sessionStorage.getItem("uniqueID")
    const [gameState, setGameState] = useState("Not Online")
    const [showCookieBanner, setShowCookieBanner] = useState('none')
    useEffect(() => {
        if(!localStorage.getItem("cookieAccepted")){
            setShowCookieBanner("")
        }
    }, [])
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
            console.log(session, gameState)
        } else if (data.ContentType === "Denied") {
            window.location.href = "/"
        }
    }
    const changeVisibility = () => {
        setShowCookieBanner('none')
        localStorage.setItem("cookieAccepted", "true")
    }
    const cookieBannerStyle = {
        "display": showCookieBanner
    }
    return (
        <div className={"body"}>
            <div className={"body-container"}>
                <div className={"main-container"}>
                    <SongSelector />
                </div> 
            </div>
            <div className={"notcookie-container"} style={cookieBannerStyle}>
                <CookieBanner onClick={changeVisibility} />
            </div>
        </div>
    )
}


export default App
