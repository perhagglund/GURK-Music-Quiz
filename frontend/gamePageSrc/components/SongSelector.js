import React, {useState} from "react";
import SongInputField from "./SongInputField";
import Button from "../../landingPageSrc/components/Button";
import SelectedSongs from "./SelectedSongs";


const SongSelector = () => {

    const [song, setSong] = useState([{
        id: 1,
        name: 'song1',
        artist: 'artist1',
        album: 'album1',
        duration: '3:00',
    },
    {
        id: 2,
        name: 'song2',
        artist: 'artist2',
        album: 'album2',
        duration: '3:00',
    },
    {
        id: 3,
        name: 'song3',
        artist: 'artist3',
        album: 'album3',
        duration: '3:00',
    },
    {
        id: 4,
        name: 'song4',
        artist: 'artist4',
        album: 'album4',
        duration: '3:00',
    }])

    const OnClick = () => {
        if (song.length < 5) {
            setSong(song.concat({
                id: Number(song.length + 1),
                name: 'song' + Number(song.length + 1),
                artist: 'artist' + Number(song.length + 1),
                album: 'album' + Number(song.length + 1),
                duration: '3:00', 
        }))
        }
    }
    return (
        <div className={"templateContainer"}>
            <div className={"chooseSong-container"}>
                <h1 className={"chooseSongsHeader"}>Choose your songs</h1>
                <h2>Song <span className={"inlineColor-red"}>1</span> of 3</h2>
                <SongInputField/>
                <Button classname={"chooseSongButton"} onClick={OnClick} name={">>"}/>
                </div>
                <div className={"selectedSongs-container"}>
                    <div className={"selectedSongs"}>
                        <SelectedSongs songs={song}/>
                    </div>
            </div>
        </div>
    )
}

export default SongSelector