import React, {useState} from "react";
import Button from "../../../landingPageSrc/components/Button";
import Rounds from "./Rounds";
import Reverse from "./Reverse";
import Speed from "./Speed";
import Invitelink from "./Invitelink";


const Settings = () => {

    const [selectRounds, setSelectRounds] = useState(5)
    const [checked, setChecked] = useState(true)
    const [selectSpeed, setSelectSpeed] = useState(1)


    const handleChange = () => {
        setChecked(!checked)

    }


    return (
        <div className={"settings-container"}>
            <h2 className={"roundsheader"}>Rounds: {selectRounds}</h2>
            <div className={"main-settings"}>
                <Rounds selectRounds={selectRounds} setSelectRounds={setSelectRounds}/>
                <Speed selectSpeed={selectSpeed} setSelectSpeed={setSelectSpeed}/>
                <Reverse checked={checked} handleChange={handleChange} />
                <Invitelink />
            </div>
            <Button classname={"startbutton"} name={"Start Game"} onClick={() => console.log("Start Game")} disabled={false}/>
        </div>
    )
}


export default Settings