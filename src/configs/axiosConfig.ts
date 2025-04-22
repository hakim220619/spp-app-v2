import axios from 'axios'

const axiosConfig = axios.create({
  baseURL: `http://192.168.137.75:3001/api`
  // baseURL: `https://express-spp-api.sppapp.my.id/api`
})
export default axiosConfig
