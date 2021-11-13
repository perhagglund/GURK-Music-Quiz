import React, {useState} from "react";


const SelectedSongs = (props) => {
    return (
        <div className={"orderedSong-container"}>
            <ol className={"orderedSong"}>
               {props.songs.map(song => (<li key={song.id}>{song.artist}: {song.name}</li>))}
            </ol>
        </div>
    )
}

export default SelectedSongs