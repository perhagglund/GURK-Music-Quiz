import React from "react";

const Invitelink = () => {

    const inviteLink = window.location.host + window.location.pathname + "joinGame"

    return (
        <div className={"invitelink"}>
            <p>Invitation link: <span className={"link"}
              onClick={() => {navigator.clipboard.writeText(inviteLink)}}>
                {inviteLink}</span></p>
        </div>
    )
}

export default Invitelink