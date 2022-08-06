import React, {useState} from "react";
import ChatInput from "./chatInput"
import ChatField from "./ChatField";

const Chat = (props) => {

    return (
        <div className={"chat-container"}>
            <ChatField messages={props.messages}/>
            <ChatInput handleChange={props.handleMessageChange} value={props.inputValue} onSubmit={props.onChatSubmit}/>
        </div>
    )
}

export default Chat