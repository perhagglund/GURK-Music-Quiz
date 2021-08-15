import React from "react";

const ChatMessage = (props) => {
    return (
        <div>
            {props.user}: {props.message}
        </div>
    )
}

export default ChatMessage