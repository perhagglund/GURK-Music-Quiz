import React, {useEffect, useState} from "react";
import { gameclient } from "./services/gameWebSocketConnect"
import SongSelector from "./components/SongSelector"
import CookieBanner from "../joinGamePageSrc/charSelectComponents/CookieBanner";

const App = () => {
    const [song, setSong] = useState([])
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
    const onSongClick = () => {
        if (song.length < maxLength) {
            setSong(song.concat({
                id: Number(song.length + 1),
                name: 'song ' + Number(song.length + 1),
                artist: 'artist ' + Number(song.length + 1),
                album: 'album ' + Number(song.length + 1),
                duration: '3:00', 
        }))
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
                    <SongSelector maxLength={maxLength} onSongClick={onSongClick} songs={song}/>
                    {players.map((player) => <div>name: {player.nickname} online: {String(player.online)} id: {player.uniqueID}{"\n"}</div>)}
                </div> 
            </div>
            <div className={"notcookie-container"} style={cookieBannerStyle}>
                <CookieBanner onClick={changeVisibility} />
            </div>
        </div>
    )
}


export default App
