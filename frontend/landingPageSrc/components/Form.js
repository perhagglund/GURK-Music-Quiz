import React from "react";
import NameField from "./NameField"
import Button from "./Button";
import SelectCharacter from "./SelectCharacter";

const Form = () => {
    const makeID = (length) => {
        let result           = '';
        const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
    const onCreateClick = () => {
        console.log("Join Game Hello")
        window.location.href = "/" + makeID(8)
    }
    return (
        <div className={"form"}>
            <NameField />
            <SelectCharacter />
            <div className={"button-container"}>
                <Button classname={"joinbutton"} name={"Join Game"} onClick={() => console.log("Join game")}/>
                <Button classname={"createbutton"} name={"Create Game"} onClick={onCreateClick}/>
            </div>
        </div>
    )
}

export default Form