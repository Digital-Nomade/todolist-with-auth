import axios from 'axios';

const fetcher = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  }
})

export { fetcher };
