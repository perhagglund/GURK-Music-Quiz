import React, {useState, useEffect} from "react";

const SongInputField = (props) => {

    return (
        <div className={"songInputField"}>
            <input type={"text"} placeholder={"placeholder-text"} onChange={props.onNameChange} value={props.songName}/>
        </div>
    )
}

export default SongInputField;