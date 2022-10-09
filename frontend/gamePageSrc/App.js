import React, {useEffect, useState} from "react";
import Button from "../landingPageSrc/components/Button";
import { gameclient } from "./services/gameWebSocketConnect"

const App = () => {
    const roomName = window.location.pathname.split("/")[1]
    const session = sessionStorage.getItem("uniqueID")
    const [users, setUsers] = useState([{"name": "No users yet"}])
    const [ready, setReady] = useState(false)
    const [gameState, setGameState] = useState("waiting")
    const [countDownTimer, setCountDownTimer] = useState("nope")
    const [roomLeader, setRoomLeader] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [currentSong, setCurrentSong] = useState({})
    const [guessing, setGuessing] = useState(false)
    const [whosGuessing, setWhosGuessing] = useState("")
    const [youGuessed, setYouGuessed] = useState(false)
    const [guess, setGuess] = useState("")
    const [guesses, setGuesses] = useState([])
    const [correctGuess, setCorrectGuess] = useState("")

    useEffect(() => {
        if(session){
            gameclient.onopen = () => {
                gameclient.send(JSON.stringify({
                    "ContentType": "checkID",
                    "id": session
                }))
            }
        } else {
            window.location.href = "/"
        }
    }, []);

    gameclient.onmessage = (e) => {
        const data = JSON.parse(e.data)
        switch(data.ContentType){
            case "Accepted": {
                gameclient.send(JSON.stringify({
                    "ContentType": "joinRoom",
                }))
            } break;
            case "Denied": {
                window.location.href = "/"
            } break
            case "RoomData": {
                setUsers(data.roomUsers)
                console.log("RoomData", data)
            } break
            case "usersOnline": {  
                console.log("usersOnline", data)
                setReady(true)
            } break
            case "youAreLeader": {
                setRoomLeader(true)
            } break
            case "gameStart": {
                setGameState("game")
                setGameStarted(true)
                gameclient.send(JSON.stringify({
                    "ContentType": "getSong"
                }))
            } break
            case "startCountDown": {
                setGameState("countdown")
                setCountDownTimer(5)
            } break
            case "countDown": {
                setCountDownTimer(data.count)
            } break
            case "guessClick": {
                document.getElementById("audio").pause()
                setGuessing(true)
                setWhosGuessing(data.nickname)
                console.log("guessClick", data)
            } break
            case "youGuessed": {
                document.getElementById("audio").pause()
                setYouGuessed(true)
            } break
            case "songData": {
                setCurrentSong(data.song)
                document.getElementById("audio").play()
            } break
            case "guessSubmitCorrectSongName": {
                document.getElementById("audio").pause()
                setGuesses(guesses => [...guesses, {"guess": currentSong, "nickname": data.nickname, "correct": true}])
                setYouGuessed(false)
                setGuessing(false)
                setWhosGuessing("")
            } break
            case "youGuessedCorrectSongName": {
                document.getElementById("audio").pause()
                setGuesses(guesses => [...guesses, {"guess": "guessed: "+currentSong, "nickname": "You", "correct": true}])
                setYouGuessed(false)
                setGuessing(false)
                setWhosGuessing("")
                setCorrectGuess("correct")
            } break
            case "guessSubmitIncorrectSongName": {
                document.getElementById("audio").play()
                setGuesses(guesses => [...guesses, {"guess": data.guess, "nickname": data.nickname, "correct": false}])
                setYouGuessed(false)
                setGuessing(false)
                setWhosGuessing("")
            } break
            case "youGuessedIncorrectSongName": {
                document.getElementById("audio").play()
                setGuesses(guesses => [...guesses, {"guess": data.guess, "nickname": "You", "correct": false}])
                setYouGuessed(false)
                setGuessing(false)
                setWhosGuessing("")
                setCorrectGuess("incorrect")
            } break
            default: {
                console.log("Unknown message type")
            }
        }
    }

    const handleGuessClick = () => {
        console.log("guessClick")
        gameclient.send(JSON.stringify({
            "ContentType": "guessClick",
        }))
    }

    const handleGuess = (e) => {
        setGuess(e.target.value)
    }

    const handleGuessSubmit = () => {
        if (guess.length > 0){
            gameclient.send(JSON.stringify({
                "ContentType": "guessSubmit",
                "guess": guess
            }))
        }
        setGuess("")
    }
      
    if(gameState === "waiting"){
        return (
        <div className="body loading">
            <div class="loader">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <h1>Waiting for other players to join</h1>
        </div>
        )
    } else if(gameState === "countdown"){
        return (
            <div className={"body"}>
                <div className={"countdown"}>
                    <h1>Game starting in</h1>
                    <h1>{countDownTimer}</h1>
                </div>
                Hello Worlds!
                <div className="userList">{users.map(user => <div className={user.id}>id: {user.uniqueID} nickname: {user.nickname}</div>)}</div>
                <div className="gameState">{gameState}</div>
            </div>
    )
    } else if(gameState === "game"){
        return (
            <div className={"body"}>
            {correctGuess}
            {guessing && 
            <div className="loading">
                <div class="loader">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <h1>{whosGuessing} is guessing</h1>
            </div>
            }
            {youGuessed &&
            <div className="guessing">
                <input type="text" placeholder="Guess the song" onChange={handleGuess} value={guess}/>
                <Button name={"Guess"} onClick={handleGuessSubmit} disabled={false} className={"submitButton"}/>
            </div>}
            
                Hello Worlds!
                <div className="userList">{users.map(user => <div className={user.id}>id: {user.uniqueID} nickname: {user.nickname}</div>)}</div>
                <div className="gameState">{gameState}</div>
                {gameStarted && <div className="currentSong"> Playing: {currentSong.title}</div>}
                {gameStarted && <div className="currentSong">Artist: {currentSong.artist}</div>}
                {gameStarted && <audio controls id="audio" src={currentSong.filelocation}></audio>}
                <Button onClick={() => handleGuessClick()} name={"Guess"} classname={"guessButton"} disabled={false}/>
                Guesses:
                <div className="guesses">{guesses.map(guess => <div className="guess">{guess.nickname}: {guess.guess}</div>)}</div>
            </div>
    )
    }}


export default App
