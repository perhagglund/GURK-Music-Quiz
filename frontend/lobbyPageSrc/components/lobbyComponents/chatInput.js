import React from "react";
import Button from "../../../landingPageSrc/components/Button";

const ChatInput = (props) => {
    return (
        <div>
            <input placeholder={"Send Message"} onChange={props.handleChange} value={props.value}/>
            <Button classname={""} onClick={props.onSubmit} name={"Submit"}/>
        </div>
    )
}

export default ChatInput