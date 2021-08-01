import React from "react";


const Speed = () => {

    return (
        <div className={"speed"}>
            <label className={"speedlabel"} htmlFor="speed">Speed: </label>
            <select className={"speedselector"} name="speed" id="speed">
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
            </select>
        </div>
    )
}


export default Speed