import React from "react";

const ArrowButton = (props) => {
    return (
        <div>
            <img className={"arrowbutton"} src={props.src} onClick={props.onClick}/>
        </div>
    )
}

export default ArrowButton