import React from "react";
import { useState, useEffect } from "react";

const SongSuggestions = (props) => {
    
    return (
        <div className={"orderedSuggestedSong-container"}>
            <ol className={"orderedSuggestedSong"}>
               {props.songs.map(song => (<li key={song.id}>{song.artist}: {song.title} {song.duration}</li>))}
            </ol>
        </div>
    )
}

export default SongSuggestions