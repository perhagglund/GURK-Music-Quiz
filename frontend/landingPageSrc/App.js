import React, {useEffect, useState} from "react";
import Form from "./components/Form";
import CookieBanner from "./components/CookieBanner";


const App = () => {
    sessionStorage.clear()
    document.title = "Musikquiz"

    const [showCookieBanner, setShowCookieBanner] = useState('none')
    useEffect(() => {
        if(!localStorage.getItem("cookieAccepted")){
            setShowCookieBanner("")
        }
    }, [])
    const changeVisibility = (event) => {
        event.preventDefault()
        setShowCookieBanner('none')
        localStorage.setItem("cookieAccepted", "true")
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
