import React from "react";

const ChatMessage = (props) => {
    return (
        <div className={props.type}>
            {props.user}: {props.message}
        </div>
    )
}

export default ChatMessage