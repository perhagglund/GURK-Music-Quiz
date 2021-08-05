import axios from "axios";

const baseURLApi = "http://127.0.0.1:8000/api"

const getEveryRoomName = () => {
    return axios.get(baseURLApi + "/getEveryRoomName")
}

const doesRoomExist = (room_name) => {
    console.log(room_name)
    console.log(baseURLApi + "/doesRoomExist/" + room_name)
    return axios.get(baseURLApi + "/doesRoomExist/" + room_name)
}

export default  { getEveryRoomName, doesRoomExist }