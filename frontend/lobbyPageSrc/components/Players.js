import React from "react";
import Character from "../../landingPageSrc/components/character";

const Players = (props) => {

    return (
        <div className={"players-container"}>
            <h2 className={"playerheader"}>Players</h2>
            {props.playerList.map(player =>
                <div>
                    <Character color={player.color} eyes={player.eyes} mouth={player.mouth}/>
                    <div>{player.name}</div>
                </div>)}
        </div>
    )
}


export default Players