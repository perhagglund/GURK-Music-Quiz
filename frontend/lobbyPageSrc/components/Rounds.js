import React from "react";


const Rounds = () => {

    return (
        <div className={"rounds"}>
            <label className={"roundsheader"} htmlFor="rounds">Rounds: </label>
            <select className={"roundsselector"} name="rounds" id="rounds">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>
        </div>
    )
}


export default Rounds