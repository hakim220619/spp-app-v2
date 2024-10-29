// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'
import { useEffect, useState } from 'react'

import ReactApexcharts from 'src/@core/components/react-apexcharts'
import axiosConfig from 'src/configs/axiosConfig'

const DashWithRadarChart = () => {
  // ** Hook
  const theme = useTheme()
  const [years, setYears] = useState('')

  // ** State for series data
  const [series, setSeries] = useState([
    { name: 'Bulanan', data: [] },
    { name: 'Bebas', data: [] }
  ])
  const data = localStorage.getItem('userData') as any
  const getDataLocal = JSON.parse(data)
  const storedToken = window.localStorage.getItem('token')
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosConfig.get('getCountMonthAndFree', {
          headers: {
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id
          }
        })

        // Parsing data bulanan dan bebas dari string ke array
        const bulananData = JSON.parse(response.data[0].bulanan)
        const bebasData = JSON.parse(response.data[0].bebas)

        // Set data untuk series chart
        setSeries([
          { name: 'Bulanan', data: bulananData },
          { name: 'Bebas', data: bebasData }
        ])
        setYears(response.data[0].years)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, []) // Tambahkan dependencies jika diperlukan

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    colors: [theme.palette.primary.main, theme.palette.info.main],
    plotOptions: {
      radar: {
        size: 110,
        polygons: {
          strokeColors: theme.palette.divider,
          connectorColors: theme.palette.divider
        }
      }
    },
    stroke: { width: 0 },
    fill: {
      opacity: [1, 0.85]
    },
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
    markers: { size: 0 },
    legend: {
      fontSize: '13px',
      fontFamily: theme.typography.fontFamily,
      labels: { colors: theme.palette.text.secondary },
      itemMargin: {
        vertical: 4,
        horizontal: 10
      },
      markers: {
        width: 12,
        height: 12,
        radius: 10,
        offsetY: 1,
        offsetX: theme.direction === 'ltr' ? -4 : 5
      }
    },
    grid: {
      show: false,
      padding: {
        top: 10
      }
    },
    xaxis: {
      labels: {
        show: true,
        style: {
          fontSize: theme.typography.body2.fontSize as string,
          colors: [
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled,
            theme.palette.text.disabled
          ]
        }
      }
    },
    yaxis: { show: false },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          chart: { height: 337 }
        }
      }
    ]
  }

  return (
    <Card>
      <CardHeader title='Pembayaran' subheader={years} />
      <CardContent>
        <ReactApexcharts type='radar' height={357} series={series} options={options} />
      </CardContent>
    </Card>
  )
}

export default DashWithRadarChart
