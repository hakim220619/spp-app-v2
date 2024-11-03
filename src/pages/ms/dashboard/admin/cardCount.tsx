// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Import
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import CustomChip from 'src/@core/components/mui/chip'

// ** Props Interface
interface CardCountProps {
  title: any
  subtitle: any
  series: { data: number[] }[]
  totalValue: any
  percentage: any
  type: any // Allow all chart types
}

const CardCount: React.FC<CardCountProps> = ({ title, subtitle, series, totalValue, percentage, type }) => {
  // ** Hook
  const theme = useTheme()

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    stroke: { width: 2 },
    tooltip: { enabled: false },
    colors: [hexToRGBA(theme.palette.info.main, 1)],
    markers: {
      size: 3.5,
      strokeWidth: 3,
      strokeColors: 'transparent',
      colors: [theme.palette.info.main],
      discrete: [
        {
          size: 5,
          seriesIndex: 0,
          strokeColor: theme.palette.info.main,
          fillColor: theme.palette.background.paper,
          dataPointIndex: series[0].data.length - 1
        }
      ]
    },
    grid: {
      strokeDashArray: 6,
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: -13,
        left: -4,
        right: 8,
        bottom: 2
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.xl,
        options: {
          chart: { height: 113 }
        }
      },
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          chart: { height: 118 }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          chart: { height: 98 }
        }
      },
      {
        breakpoint: 650,
        options: {
          chart: { height: 118 }
        }
      },
      {
        breakpoint: 430,
        options: {
          chart: { height: 94 }
        }
      },
      {
        breakpoint: 401,
        options: {
          chart: { height: 114 }
        }
      }
    ]
  }

  return (
    <Card>
      <CardContent>
        <Typography
          sx={{
            mb: 1.5,
            fontWeight: 400,
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            display: 'block', // Ensures scroll is within this element
            maxWidth: '100%' // Optional: Sets the max width for a responsive layout
          }}
        >
          {title}
        </Typography>

        <CustomChip
          skin='light'
          size='small'
          label={subtitle}
          color={'success'}
          sx={{ mb: 5.5, height: 20, fontWeight: 500, fontSize: '0.75rem' }}
        />

        <ReactApexcharts type={type} height={93} series={series} options={options} />
        <Box sx={{ gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='h5' sx={{ mr: 1.5 }}>
            {totalValue}
          </Typography>
          <Typography variant='body2' sx={{ color: 'success.main' }}>
            {percentage}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CardCount
