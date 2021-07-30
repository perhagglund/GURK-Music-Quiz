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
            <div className={"top-character-position"}>
                <div className={"character-container"} >
                    <img className={"char basecharacter"} style={{"background-color": colorArray[colorSelect]}} src="/static/images/baseCharacter.png" alt="baseCharacter img"/>
                    <CharSelection src={"/static/images/Eye"} number={eyesSelect + 1}/>
                    <CharSelection src={"/static/images/Mouth"} number={mouthSelect + 1}/>
                </div>
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