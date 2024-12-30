import axios from 'axios'

const axiosConfig = axios.create({
  baseURL: `http://192.168.1.79:3001/api`

  // baseURL: `https://express-spp-api.sppapp.my.id/api`
})
export default axiosConfig
