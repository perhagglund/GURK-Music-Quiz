import React from "react";
import Button from "./Button";

const CookieBanner = () => {

    return (
        <div className={"notcookiebanner"}>
            <h3>This website uses cookies. By using this site, you agree to our cookie policy.</h3>
            <Button classname={"cookiebutton"} name={"I do understand."} onClick={() => console.log("hej")}/>
        </div>
    )
}

export default CookieBanner