import React, {useEffect, useState} from "react";
import { gameclient } from "./services/gameWebSocketConnect"
import SongSelector from "./components/SongSelector"
import CookieBanner from "../joinGamePageSrc/charSelectComponents/CookieBanner";

const App = () => {
    const [songs, setSong] = useState([])
    const session = sessionStorage.getItem("uniqueID")
    const [showCookieBanner, setShowCookieBanner] = useState('none')
    const [players, setPlayers] = useState([])
    const [maxLength, setMaxLength] = useState(0)
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
        }
    }, [])
    const onSongClick = (song) => {
        let exists = false
        if (songs.length < maxLength) {
            if(songs.some(e => e.id == song.id)){
                exists = true
            }
            if(!exists){
                setSong(songs.concat({
                    id: song.id,
                    name: song.title,
                    artist: song.artist,
                    album: song.album,
                    duration: song.duration, 
                }))
            }
        }
    }
    gameclient.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.ContentType === "Accepted") {
            gameclient.send(JSON.stringify({
                "ContentType": "getOnlineStatusGroup"
            }))
            gameclient.send(JSON.stringify({
                "ContentType": "getMaxLength"
                }))
        } else if (data.ContentType === "Denied") {
            window.location.href = "/"
        } else if (data.ContentType === "updatePlayerStatus") {
            setPlayers(data.userList)
        } else if (data.ContentType === "maxSongsLength") {
            setMaxLength(data.maxLength)
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
                    <SongSelector maxLength={maxLength} onSongClick={onSongClick} songs={songs}/>
                </div> 
            </div>
            <div className={"notcookie-container"} style={cookieBannerStyle}>
                <CookieBanner onClick={changeVisibility} />
            </div>
        </div>
    )
}


export default App
