import axios from "axios";
const baseURL = 'https://mighty-wildwood-39449.herokuapp.com'
const API = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS'
  }
});

export default API