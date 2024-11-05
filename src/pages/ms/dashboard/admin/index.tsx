import { useState, useEffect } from 'react'
import CircularProgress from '@mui/material/CircularProgress' // Import CircularProgress

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Styled Component Import
import KeenSliderWrapper from 'src/@core/styles/libs/keen-slider'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports

import SaldoBySchool from 'src/pages/ms/dashboard/admin/saldoByschool'
import ActivityTimeLine from 'src/pages/ms/dashboard/admin/ActivityTimeline'
import axiosConfig from 'src/configs/axiosConfig'
import { useRouter } from 'next/router'
import TotalVisit from 'src/pages/ms/dashboard/admin/TotalVisits'
import CardCount from './cardCount'
import DashWithRadarChart from './RadarMonthFree'
import Welcome from './welcome'
import CountAll from './CountAll'

interface AllData {
  percent_last_month: any
  percent_this_month: any
  school_id: any
  total_amount: any
  transactions_last_7_days: any[]
}
const AdminDashboard = () => {
  const [totalPembayaranBulanan, setTotalPembayaranBulanan] = useState<AllData[]>([])
  const [totalPembayaranBebas, setTotalPembayaranBebas] = useState<AllData[]>([])
  const [totalTunggakanBulanan, setTotalTunggakanBulanan] = useState<AllData[]>([])
  const [totalTunggakanBebas, setTotalTunggakanBebas] = useState<AllData[]>([])
  const [totalPaymentThisDay, setTotalPaymentThisDay] = useState<AllData[]>([])
  const [totalPaymentThisWeek, setTotalPaymentThisWeek] = useState<AllData[]>([])
  const [totalPaymentThisMonth, setTotalPaymentThisMonth] = useState<AllData[]>([])
  const [totalPaymentThisYears, setTotalPaymentThisYears] = useState<AllData[]>([])
  const [totalLoginMmLogs, setTotalLoginMmLogs] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const data = localStorage.getItem('userData') as string | null

    if (!data) {
      // Handle the case where there's no userData, e.g., redirect to login
      router.push('/login') // Assuming you want to redirect if no user data is found

      return // Ensure no further execution if redirecting
    }

    const getDataLocal = JSON.parse(data)

    const storedToken = window.localStorage.getItem('token')
    const fetchTotalPembayaranBulanan = async () => {
      try {
        const response = await axiosConfig.get('/get-total-pembayaran-bulanan', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        setTotalPembayaranBulanan(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchTotalPembayaranBebas = async () => {
      try {
        const response = await axiosConfig.get('/get-total-pembayaran-bebas', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        setTotalPembayaranBebas(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchTotalTunggakanBulanan = async () => {
      try {
        const response = await axiosConfig.get('/get-total-tunggakan-bulanan', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
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
    const fetchTotalTunggakanBebas = async () => {
      try {
        const response = await axiosConfig.get('/get-total-tunggakan-bebas', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        // const total: any = response.data.total_payment - response.data.amount

        setTotalTunggakanBebas(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchTotalPaymentThisDay = async () => {
      try {
        const response = await axiosConfig.get('/get-total-payment-this-day', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        setTotalPaymentThisDay(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchTotalPaymentThisWeek = async () => {
      try {
        const response = await axiosConfig.get('/get-total-payment-this-week', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        setTotalPaymentThisWeek(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchTotalPaymentThisMonth = async () => {
      try {
        const response = await axiosConfig.get('/get-total-payment-this-month', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        setTotalPaymentThisMonth(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchTotalPaymentThisYears = async () => {
      try {
        const response = await axiosConfig.get('/get-total-payment-this-years', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        setTotalPaymentThisYears(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchTotalLoginMmLogs = async () => {
      try {
        const response = await axiosConfig.get('/get-total-login-mmLogs', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        setTotalLoginMmLogs(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }

    fetchTotalPembayaranBulanan()
    fetchTotalPembayaranBebas()
    fetchTotalTunggakanBulanan()
    fetchTotalTunggakanBebas()
    fetchTotalPaymentThisDay()
    fetchTotalPaymentThisWeek()
    fetchTotalPaymentThisMonth()
    fetchTotalPaymentThisYears()
    fetchTotalLoginMmLogs()
  }, [router])

  // Function to format number to Rupiah without decimal
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
          <Grid item xs={12} md={4}>
            <Welcome />
          </Grid>
          <Grid item xs={12} md={8}>
            <CountAll />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SaldoBySchool />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TotalVisit Data={totalLoginMmLogs} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {totalPembayaranBulanan.map((item: any) => (
              <CardCount
                key={item.school_id}
                title='Pembayaran Bulanan'
                subtitle={`${new Date().getFullYear()}`}
                series={[{ data: item.transactions_last_7_days ? JSON.parse(item.transactions_last_7_days) : [] }]}
                totalValue={formatRupiah(item.total_amount || 0)} // Ganti null dengan 0 jika null
                percentage={parseFloat(item.percent_this_month).toFixed(2) + `%`}
                type={'area'}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {totalPembayaranBebas.map((item: any) => (
              <CardCount
                key={item.school_id}
                title='Pembayaran Bebas'
                subtitle={`${new Date().getFullYear()}`}
                series={[{ data: item.transactions_last_7_days ? JSON.parse(item.transactions_last_7_days) : [] }]}
                totalValue={formatRupiah(item.total_amount || 0)} // Ganti null dengan 0 jika null
                percentage={parseFloat(item.percent_this_month).toFixed(2) + `%`}
                type={'bar'}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {totalTunggakanBulanan.map((item: any) => (
              <CardCount
                key={item.school_id}
                title='Tunggakan Bulanan'
                subtitle={`${new Date().getFullYear()}`}
                series={[{ data: item.transactions_last_7_days ? JSON.parse(item.transactions_last_7_days) : [] }]}
                totalValue={formatRupiah(item.total_amount || 0)} // Ganti null dengan 0 jika null
                percentage={parseFloat(item.percent_this_month).toFixed(2) + `%`}
                type={'area'}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {totalTunggakanBebas.map((item: any) => (
              <CardCount
                key={item.school_id}
                title='Tunggakan Bebas'
                subtitle={`${new Date().getFullYear()}`}
                series={[{ data: item.transactions_last_7_days ? JSON.parse(item.transactions_last_7_days) : [] }]}
                totalValue={formatRupiah(item.total_payment - item.amount || 0)} // Ganti null dengan 0 jika null
                percentage={parseFloat(item.percent_this_month).toFixed(2) + `%`}
                type={'bar'}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {totalPaymentThisDay.map((item: any) => (
              <CardCount
                key={item.school_id}
                title='Pembayaran Hari Ini'
                subtitle={`${new Date().getFullYear()}`}
                series={[{ data: item.transactions_last_7_days ? JSON.parse(item.transactions_last_7_days) : [] }]}
                totalValue={formatRupiah(item.total_payment + item.amount || 0)} // Ganti null dengan 0 jika null
                percentage={parseFloat(item.percent_this_month).toFixed(2) + `%`}
                type={'area'}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {totalPaymentThisWeek.map((item: any) => (
              <CardCount
                key={item.school_id}
                title='Pembayaran Minggu Ini'
                subtitle={`${new Date().getFullYear()}`}
                series={[{ data: item.transactions_last_7_days ? JSON.parse(item.transactions_last_7_days) : [] }]}
                totalValue={formatRupiah(item.total_payment + item.amount || 0)} // Ganti null dengan 0 jika null
                percentage={parseFloat(item.percent_this_month).toFixed(2) + `%`}
                type={'area'}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {totalPaymentThisMonth.map((item: any) => (
              <CardCount
                key={item.school_id}
                title='Pembayaran Bulan Ini'
                subtitle={`${new Date().getFullYear()}`}
                series={[{ data: item.transactions_last_7_days ? JSON.parse(item.transactions_last_7_days) : [] }]}
                totalValue={formatRupiah(item.total_payment + item.amount || 0)} // Ganti null dengan 0 jika null
                percentage={parseFloat(item.percent_this_month).toFixed(2) + `%`}
                type={'area'}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {totalPaymentThisYears.map((item: any) => (
              <CardCount
                key={item.school_id}
                title='Pembayaran Tahun Ini'
                subtitle={`${new Date().getFullYear()}`}
                series={[{ data: item.transactions_last_7_days ? JSON.parse(item.transactions_last_7_days) : [] }]}
                totalValue={formatRupiah(item.total_payment + item.amount || 0)} // Ganti null dengan 0 jika null
                percentage={parseFloat(item.percent_this_month).toFixed(2) + `%`}
                type={'area'}
              />
            ))}
          </Grid>

          {/* <Grid item xs={12} sm={6} md={3}>
            <RevenueGrowth />
          </Grid> */}
          <Grid item xs={12} md={3}></Grid>
          <Grid item xs={12} md={3}></Grid>
          <Grid item xs={12} md={6}>
            <DashWithRadarChart />
          </Grid>
          <Grid item xs={12} md={6}>
            <ActivityTimeLine />
          </Grid>
        </Grid>
      </KeenSliderWrapper>
    </ApexChartWrapper>
  )
}

export default AdminDashboard
