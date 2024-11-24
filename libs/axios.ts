import axios from "axios"

const BASE_URL = "http://localhost:8080/remote/v1/api";

export default axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"}
});

export const axiosAuth = axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"}
});