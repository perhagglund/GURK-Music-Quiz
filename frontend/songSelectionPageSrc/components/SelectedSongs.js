import React, {useState} from "react";
import Button from "../../landingPageSrc/components/Button";


const SelectedSongs = (props) => {
    return (
        <div className={"orderedSong-container"}>
            <ol className={"orderedSong"}>
               {props.songs.map(song => (<li key={song.id}>{song.artist}: {song.name} <Button className={"removeSong"} onClick={() => props.removeSong(song)} disabled={false} name={"x"}/></li>))}
            </ol>
        </div>
    )
}

export default SelectedSongs