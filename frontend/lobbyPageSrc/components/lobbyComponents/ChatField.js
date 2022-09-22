import React from "react";
import ChatMessage from "./chatMessage";


const ChatField = (props) => {
    if(props.messages.length === 0){
        return <div></div>
    }
    return (
        <div>
            {props.messages.map(message => <ChatMessage type={message.type} user={message.sender} message={message.message}/>)}
        </div>
    )
}

export default ChatField