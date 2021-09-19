import React, {useEffect, useState} from "react";
import NameField from "./NameField"
import Button from "./Button";
import SelectCharacter from "./SelectCharacter";
import fetch from "../../lobbyPageSrc/services/fetch";
import {useHistory, useLocation} from "react-router-dom";

const Form = () => {
    const [nickname, setNickname] = useState("")
    const [colorSelect, setColorSelect] = useState(0)
    const [eyesSelect, setEyesSelect] = useState(0)
    const [mouthSelect, setMouthSelect] = useState(0)

    useEffect(() => {
        if(localStorage.getItem("Name")){
            setNickname(localStorage.getItem("Name"))
        }
        if(localStorage.getItem("Color")){
            setColorSelect(parseInt(localStorage.getItem("Color")))
        }
        if(localStorage.getItem("Eyes")){
            setColorSelect(parseInt(localStorage.getItem("Eyes")))
        }
        if(localStorage.getItem("Mouth")){
            setColorSelect(parseInt(localStorage.getItem("Mouth")))
        }
    }, [])

    const maxSelection = 3

    const [errorMessage, setErrorMessage] = useState("")

    const makeID = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        let exists;
        fetch.doesRoomExist(result).then(r => {
            exists = r.data
        })
        return {
            "result": result,
            "exists": exists
        }
    }

    const makeUniqueID = (length) => {
        let id = makeID(length)
        if(id.exists){
            while(id.exists) {
                id = makeID(length)
            }
        }
        return id.result
    }
    const onNickChange = (event) => {
        setNickname(event.target.value)
        setErrorMessage("")
    }

    const onCreateClick = () => {
        if (nickname.length === 0){
            setErrorMessage("Please write in a username")
        } else {
            localStorage.setItem("Name", nickname.toString())
            sessionStorage.setItem("Name", nickname.toString())
            localStorage.setItem("Eyes", eyesSelect.toString())
            sessionStorage.setItem("Eyes", eyesSelect.toString())
            localStorage.setItem("Mouth", mouthSelect.toString())
            sessionStorage.setItem("Mouth", mouthSelect.toString())
            localStorage.setItem("Color", colorSelect.toString())
            sessionStorage.setItem("Color", colorSelect.toString())
            sessionStorage.setItem("Leader", "true")
            window.location.href = "/" + makeUniqueID(8) + "/"
        }
    }

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
        <div className={"form"}>
            <NameField onChange={onNickChange} value={nickname} error={errorMessage}/>
            <SelectCharacter changeEyesMinus={changeEyesMinus}
                             changeMouthMinus={changeMouthMinus}
                             changeColorMinus={changeColorMinus}
                             colorSelect={colorSelect}
                             eyesSelect={eyesSelect}
                             mouthSelect={mouthSelect}
                             changeEyesPlus={changeEyesPlus}
                             changeMouthPlus={changeMouthPlus}
                             changeColorPlus={changeColorPlus}
            />
            <div className={"button-container"}>
                <Button classname={"joinbutton"} name={"Join Game"} onClick={() => {console.log("per INTE bög")}} disabled={true}/>
                <Button classname={"createbutton"} name={"Create Game"} onClick={onCreateClick} disabled={false}/>
            </div>
        </div>
    )
}

export default Form