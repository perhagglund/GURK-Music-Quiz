import React, {useState} from "react";
import CharSelection from "./charSelection";
import Button from "./Button";


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
            <Button name={"Change color"} onClick={changeColor}/>
            <CharSelection name={"color"} number={colorSelect}/>
            <Button name={"Change eyes"} onClick={changeEyes}/>
            <CharSelection name={"eyes"} number={eyesSelect}/>
            <Button name={"Change mouth"} onClick={changeMouth}/>
            <CharSelection name={"mouth"} number={mouthSelect}/>
        </div>
    )
}

export default SelectCharacter