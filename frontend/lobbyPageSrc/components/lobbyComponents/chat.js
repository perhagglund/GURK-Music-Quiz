import React, {useState} from "react";
import ChatInput from "./chatInput"
import ChatField from "./ChatField";

const Chat = (props) => {

    return (
        <div className={"halfTemplateContainer chat-container"}>
            <div className={"inner-chat-container"}>
                <div className={"chatfield"}>
                    <ChatField messages={props.messages}/>
            </div>
        </div>
        <ChatInput handleChange={props.handleMessageChange} value={props.inputValue} handleEnterPress={props.handleEnterPress}/>
        </div>
    )
}

export default Chat
