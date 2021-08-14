import React from "react";
import Button from "./Button";

const CookieBanner = (props) => {

    return (
        <div className={"notcookiebanner"}>
            <h3>This website uses cookies. By using this site, you agree to our cookie policy.</h3>
            <Button classname={"cookiebutton"} name={"Close"} onClick={props.onClick}/>
        </div>
    )
}

export default CookieBanner