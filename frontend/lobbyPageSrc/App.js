import React from "react";
import Setting from "./components/Setting";
import Players from "./components/Players";


const App = () => {
    const roomName = window.location.pathname
    return (
        <div className={"body"}>
            <Setting />
            <Players />
            {roomName}
            This is the Lobby, hells yeah
        </div>
    )
}


export default App
