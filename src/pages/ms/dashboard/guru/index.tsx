// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Styled Component Import
import KeenSliderWrapper from 'src/@core/styles/libs/keen-slider'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import AnalyticsCongratulations from 'src/pages/ms/dashboard/siswa/Welcome'
import TabelPaymentMonth from 'src/pages/ms/dashboard/siswa/TabelPaymentMonth'
import axiosConfig from 'src/configs/axiosConfig'
import { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material'
import CardCount from '../admin/cardCount'

interface AllData {
  percent_last_month: any
  percent_this_month: any
  school_id: any
  total_amount: any
  transactions_last_7_days: any[]
}

const SiswaDashboard = () => {
  const [totalTunggakanBulanan, setTotalTunggakanBulanan] = useState<AllData[]>([])
  const [totalTunggakanFree, setTotalTunggakanFree] = useState<AllData[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const data = localStorage.getItem('userData') as any
    const getDataLocal = JSON.parse(data)
    const storedToken = window.localStorage.getItem('token')
    const fetchTotalTunggakanBulananBySiswa = async () => {
      try {
        const response = await axiosConfig.get('/get-total-tunggakan-bulanan-bySiswa', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id,
            user_id: getDataLocal.id
          }
        })

        setTotalTunggakanBulanan(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchTotalTunggakanFreeBySiswa = async () => {
      try {
        const response = await axiosConfig.get('/get-total-tunggakan-free-bySiswa', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id,
            user_id: getDataLocal.id
          }
        })

        setTotalTunggakanFree(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }

    fetchTotalTunggakanBulananBySiswa()
    fetchTotalTunggakanFreeBySiswa()
  }, [])

  const formatRupiah = (amount: any) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0, // No decimal places
      maximumFractionDigits: 0 // No decimal places
    }).format(amount)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress color='secondary' />
      </div>
    ) // Centered loading state with CircularProgress
  }

  return (
    <ApexChartWrapper>
      <KeenSliderWrapper>
        <Grid container spacing={6} className='match-height'>
          <Grid item xs={12} md={12}>
            <AnalyticsCongratulations />
          </Grid>




        </Grid>
      </KeenSliderWrapper>
    </ApexChartWrapper>
  )
}

export default SiswaDashboard
