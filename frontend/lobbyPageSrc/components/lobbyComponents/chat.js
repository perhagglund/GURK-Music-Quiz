import React, {useState} from "react";
import ChatInput from "./chatInput"
import ChatField from "./ChatField";

const Chat = (props) => {

    return (
<<<<<<< Updated upstream
        <div className={"chat-container"}>
            <ChatField messages={props.messages}/>
            <ChatInput handleChange={props.handleMessageChange} value={props.inputValue} handleEnterPress={props.handleEnterPress}/>
=======
        <div className={"halfTemplateContainer chat-container"}>
            <div className={"inner-chat-container"}>
                <div className={"chatfield"}>
                    <ChatField messages={props.messages}/>
            </div>
        </div>
            <ChatInput handleChange={props.handleMessageChange} value={props.inputValue} onSubmit={props.onChatSubmit}/>
>>>>>>> Stashed changes
        </div>
    )
}

export default Chat
