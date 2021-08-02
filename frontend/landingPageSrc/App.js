import React from "react";
import Form from "./components/Form";
import CookieBanner from "./components/CookieBanner";


const App = () => {
    document.title = "Musikquiz"
    return (
        <div className={"body"}>
            <div className={"body-container"}>
                <Form/>
            </div>
            <div className={"notcookie-container"}>
                <CookieBanner/>
            </div>
        </div>
    )
}


export default App
