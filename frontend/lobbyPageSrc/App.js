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
            } else if(data.ContentType === "newName"){
                setNickname(data.NewName)
                console.log(nickname)
            } else if(data.ContentType === "checkboxChange"){
                setChecked(!checked)
            } else if(data.ContentType === "updateAttributes"){
                setChecked(data.reverse)
                setSelectSpeed(Number(data.speed))
                setSelectRounds(Number(data.rounds))
            } else if(data.ContentType === "selectRoundsChange"){
                setSelectRounds(data.rounds)
            } else if(data.ContentType === "speedChange"){
                setSelectSpeed(data.speed)
            } else if(data.ContentType === "startGameUser"){
                sessionStorage.setItem("uniqueID", data.id)
                console.log(data.id, sessionStorage.getItem("uniqueID"), "startGameUser")
                window.location.pathname = roomName + "/game"
            }
        }
        client.onclose = () => {
            sessionStorage.clear()
        }
    })
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
            console.log(newMessage)
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
<<<<<<< Updated upstream
                    <Chat   messages={messages}
                            handleMessageChange={onMessageChange}
                            inputValue={newMessage}
                            handleEnterPress={handleEnterPress}
                    />
                    <Setting checked={checked}
                             client={client}
                             handleCheckboxChange={handleCheckboxChange}
                             selectSpeed={selectSpeed}
                             selectRounds={selectRounds}
                             handleSelectChange={handleSelectChange}
                             handleSpeedChange={handleSpeedChange}
                             handleStartGame={handleStartGame}
                    />
                    <Players playerList={playerList}/>
=======
                    <Setting/>
                        <div className={"side-container"}>
                            <Players playerList={playerList}/>
                            <Chat messages={messages} handleMessageChange={onMessageChange} inputValue={newMessage} onChatSubmit={onChatSubmit}/>
                        </div>
>>>>>>> Stashed changes
                </div>
            </div>
            <div className={"notcookie-container"} style={cookieBannerStyle}>
                <CookieBanner onClick={changeVisibility} />
            </div>
        </div>
    )
}


export default App
