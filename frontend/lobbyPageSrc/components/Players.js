import React, {useEffect, useState} from "react";
import Character from "../../landingPageSrc/components/character";

const Players = (props) => {
    const [playerList, setPlayerList] = useState(props.playerList.map(player =>
        <div>
            <Character color={player.color} eyes={player.eyes} mouth={player.mouth}/>
            <div>{player.name}</div>
        </div>))

    useEffect(() => {
        if(props.playerList.length === 1) {
            setPlayerList(
                <div>
                    <Character
                        color={Number(localStorage.getItem("TEMP-Color"))}
                        eyes={Number(localStorage.getItem("TEMP-Eyes"))}
                        mouth={Number(localStorage.getItem("TEMP-Mouth"))}/>
                    <div>{localStorage.getItem("TEMP-Name")}</div>
                </div>
            )
        } else {
            setPlayerList(props.playerList.map(player =>
                <div>
                    <Character
                        color={player.color}
                        eyes={player.eyes}
                        mouth={player.mouth}/>
                    <div>{player.name}</div>
                </div>))
        }
    })


    return (
        <div className={"players-container"}>
            <h2 className={"playerheader"}>Players</h2>
            {playerList}
        </div>
    )
}


export default Players