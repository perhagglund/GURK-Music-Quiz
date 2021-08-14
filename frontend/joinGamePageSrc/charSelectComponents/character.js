import React from "react";
import CharSelection from "./charSelection";

const Character = (props) => {
    const colorArray = ["#fc0b03", "#03fc90", "#0328fc", "#ff91da"]
    return (
        <div className={"top-character-position"}>
            <div className={"character-container"} >
                <img className={"char basecharacter"} style={{"background-color": colorArray[props.color]}} src="/static/images/baseCharacter.png" alt="baseCharacter img"/>
                <CharSelection src={"/static/images/Eye"} number={props.eyes + 1}/>
                <CharSelection src={"/static/images/Mouth"} number={props.mouth + 1}/>
            </div>
        </div>
    )
}

export default Character