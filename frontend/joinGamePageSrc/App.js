import React, {useEffect, useState} from "react";
import Form from "./charSelectComponents/Form";
import CookieBanner from "./charSelectComponents/CookieBanner";
import {doesRoomExist} from "../lobbyPageSrc/services/fetch";


const App = () => {
    const roomName = window.location.pathname.split("/")[1]
    document.title = "Musikquiz"
    const [showCookieBanner, setShowCookieBanner] = useState('none')
    useEffect(() => {
        if(!localStorage.getItem("cookieAccepted")){
            setShowCookieBanner("")
        }
        doesRoomExist(roomName)
            .then(r => {
                if(!r.data.exists){
                    console.log("Goodbye")
                    window.location.pathname = ""
                    }
            })}, [])
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
                <Form roomName={roomName}/>
            </div>
            <div className={"notcookie-container"} style={cookieBannerStyle}>
                <CookieBanner onClick={changeVisibility} />
            </div>
        </div>
    )
}


export default App
