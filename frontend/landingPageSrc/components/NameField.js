import React from "react";

const NameField = (props) => {
    return (
        <div className={"namefield"}>
            <h2 className={"nameheader"}>Nickname</h2>
            <input type={"text"} onChange={props.onChange} value={props.value}/>
            {props.error}
        </div>
    )
}

export default NameField