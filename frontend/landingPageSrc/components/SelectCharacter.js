import React, {useState} from "react";
import CharSelection from "./charSelection";
import ArrowButton from "./ArrowButton";


const SelectCharacter = () => {
    const [colorSelect, setColorSelect] = useState(0)
    const [eyesSelect, setEyesSelect] = useState(0)
    const [mouthSelect, setMouthSelect] = useState(0)
    const maxSelection = 3
    const colorArray = ["#fc0b03", "#03fc90", "#0328fc", "#ff91da"]
    const changeColorPlus = () => {
        if (colorSelect < maxSelection) {
            setColorSelect(colorSelect + 1)
        } else {
            setColorSelect(0)
        }
    }
    const changeEyesPlus = () => {
        if (eyesSelect < maxSelection) {
            setEyesSelect(eyesSelect + 1)
        } else {
            setEyesSelect(0)
        }
    }
    const changeMouthPlus = () => {

        if (mouthSelect < maxSelection) {
            setMouthSelect(mouthSelect + 1)
        } else {
            setMouthSelect(0)
        }
    }
    const changeColorMinus = () => {
        if (colorSelect > 0) {
            setColorSelect(colorSelect - 1)
        } else {
            setColorSelect(maxSelection)
        }
    }
    const changeEyesMinus = () => {
        if (eyesSelect > 0) {
            setEyesSelect(eyesSelect - 1)
        } else {
            setEyesSelect(maxSelection)
        }
    }
    const changeMouthMinus = () => {

        if (mouthSelect > 0) {
            setMouthSelect(mouthSelect - 1)
        } else {
            setMouthSelect(maxSelection)
        }
    }
    return (

        <div className={"selectcharacter"}>
            <div className={"arrowbutton-container"}>
                <ArrowButton src={"/static/images/arrow.png"} onClick={changeEyesMinus}/>
                <ArrowButton src={"/static/images/arrow.png"} onClick={changeMouthMinus}/>
                <ArrowButton src={"/static/images/arrow.png"} onClick={changeColorMinus}/>

            </div>
            <div className={"top-character-position"}>
                <div className={"character-container"} >
                    <img className={"char basecharacter"} style={{"background-color": colorArray[colorSelect]}} src="/static/images/baseCharacter.png" alt="baseCharacter img"/>
                    <CharSelection src={"/static/images/Eye"} number={eyesSelect + 1}/>
                    <CharSelection src={"/static/images/Mouth"} number={mouthSelect + 1}/>
                </div>
            </div>
            <div className={"arrowbutton-container"}>
                <ArrowButton src={"/static/images/arrow1.png"} onClick={changeEyesPlus}/>
                <ArrowButton src={"/static/images/arrow1.png"} onClick={changeMouthPlus}/>
                <ArrowButton src={"/static/images/arrow1.png"} onClick={changeColorPlus}/>
            </div>
        </div>
    )
}

export default SelectCharacter