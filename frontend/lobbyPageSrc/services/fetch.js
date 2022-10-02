import axios from "axios";

let baseURLApi = "http://192.168.1.197:8000/api"

const getEveryRoomName = () => {
    if (window.location.host == "127.0.0.1:8000"){
        baseURLApi = "http://127.0.0.1:8000/api"
    }
    return axios.get(`${baseURLApi}/getEveryRoomName`)
}

export const doesRoomExist = (room_name) => {
    if (window.location.host == "127.0.0.1:8000"){
        baseURLApi = "http://127.0.0.1:8000/api"
    }
    return axios.get(`${baseURLApi}/doesRoomExist/${room_name}`)
}

export const updateRoomPlayers = (room_name) => {
    if (window.location.host == "127.0.0.1:8000"){
        baseURLApi = "http://127.0.0.1:8000/api"
    }
    return axios.get(`${baseURLApi}/updateRoomPlayers/${room_name}`)
}

export const isRoomInGame = (room_name) => {
    if (window.location.host == "127.0.0.1:8000"){
        baseURLApi = "http://127.0.0.1:8000/api"
    }
    return axios.get(`${baseURLApi}/isRoomInGame/${room_name}`)
}

export default  { getEveryRoomName, doesRoomExist, updateRoomPlayers, isRoomInGame }