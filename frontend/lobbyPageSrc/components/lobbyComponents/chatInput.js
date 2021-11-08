import React from "react";
import Button from "../../../landingPageSrc/components/Button";

const ChatInput = (props) => {
    return (
<<<<<<< Updated upstream
        <div>
            <input placeholder={"Send Message"} onChange={props.handleChange} value={props.value} onKeyPress={props.handleEnterPress}/>
        {/*<Button classname={""} onClick={props.onSubmit} name={"Submit"} disabled={false}/>*/}
=======
        <div className={"chat-input"} >
            <input className={"chat-input-field"} placeholder={"Send Message"} onChange={props.handleChange} value={props.value}/>
            <Button classname={"chat-submit-button"} onClick={props.onSubmit} name={"Submit"}/>
>>>>>>> Stashed changes
        </div>
    )
}

export default ChatInput
