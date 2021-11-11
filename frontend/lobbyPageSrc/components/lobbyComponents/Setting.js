import React, {useState} from "react";
import Button from "../../../landingPageSrc/components/Button";
import Rounds from "./Rounds";
import Reverse from "./Reverse";
import Speed from "./Speed";
import Invitelink from "./Invitelink";


const Settings = (props) => {
    return (
        <div className={"templateContainer"}>
            <h2 className={"roundsheader"}>Rounds: {props.selectRounds}</h2>
            <div className={"main-settings"}>
                <Rounds selectRounds={props.selectRounds} handleSelectChange={props.handleSelectChange}/>
                <Speed selectSpeed={props.selectSpeed} handleSpeedChange={props.handleSpeedChange}/>
                <Reverse checked={props.checked} handleChange={props.handleCheckboxChange} />
                <Invitelink />
            </div>
            <Button classname={"startbutton"} name={"Start Game"} onClick={props.handleStartGame} disabled={sessionStorage.getItem("Leader") !== "true"}/>
        </div>
    )
}


export default Settings