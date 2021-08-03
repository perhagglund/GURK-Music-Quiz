import React, {useState} from "react";
import Form from "./components/Form";
import CookieBanner from "./components/CookieBanner";


const App = () => {
    document.title = "Musikquiz"

    const [showCookieBanner, setShowCookieBanner] = useState('')

    const changeVisibility = () => {
        setShowCookieBanner('none')
    }

    const cookieBannerStyle = {
        "display": showCookieBanner

    }

    return (
        <div className={"body"}>
            <div className={"body-container"}>
                <Form/>
            </div>
            <div className={"notcookie-container"} style={cookieBannerStyle}>
                <CookieBanner onClick={changeVisibility} />
            </div>
        </div>
    )
}


export default App
