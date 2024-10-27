import { useState, useEffect } from 'react'
import CircularProgress from '@mui/material/CircularProgress'

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
import DashWithRadarChart from './DashWithRadarChart'
import Welcome from './welcome'

interface AllData {
  percent_last_month: number
  percent_this_month: number
  school_id: number
  total_amount: number
  transactions_last_7_days: number[]
}

const AdminDashboard = () => {
  const [data, setData] = useState({
    totalPembayaranBulanan: [],
    totalPembayaranBebas: [],
    totalTunggakanBulanan: [],
    totalTunggakanBebas: [],
    totalPaymentThisDay: [],
    totalPaymentThisWeek: [],
    totalPaymentThisMonth: [],
    totalPaymentThisYears: [],
    totalLoginMmLogs: null
  })
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const data = localStorage.getItem('userData')

      if (!data) {
        router.push('/login')
        
        return
      }

      const parsedData = JSON.parse(data)
      setRole(parsedData.role)

      const storedToken = window.localStorage.getItem('token')
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${storedToken}`
      }
      const params = { school_id: parsedData.school_id }

      try {
        const [
          pembayaranBulanan,
          pembayaranBebas,
          tunggakanBulanan,
          tunggakanBebas,
          paymentThisDay,
          paymentThisWeek,
          paymentThisMonth,
          paymentThisYears,
          loginMmLogs
        ] = await Promise.all([
          axiosConfig.get('/get-total-pembayaran-bulanan', { headers, params }),
          axiosConfig.get('/get-total-pembayaran-bebas', { headers, params }),
          axiosConfig.get('/get-total-tunggakan-bulanan', { headers, params }),
          axiosConfig.get('/get-total-tunggakan-bebas', { headers, params }),
          axiosConfig.get('/get-total-payment-this-day', { headers, params }),
          axiosConfig.get('/get-total-payment-this-week', { headers, params }),
          axiosConfig.get('/get-total-payment-this-month', { headers, params }),
          axiosConfig.get('/get-total-payment-this-years', { headers, params }),
          axiosConfig.get('/get-total-login-mmLogs', { headers, params })
        ])

        setData({
          totalPembayaranBulanan: pembayaranBulanan.data,
          totalPembayaranBebas: pembayaranBebas.data,
          totalTunggakanBulanan: tunggakanBulanan.data,
          totalTunggakanBebas: tunggakanBebas.data,
          totalPaymentThisDay: paymentThisDay.data,
          totalPaymentThisWeek: paymentThisWeek.data,
          totalPaymentThisMonth: paymentThisMonth.data,
          totalPaymentThisYears: paymentThisYears.data,
          totalLoginMmLogs: loginMmLogs.data
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const formatRupiah = (amount: any) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress color='secondary' />
      </div>
    )
  }

  const {
    totalPembayaranBulanan,
    totalPembayaranBebas,
    totalTunggakanBulanan,
    totalTunggakanBebas,
    totalPaymentThisDay,
    totalPaymentThisWeek,
    totalPaymentThisMonth,
    totalPaymentThisYears,
    totalLoginMmLogs
  } = data

  return (
    <ApexChartWrapper>
      <KeenSliderWrapper>
        <Grid container spacing={6} className='match-height'>
          <Grid item xs={12} md={4}>
            <Welcome />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {role === 170 && <SaldoBySchool />}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TotalVisit
              Data={
                Array.isArray(totalLoginMmLogs) && (totalLoginMmLogs as any).length >= 2
                  ? totalLoginMmLogs
                  : [
                      { waktu: 'N/A', total: 0 },
                      { waktu: 'N/A', total: 0 }
                    ] // Fallback data
              }
            />
          </Grid>

          {[
            totalPembayaranBulanan,
            totalPembayaranBebas,
            totalTunggakanBulanan,
            totalTunggakanBebas,
            totalPaymentThisDay,
            totalPaymentThisWeek,
            totalPaymentThisMonth,
            totalPaymentThisYears
          ].map((dataset, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              {dataset.map((item: AllData) => (
                <CardCount
                  key={item.school_id}
                  title={getTitle(index)}
                  subtitle={`${new Date().getFullYear()}`}
                  series={[{ data: item.transactions_last_7_days || [] }]}
                  totalValue={formatRupiah(item.total_amount || 0)}
                  percentage={`${parseFloat((item as any).percent_this_month).toFixed(2)}%`}
                  type={getChartType(index)}
                />
              ))}
            </Grid>
          ))}
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

const getTitle = (index: number) => {
  const titles = [
    'Pembayaran Bulanan',
    'Pembayaran Bebas',
    'Tunggakan Bulanan',
    'Tunggakan Bebas',
    'Pembayaran Hari Ini',
    'Pembayaran Minggu Ini',
    'Pembayaran Bulan Ini',
    'Pembayaran Tahun Ini'
  ]

  return titles[index]
}

const getChartType = (index: number) => {
  const types = ['line', 'bar', 'area', 'line', 'line', 'bubble', 'area', 'bar']

  return types[index]
}

export default AdminDashboard
