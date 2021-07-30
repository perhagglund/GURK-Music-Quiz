import React from "react";
import Setting from "./components/Setting";
import Players from "./components/Players";


const App = () => {
    const roomName = window.location.pathname
    return (
        <div className={"body"}>
            <Setting />
            <Players />
        </div>
    )
}


export default App
