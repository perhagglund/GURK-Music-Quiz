import React, {useState} from "react";

const Invitelink = () => {

    const inviteLink = window.location.host + window.location.pathname + "joinGame"
    const [copyConfirmation, setCopyConfirmation] = useState("")

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink)
        setCopyConfirmation("Link copied!")
    }

    return (
        <div className={"invitelink"}>
            <p>Invitation link: <br/> <span className={"link inlineColor-red"}
               onClick={copyLink}>
               {inviteLink}</span></p>
            <div className={"copyconfirmation"}>
                {copyConfirmation}
            </div>
        </div>
    )
}

export default Invitelink