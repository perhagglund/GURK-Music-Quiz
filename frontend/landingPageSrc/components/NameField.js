import React from "react";

const NameField = (props) => {
    return (
        <div className={"namefield"}>
            <div className={"logo-container"}>
                <img className={"logo"} src={"/static/images/image-placeholder.png"} alt=""/>
            </div>
            <input type={"text"} placeholder={"nickname"} onChange={props.onChange} value={props.value}/>
            {props.error}
        </div>
    )
}

export default NameField