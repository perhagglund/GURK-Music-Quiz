import React from "react";
import ChatMessage from "./chatMessage";


const ChatField = (props) => {
    return (
        <div>
            {props.messages.map(message => <ChatMessage user={message.username} message={message.message}/>)}
        </div>
    )
}

export default ChatField