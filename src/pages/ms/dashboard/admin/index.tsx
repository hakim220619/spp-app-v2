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
import CardStatsVertical from './cardstatic'

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
  const [totalPembayaranOnline, settotalPembayaranOnline] = useState<AllData[]>([])
  const [totalPembayaranManual, settotalPembayaranManual] = useState<AllData[]>([])
  const [aplikasiData, setAplikasi] = useState<any>('')
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
    const fetchTotalPembayaranOnline = async () => {
      try {
        const response = await axiosConfig.get('/get-total-pembayaran-online', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        settotalPembayaranOnline(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchTotalPembayaranManual = async () => {
      try {
        const response = await axiosConfig.get('/get-total-pembayaran-manual', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        settotalPembayaranManual(response.data)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    const fetchGetAplikasi = async () => {
      try {
        const response = await axiosConfig.get('/getAplikasiBySchool', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id // Send the school_id as a query parameter
          }
        })

        setAplikasi(response.data.typeDashboard)
      } catch (error) {
        console.error('Error fetching total pembayaran:', error)

        // toast.error('Failed to fetch data. Please try again later.') // Use toast.error here
      } finally {
        setLoading(false)
      }
    }
    fetchGetAplikasi()
    fetchTotalPembayaranBulanan()
    fetchTotalPembayaranBebas()
    fetchTotalTunggakanBulanan()
    fetchTotalTunggakanBebas()
    fetchTotalPaymentThisDay()
    fetchTotalPaymentThisWeek()
    fetchTotalPaymentThisMonth()
    fetchTotalPaymentThisYears()
    fetchTotalLoginMmLogs()
    fetchTotalPembayaranOnline()
    fetchTotalPembayaranManual()
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

  type ThemeColor = 'primary' | 'success' | 'warning' | 'info' | 'error' | 'secondary'

  const getThemeColor = (colorKey: string): ThemeColor => {
    switch (colorKey) {
      case 'primary':
      case 'success':
      case 'warning':
      case 'info':
      case 'error':
      case 'secondary':
        return colorKey as ThemeColor
      default:
        return 'primary' // Default ke 'primary' jika tidak cocok
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress color='secondary' />
      </div>
    ) // Centered loading state with CircularProgress
  }

  return (
    <>
      {aplikasiData === 1 ? (
        <>
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

                {[
                  { data: totalPembayaranBulanan, title: 'Pembayaran Bulanan', type: 'area' },
                  { data: totalPembayaranBebas, title: 'Pembayaran Bebas', type: 'bar' },
                  { data: totalTunggakanBulanan, title: 'Tunggakan Bulanan', type: 'area' },
                  { data: totalTunggakanBebas, title: 'Tunggakan Bebas', type: 'bar' },
                  { data: totalPembayaranOnline, title: 'Pembayaran Online', type: 'bar' },
                  { data: totalPembayaranManual, title: 'Pembayaran Manual', type: 'bar' },
                  { data: totalPaymentThisDay, title: 'Pembayaran Hari Ini', type: 'area' },
                  { data: totalPaymentThisWeek, title: 'Pembayaran Minggu Ini', type: 'area' },
                  { data: totalPaymentThisMonth, title: 'Pembayaran Bulan Ini', type: 'area' },
                  { data: totalPaymentThisYears, title: 'Pembayaran Tahun Ini', type: 'area' }
                ].map(category =>
                  category.data.map((item: any) => (
                    <Grid item xs={12} sm={6} md={3} key={item.school_id}>
                      <CardCount
                        title={category.title}
                        subtitle={`${new Date().getFullYear()}`}
                        series={[
                          {
                            data: item.transactions_last_7_days ? JSON.parse(item.transactions_last_7_days) : []
                          }
                        ]}
                        totalValue={formatRupiah(item.total_payment || item.amount || 0)}
                        percentage={`${parseFloat(item.percent_this_month).toFixed(2)}%`}
                        type={category.type}
                      />
                    </Grid>
                  ))
                )}
                <Grid item xs={12} md={6}>
                  <DashWithRadarChart />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ActivityTimeLine />
                </Grid>
              </Grid>
            </KeenSliderWrapper>
          </ApexChartWrapper>
        </>
      ) : (
        <ApexChartWrapper>
          <KeenSliderWrapper>
            <Grid container spacing={6} className='match-height'>
              <Grid item xs={12} md={4}>
                <Welcome />
              </Grid>
              <Grid item xs={12} md={8}>
                <CountAll />
              </Grid>

              {[
                {
                  data: totalPembayaranBulanan,
                  title: 'Pembayaran Bulanan',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'primary' // Warna 1
                },
                {
                  data: totalPembayaranBebas,
                  title: 'Pembayaran Bebas',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'success' // Warna 2
                },
                {
                  data: totalTunggakanBulanan,
                  title: 'Tunggakan Bulanan',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'warning' // Warna 3
                },
                {
                  data: totalTunggakanBebas,
                  title: 'Tunggakan Bebas',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'info' // Warna 4
                },

                {
                  data: totalPaymentThisDay,
                  title: 'Pembayaran Hari Ini',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'primary' // Warna 1
                },
                {
                  data: totalPaymentThisWeek,
                  title: 'Pembayaran Minggu Ini',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'success' // Warna 2
                },
                {
                  data: totalPaymentThisMonth,
                  title: 'Pembayaran Bulan Ini',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'warning' // Warna 3
                },
                {
                  data: totalPaymentThisYears,
                  title: 'Pembayaran Tahun Ini',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'info' // Warna 4
                },
                {
                  data: totalPembayaranOnline,
                  title: 'Pembayaran Online',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'secondary' // Warna 5
                },
                {
                  data: totalPembayaranManual,
                  title: 'Pembayaran Manual',
                  avatarIcon: 'tabler:currency-dollar',
                  avatarColor: 'error' // Warna 6
                }
              ].map(category =>
                category.data.map((item: any) => (
                  <Grid item xs={12} sm={6} md={3} key={item.school_id}>
                    <CardStatsVertical
                      key={item.school_id}
                      stats={formatRupiah(item.total_amount || item.total_payment || item.amount || 0)}
                      chipText={`${parseFloat(item.percent_this_month).toFixed(2)}%`}
                      chipColor='success'
                      avatarColor={getThemeColor(category.avatarColor)}
                      title={category.title}
                      subtitle=''
                      avatarIcon={category.avatarIcon}
                    />
                  </Grid>
                ))
              )}

              <Grid item xs={12} sm={6} md={3}>
                <SaldoBySchool />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TotalVisit Data={totalLoginMmLogs} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}></Grid>
              <Grid item xs={12} sm={6} md={3}></Grid>
              {/* <Grid item xs={12} md={6}>
                <DashWithRadarChart />
              </Grid> */}
              <Grid item xs={12} md={12}>
                <ActivityTimeLine />
              </Grid>
            </Grid>
          </KeenSliderWrapper>
        </ApexChartWrapper>
      )}
    </>
  )
}

export default AdminDashboard
