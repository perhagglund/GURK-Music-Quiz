import React, {useEffect, useState} from "react";
import { gameclient } from "./services/gameWebSocketConnect"
import SongSelector from "./components/SongSelector"
import CookieBanner from "../joinGamePageSrc/charSelectComponents/CookieBanner";
import Button from "../landingPageSrc/components/Button";

const App = () => {
    const [songs, setSong] = useState([])
    const session = sessionStorage.getItem("uniqueID")
    const [showCookieBanner, setShowCookieBanner] = useState('none')
    const [players, setPlayers] = useState([])
    const [maxLength, setMaxLength] = useState(0)
    const [gameState, setGameState] = useState("Not in game")
    const [errorMsg, setErrorMsg] = useState("")
    const [ready, setReady] = useState(false)
    const [readyText, setReadyText] = useState("Not Ready")
    const [loadingPercent, setLoadingPercent] = useState(0)
    const [downloadedSongs, setDownloadedSongs] = useState([])
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
                gameclient.send(JSON.stringify({
                    "ContentType": "addSong",
                    "song": song
                }))
            }
        }
    }
    gameclient.onmessage = (e) => {
        const data = JSON.parse(e.data)
        switch(data.ContentType){
            case "Accepted": {
                gameclient.send(JSON.stringify({
                    "ContentType": "getOnlineStatusGroup"
                }))
                gameclient.send(JSON.stringify({
                    "ContentType": "getMaxLength"
                    }))
            } break;
            case "Denied": {
                window.location.href = "/"
            } break
            case "updatePlayerStatus": {
                setPlayers(data.userList)
            } break
            case "maxSongsLength": {
                setMaxLength(data.maxLength)
            } break
            case "addSong": {
                const song = data.song
                setSong(songs.concat({
                    id: song.id,
                    name: song.title,
                    artist: song.artist,
                    album: song.album,
                    duration: song.duration, 
                }))
            } break
            case "removeSong": {
                const song = data.song
                setSong(songs.filter(e => e.id !== song.id))
            } break
            case "updateSongs": {
                setPlayers(data.userList)
            } break
            case "startGameGroup": {
                console.log("In game")
                console.log(data.songList)
                setDownloadedSongs(data.songList)
                playAudio(data.songList)
                setGameState("In game")
            } break
            case "startGameDenied": {
                setErrorMsg("Could not start game: " + data.reason)
            } break
            case "loadingGame": {
                setGameState("Loading game")
            } break
            case "setLeader": {
                console.log("leader")
            } break
            case "changeReady": {
                setReady(data.ready)
                setReadyText(data.ready ? "Ready" : "Not Ready")
            } break
            case "changeReadyDenied": {
                setErrorMsg("Could not ready: " + data.reason)
            } break
            case "updateLoadingPercent": {
                setLoadingPercent(data.loadingPercent)
                setGameState("Loading game: " + data.loadingPercent + "%")
            } break
            case "downloadFailed": {
                setErrorMsg("Could not download songs: " + data.reason)
            } break
            case "downloadCompleted": {
                setGameState("In game")
            } break
            default:
                console.error("Unknown message type") 
                
        }
    }
    const changeVisibility = () => {
        setShowCookieBanner('none')
        localStorage.setItem("cookieAccepted", "true")
    }
    const cookieBannerStyle = {
        "display": showCookieBanner
    }

    const removeSong = (song) => {
        gameclient.send(JSON.stringify({
            "ContentType": "removeSong",
            "song": song
        }))
    }

    const handleStartGame = () => {
        gameclient.send(JSON.stringify({
            "ContentType": "startGame"
        }))
    }

    const handleReady = () => {
        gameclient.send(JSON.stringify({
            "ContentType": "changeReady"
        }))
    }

    const playAudio = (songList) => {
        songList.forEach(song => {
            console.log("Playing song: " + song.song_id)
            const audio = new Audio(song.filename)
            audio.play() 
        });
    }

    return (
        <div className={"body"}>
            <div className={"body-container"}>
                <div className={"main-container"}>
                    <SongSelector maxLength={maxLength} onSongClick={onSongClick} songs={songs} removeSong={removeSong}/>
                    <Button className={"startGame"} onClick={handleStartGame} disabled={false} name={"Start Game"}/>
                    <Button className={"readyButton"} onClick={handleReady} disabled={false} name={readyText}/>
                </div> 
            </div>
            {players.map(player => <div>id:{player.uniqueID} name:{player.nickname} online:{String(player.online)} chosenSongs: {player.chosenSongs} ready: {String(player.ready)}</div>)}
            <div>{gameState}</div> 
            <div>{errorMsg}</div>
            <div className={"notcookie-container"} style={cookieBannerStyle}>
                <CookieBanner onClick={changeVisibility} />
            </div>
            {downloadedSongs.map(song => <div>{song.filename} {song.randomId} {song.song_id}</div>)}
            <audio controls>
                <source src="" type="audio/mpeg"/>
            </audio>
        </div>
    )
}


export default App
