import React from "react";
import ChatInput from "./chatInput"
import ChatField from "./ChatField";

const Chat = () => {

    return (
        <div>
            <ChatField messages={messages}/>
            <ChatInput />
        </div>
    )
}

export default Chat