import React from "react";

const CharSelection = (props) => {
    return (
        <div>
            <img className={"char"} src={props.src + props.number.toString() + ".png"} alt="pic"/>
        </div>
    )
}

export default CharSelection