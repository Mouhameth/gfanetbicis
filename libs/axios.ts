import axios from "axios"

const BASE_URL = "https://sgsn-360633557660.us-central1.run.app/remote/v1/api";

export default axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"}
});

export const axiosAuth = axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"}
});