import React from "react";
import { useState, useEffect } from "react";
import Button from "../../landingPageSrc/components/Button";

const SongSuggestions = (props) => {
    return (
        <div className={"orderedSuggestedSong-container"}>
            <ol className={"orderedSuggestedSong"}>
               {props.songs.map(song => (<li key={song.id}>{song.artist}: {song.title} {song.duration}
               <Button classname={"chooseSongButton"} onClick={()=> props.onSongClick(song)} name={">>"}/></li>))}
            </ol>
        </div>
    )
}

export default SongSuggestions