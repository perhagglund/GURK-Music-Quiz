import React, {useEffect, useState} from "react";
import Setting from "./components/lobbyComponents/Setting";
import Players from "./components/lobbyComponents/Players";
import Chat from "./components/lobbyComponents/chat";
import { client } from "./services/webSocketConnect";
import fetch from "./services/fetch"
import CookieBanner from "../landingPageSrc/components/CookieBanner";


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

    const roomName = window.location.pathname.split("/")[1]
    if(!sessionStorage.getItem("Leader")){
        window.location.pathname = roomName + "/joinGame"
    }
    const nickname = sessionStorage.getItem("Name")
    const eyes = sessionStorage.getItem("Eyes")
    const mouth = sessionStorage.getItem("Mouth")
    const color = sessionStorage.getItem("Color")
    const [playerList, setPlayerList] = useState([])
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const onMessageChange = (event) => {
        setNewMessage(event.target.value)
        console.log(newMessage)
    }
    const onChatSubmit = (event) => {
        event.preventDefault()
        client.send(JSON.stringify({
            "ContentType": "chatMessage",
            "message": newMessage,
            "sender": nickname
        }))
    }
    useEffect(() => {
        client.onopen = () => {
            if (sessionStorage.getItem("Leader") === "true") {
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
    useEffect(() => {
        client.onmessage = (e) => {
            const data = JSON.parse(e.data)
            console.log("Hej")
            if (data.ContentType === "NewLeader") {
                sessionStorage.setItem("Leader", "true")
                console.log("LeaderLeft")
            } else if(data.ContentType === "updatePlayers"){
                fetch.updateRoomPlayers(roomName).then(r => {
                    let players = []
                    r.data.data.forEach(player => {
                        players = players.concat({
                            "id": players.length,
                            "nickname": player.nickname,
                            "color": player.color,
                            "mouth": player.mouth,
                            "eyes": player.eyes,
                            "leader": player.leader
                        })
                    })
                    setPlayerList(players)
                    console.log(data.content)
                    if(data.content === "playerJoined"){
                        setMessages(messages.concat(
                            {
                                "type": "joinMessage",
                                "username": data.player,
                                "message": "Has joined the server",
                                "time": "HeteroTime"
                            }
                        ))
                    } else if(data.content === "playerLeave") {
                        setMessages(messages.concat({
                            "type": "leaveMessage",
                            "username": data.player,
                            "message": "Has left the server",
                            "time": "HeteroTime"
                        }))
                    }
                    console.log(messages)
                })
            } else if(data.ContentType === "chatMessage"){
                setMessages(messages.concat({
                    "type": "chatMessage",
                    "username": data.player,
                    "message": data.message,
                    "time": "geytime"
                }))
            }
        }
        client.onclose = () => {
            sessionStorage.clear()
        }
    })
    return (
        <div className={"body"}>
            <div className={"body-container"}>
                <div className={"main-container"}>
                    <Chat messages={messages} handleMessageChange={onMessageChange} inputValue={newMessage} onChatSubmit={onChatSubmit}/>
                    <Setting/>
                    <Players playerList={playerList}/>
                </div>
            </div>
            <div className={"notcookie-container"} style={cookieBannerStyle}>
                <CookieBanner onClick={changeVisibility} />
            </div>
        </div>
    )
}


export default App
