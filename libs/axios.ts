import axios from "axios"

const BASE_URL = "https://qmappremoteapi-7f7prtiosa-ue.a.run.app/remote/v1/api";

export default axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"}
});

export const axiosAuth = axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"}
});