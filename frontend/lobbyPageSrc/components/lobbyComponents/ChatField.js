import React from "react";
import ChatMessage from "./chatMessage";


const ChatField = (props) => {
    return (
        <div>
            {props.messages.map(message => <ChatMessage type={message.type} user={message.username} message={message.message}/>)}
        </div>
    )
}

export default ChatField