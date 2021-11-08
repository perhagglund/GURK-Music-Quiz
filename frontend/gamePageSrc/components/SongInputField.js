import React from "react";

const SongInputField = () => {

    return (
        <div className={"songInputField"}>
            <input type={"text"} placeholder={"placeholder-text"} onChange={() => console.log("hej")} value={"dsa"}/>
        </div>
    )
}

export default SongInputField;