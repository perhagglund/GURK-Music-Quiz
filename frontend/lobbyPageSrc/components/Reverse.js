import React from "react";


const Reverse = () => {
    const [checked, setChecked] = React.useState(true)

    const handleChange = () => {
        setChecked(!checked)
    }

    return (
        <div className={"reverse"}>
            <label>
                <input type="checkbox"
                checked={checked}
                onChange={handleChange}
                />
                Play songs reversed (recommended)
            </label>
        </div>
    )
}


export default Reverse