import React from "react";
import NameField from "./NameField"
import Button from "./Button";
import SelectCharacter from "./SelectCharacter";

const Form = () => {
    const onJoinClick = () => {
        console.log("Join Game Hello")
        window.location.href = "/lobby"
    }
    return (
        <div className={"form"}>
            <NameField />
            <SelectCharacter />
            <div className={"button-container"}>
                <Button classname={"joinbutton"} name={"Join Game"} onClick={onJoinClick}/>
                <Button classname={"createbutton"} name={"Create Game"} onClick={() => console.log("Create Game")}/>
            </div>
        </div>
    )
}

export default Form