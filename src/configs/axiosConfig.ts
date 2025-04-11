import axios from 'axios'

const axiosConfig = axios.create({
  baseURL: `http://192.168.88.121:3001/api`
  // baseURL: `https://express-spp-api.sppapp.my.id/api`
})
export default axiosConfig
