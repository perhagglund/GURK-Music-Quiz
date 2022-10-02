import React, {useEffect, useState} from "react";
import { gameclient } from "./services/gameWebSocketConnect"

const App = () => {
    const roomName = window.location.pathname.split("/")[1]
    const session = sessionStorage.getItem("uniqueID")
    const [users, setUsers] = useState([{"name": "No users yet"}])

    useEffect(() => {
        console.log("useEffect")
        if(session){
            gameclient.onopen = () => {
                gameclient.send(JSON.stringify({
                    "ContentType": "checkID",
                    "id": session
                }))
            }
        } else {
            window.location.href = "/"
        }
    }, []);

    gameclient.onmessage = (e) => {
        console.log("onmessage", e)
        const data = JSON.parse(e.data)
        switch(data.ContentType){
            case "Accepted": {
                gameclient.send(JSON.stringify({
                    "ContentType": "joinRoom",
                }))
            } break;
            case "Denied": {
                window.location.href = "/"
            } break
            case "RoomData": {
                setUsers(data.roomUsers)
                console.log("RoomData", data)
            } break
            default: {
                console.log("Unknown message type")
            }
        }
    }
    
    return (
        <div className={"body"}>
            Hello Worlds!
            <div className="Bajs">{users.map(user => <div className={user.id}>id: {user.uniqueID} nickname: {user.nickname}</div>)}</div>
        </div>
    )
}


export default App
