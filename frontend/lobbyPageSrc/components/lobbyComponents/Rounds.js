import React, { useState } from 'react'

const Rounds = (props) => {
    return (
        <div className={"rounds-container"}>
            <label htmlFor="rounds">Number of rounds: </label>
            <select onChange={props.handleSelectChange} className={"rounds"} id={"rounds"} value={props.selectRounds} disabled={sessionStorage.getItem("Leader") !== "true"}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5} selected>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
            </select>
        </div>
    )
}


export default Rounds