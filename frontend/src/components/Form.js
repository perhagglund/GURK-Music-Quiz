import React from "react";
import NameField from "./NameField"
import Button from "./Button";
import SelectCharacter from "./SelectCharacter";

const Form = () => {
    return (
        <div>
            <NameField />
            <SelectCharacter />
            <Button name={"Join Game"} onClick={() => console.log("Join Game Hello")}/>
            <Button name={"Create Game"} onClick={() => console.log("Create Game")}/>
        </div>
    )
}

export default Form