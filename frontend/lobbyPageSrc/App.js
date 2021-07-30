import React from "react";


const App = () => {
    const roomName = window.location.pathname
    return (
        <div className={"body"}>
            {roomName}
            This is the Lobby, hells yeah
        </div>
    )
}


export default App
