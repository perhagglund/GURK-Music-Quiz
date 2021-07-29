import React, {useState} from "react";
import CharSelection from "./charSelection";
import Button from "./Button";
import ArrowButton from "./ArrowButton";


const SelectCharacter = () => {
    const [colorSelect, setColorSelect] = useState(0)
    const [eyesSelect, setEyesSelect] = useState(0)
    const [mouthSelect, setMouthSelect] = useState(0)
    const maxSelection = 3
    const changeColor = () => {
        console.log("color changed")
        console.log(colorSelect)
        if (colorSelect < maxSelection) {
            setColorSelect(colorSelect + 1)
        } else {
            setColorSelect(0)
        }
        console.log(colorSelect)
    }
    const changeEyes = () => {
        if (eyesSelect < maxSelection) {
            setEyesSelect(eyesSelect + 1)
        } else {
            setEyesSelect(0)
        }
    }
    const changeMouth = () => {

        if (mouthSelect < maxSelection) {
            setMouthSelect(mouthSelect + 1)
        } else {
            setMouthSelect(0)
        }
    }
    return (
        <div className={"selectcharacter"}>
            <div className={"arrowbutton-container"}>
                <ArrowButton src={"/static/images/arrow.png"} onClick={changeEyes}/>
                <ArrowButton src={"/static/images/arrow.png"} onClick={changeMouth}/>
                <ArrowButton src={"/static/images/arrow.png"} onClick={changeColor}/>
            </div>
            <div className={"character-container"}>
                <img className={"basecharacter"} src="/static/images/baseCharacter.png" alt="baseCharacter img"/>
                <CharSelection number={eyesSelect}/>
                {/*<CharSelection name={"mouth"} number={mouthSelect}/>
                <CharSelection name={"color"} number={colorSelect}/>*/}
            </div>
            <div className={"arrowbutton-container"}>
                <ArrowButton src={"/static/images/arrow1.png"} onClick={changeEyes}/>
                <ArrowButton src={"/static/images/arrow1.png"} onClick={changeMouth}/>
                <ArrowButton src={"/static/images/arrow1.png"} onClick={changeColor}/>
            </div>
        </div>
    )
}

export default SelectCharacter