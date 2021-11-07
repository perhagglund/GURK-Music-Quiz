import React from "react";
import Button from "../../../landingPageSrc/components/Button";

const ChatInput = (props) => {
    return (
        <div>
            <input placeholder={"Send Message"} onChange={props.handleChange} value={props.value} onKeyPress={props.handleEnterPress}/>
        {/*<Button classname={""} onClick={props.onSubmit} name={"Submit"} disabled={false}/>*/}
        </div>
    )
}

export default ChatInput