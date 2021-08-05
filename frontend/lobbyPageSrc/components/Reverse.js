import React, {useState} from "react";



const Reverse = (props) => {
    return (
        <div className={"reverse-container"}>
            <label>
                Play songs reversed (recommended):
                <input className={"reverse"} type={"checkbox"}/>
                <div onClick={props.handleChange} className={"checkbox-" + props.checked.toString() + " checkbox"}> </div>
            </label>
        </div>
    )
}
export default Reverse