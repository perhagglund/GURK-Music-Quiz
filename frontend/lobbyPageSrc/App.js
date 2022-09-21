import React, {useEffect, useState} from "react";
import Players from "./components/lobbyComponents/Players";
import Chat from "./components/lobbyComponents/chat";
import { client } from "./services/webSocketConnect";
import fetch from "./services/fetch"
import CookieBanner from "../landingPageSrc/components/CookieBanner";
import Settings from "./components/lobbyComponents/Setting";


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
    const [nickname, setNickname] = useState(sessionStorage.getItem("Name"))
    const eyes = sessionStorage.getItem("Eyes")
    const mouth = sessionStorage.getItem("Mouth")
    const color = sessionStorage.getItem("Color")
    const [playerList, setPlayerList] = useState([])
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [checked, setChecked] = useState(true)
    const [selectSpeed, setSelectSpeed] = useState(1)
    const [selectRounds, setSelectRounds] = useState(5)
    const onMessageChange = (event) => {
        setNewMessage(event.target.value)
    }

    const handleEnterPress = (event) => {
        if(event.key === "Enter" || event.key === "NumpadEnter"){
            sendMessage()
        }
    }

    const sendMessage = () => {
            if(newMessage.length > 0){
                client.send(JSON.stringify({
                    "ContentType": "chatMessage",
                    "message": newMessage,
                    "sender": nickname
                }))
            setNewMessage("")
        }
    }
    useEffect(() => {
        client.onopen = () => {
            if(sessionStorage.getItem("uniqueID")){
                client.send(JSON.stringify({
                    "ContentType": "checkID",
                    "id": sessionStorage.getItem("uniqueID")
                }))
            }
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
                client.send(JSON.stringify({
                    "ContentType": "ImNewPlayer"
                }))
            }
        }
        if(!sessionStorage.getItem("Leader")){
            window.location.pathname = roomName + "/joinGame"
        }
    }, [])
    useEffect(() => {
        client.onmessage = (e) => {
            const data = JSON.parse(e.data)
            switch(data.ContentType){
                case "NewLeader":{
                    sessionStorage.setItem("Leader", "true")
                } break
                case "updatePlayers": {
                    fetch.updateRoomPlayers(roomName).then(r => {
                        let players = []
                        r.data.data.forEach(player => {
                            players = players.concat({
                                "id": players.length,
                                "nickname": player.nickname,
                                "color": player.color,
                                "mouth": player.mouth,
                                "eyes": player.eyes,
                                "leader": player.leader,
                                "chosenSongs": player.chosenSongs,
                            })
                        })
                        setPlayerList(players)
                        if(data.content === "playerJoined"){
                            setMessages(messages => [...messages, {
                                "type": "joinMessage",
                                "username": data.player,
                                "message": "Has joined the server",
                                "time": "HeteroTime"
                            }])
                        } else if(data.content === "playerLeave") {
                            setMessages(messages => [...messages, {
                                "type": "leaveMessage",
                                "username": data.player,
                                "message": "Has left the server",
                                "time": "HeteroTime"
                            }])
                        }
                    })
                } break
                case "chatMessage": {
                    setMessages(messages =>[...messages, {
                        "type": "chatMessage",
                        "username": data.player,
                        "message": data.message,
                        "time": "geytime"
                    }])
                } break
                case "newName":{
                    setNickname(data.NewName)
                } break
                case "checkboxChange": {
                    setChecked(checked => !checked)
                } break
                case "updateAttributes": {
                    setChecked(data.reverse)
                    setSelectSpeed(Number(data.speed))
                    setSelectRounds(Number(data.rounds))
                } break
                case "selectRoundsChange": {
                    setSelectRounds(data.rounds)
                } break
                case "speedChange": {
                    setSelectSpeed(data.speed)
                } break
                case "startGameUser": {
                    sessionStorage.setItem("uniqueID", data.id)
                    window.location.pathname = roomName + "/game"
                } break
                case "checkIDResponse":{
                    if(data.gameState){
                        if(data.idExists){
                            sessionStorage.setItem("uniqueID", data.id)
                            window.location.pathname = roomName + "/game"
                        }
                    } else {
                        window.location.pathname = "/"
                    }
                } break
                default:
                    console.error("Unknown message type")
                    
                }

        }
        client.onclose = () => {
            sessionStorage.clear()
        }
    }, [])

    const handleCheckboxChange = () => {
        if(sessionStorage.getItem("Leader") === "true"){
            client.send(JSON.stringify({
                "ContentType": "checkboxChange",
                "checkbox": !checked
            }))
        }
    }
    const handleSelectChange = (e) => {
        if(sessionStorage.getItem("Leader") === "true"){
            client.send(JSON.stringify({
                "ContentType": "selectRoundsChange",
                "rounds": e.target.value
            }))
        }
    }
    const handleSpeedChange = (e) => {
        if(sessionStorage.getItem("Leader") === "true"){
            client.send(JSON.stringify({
                "ContentType": "speedChange",
                "speed": e.target.value
            }))
        }
    }
    const handleStartGame = () => {
        if (sessionStorage.getItem("Leader") === "true"){
            client.send(JSON.stringify({
                "ContentType": "startGame"
            }))
        }
    }

    return (
        <div className={"body"}>
            <div className={"body-container"}>
                <div className={"main-container"}>
                    <Settings checked={checked}
                             client={client}
                             handleCheckboxChange={handleCheckboxChange}
                             selectSpeed={selectSpeed}
                             selectRounds={selectRounds}
                             handleSelectChange={handleSelectChange}
                             handleSpeedChange={handleSpeedChange}
                             handleStartGame={handleStartGame}
                    />
                    <div className={"side-container"}>
                        <Players playerList={playerList}/>
                        <Chat messages={messages} 
                              handleMessageChange={onMessageChange} 
                              inputValue={newMessage} 
                              handleEnterPress={handleEnterPress}
                        />
                    </div>
                </div>
            </div>
            <div className={"notcookie-container"} style={cookieBannerStyle}>
                <CookieBanner onClick={changeVisibility} />
            </div>
        </div>
    )
}

export default App
