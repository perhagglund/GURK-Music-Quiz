import React, {useState} from "react";
import SongInputField from "./SongInputField";
import Button from "../../landingPageSrc/components/Button";


const SongSelector = () => {

    const [song, setSong] = useState([])

    const OnClick = () => {
        setSong(value)
    }

    return (
        <div className={"templateContainer"}>
            <h1 className={"chooseSongsHeader"}>Choose your songs</h1>
            <h2>Song <span className={"inlineColor-red"}>1</span> of 3</h2>
            <SongInputField/>
            <Button classname={"chooseSongButton"} onClick={OnClick} name={">>"}/>
        </div>
    )
}

export default SongSelector