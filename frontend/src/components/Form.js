import React from "react";
import NameField from "./NameField"
import Button from "./Button";
import SelectCharacter from "./SelectCharacter";

const Form = () => {
    return (
        <div className={"form"}>
            <NameField />
            <SelectCharacter />
            <div className={"button-container"}>
                <Button classname={"joinbutton"} name={"Join Game"} onClick={() => console.log("Join Game Hello")}/>
                <Button classname={"createbutton"} name={"Create Game"} onClick={() => console.log("Create Game")}/>
            </div>
        </div>
    )
}

export default Form