import React from "react";
import Button from "../../landingPageSrc/components/Button";
import Rounds from "./Rounds";
import Reverse from "./Reverse";
import Speed from "./Speed";


const Settings = () => {

    return (
        <div className={"settings-container"}>
            <Rounds />
            <Reverse />
            <Speed />
            <Button classname={"startbutton"} name={"Start Game"} onClick={() => console.log("Start Game")} />
        </div>
    )
}


export default Settings