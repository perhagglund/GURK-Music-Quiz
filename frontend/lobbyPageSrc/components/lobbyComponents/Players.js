import React, {useEffect, useState} from "react";
import Character from "../../../landingPageSrc/components/character";

const Players = (props) => {
    if(props.playerList.length === 0){
        return (<div>
            <h2 className={"playerheader"}>Players</h2>
            <div className={"playercharacters"}>
            </div>
        </div>)
    }
    return (
        <div className={"halfTemplateContainer players-container"}>
            <h2 className={"playerheader"}>Players</h2>
            <div className={"playercharacters"}>
                {props.playerList.map(player =>
                    <div className={"character"}>
                        <Character
                            color={player.color}
                            eyes={player.eyes}
                            mouth={player.mouth}/>
                        <div className={"playerNickname"}>{player.nickname}</div>
                    </div>)}
            </div>

        </div>
    )
}


export default Players
