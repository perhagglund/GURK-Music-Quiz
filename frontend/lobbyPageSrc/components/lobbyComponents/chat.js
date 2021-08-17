import React from "react";
import ChatInput from "./chatInput"
import ChatField from "./ChatField";

const Chat = (props) => {

    return (
        <div>
            <ChatField messages={props.messages}/>
            <ChatInput />
        </div>
    )
}

export default Chat