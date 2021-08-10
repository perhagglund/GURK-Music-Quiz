import React from "react";

const Invitelink = () => {

    return (
        <div className={"invitelink"}>
            <p>Invitation link: <span className={"link"} onClick={() => {navigator.clipboard.writeText(window.location.host + window.location.pathname)}}>{window.location.host + window.location.pathname}</span></p>
        </div>
    )
}

export default Invitelink