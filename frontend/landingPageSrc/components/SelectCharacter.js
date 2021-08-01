import React, {useState} from "react";
import Character from "./character";
import ArrowButton from "./ArrowButton";


const SelectCharacter = (props) => {

    return (

        <div className={"selectcharacter"}>
            <div className={"arrowbutton-container"}>
                <ArrowButton src={"/static/images/arrow.png"} onClick={props.changeEyesMinus}/>
                <ArrowButton src={"/static/images/arrow.png"} onClick={props.changeMouthMinus}/>
                <ArrowButton src={"/static/images/arrow.png"} onClick={props.changeColorMinus}/>
            </div>
            <Character color={props.colorSelect} eyes={props.eyesSelect} mouth={props.mouthSelect}/>
            <div className={"arrowbutton-container"}>
                <ArrowButton src={"/static/images/arrow1.png"} onClick={props.changeEyesPlus}/>
                <ArrowButton src={"/static/images/arrow1.png"} onClick={props.changeMouthPlus}/>
                <ArrowButton src={"/static/images/arrow1.png"} onClick={props.changeColorPlus}/>
            </div>
        </div>
    )
}

export default SelectCharacter