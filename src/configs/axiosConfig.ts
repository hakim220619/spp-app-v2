import axios from 'axios'

const axiosConfig = axios.create({
  // baseURL: `http://192.168.1.75:3000/api`

  baseURL: `https://express-spp-api.sppapp.my.id/api`
})
export default axiosConfig
