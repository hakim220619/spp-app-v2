import axios from 'axios'

const axiosConfig = axios.create({
  // baseURL: `http://192.168.88.108:3088/api`
  baseURL: `https://express-spp-api.sppapp.my.id/api`
})
export default axiosConfig
