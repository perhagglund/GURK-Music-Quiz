import axios from "axios";

const baseURLApi = "http://127.0.0.1:8000/api"

const getEveryRoomName = () => {
    return axios.get(`${baseURLApi}/getEveryRoomName`)
}

export const doesRoomExist = (room_name) => {
    return axios.get(`${baseURLApi}/doesRoomExist/${room_name}`)
}

export const updateRoomPlayers = (room_name) => {
    return axios.get(`${baseURLApi}/updateRoomPlayers/${room_name}`)
}

export default  { getEveryRoomName, doesRoomExist, updateRoomPlayers }