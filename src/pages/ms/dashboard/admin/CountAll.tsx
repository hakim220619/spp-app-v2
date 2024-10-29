// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

import { useState, useEffect } from 'react'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import axiosConfig from 'src/configs/axiosConfig'

interface DataType {
  icon: string
  stats: string
  title: string
  color: ThemeColor
}

const CountAll = () => {
  const dataLocal = localStorage.getItem('userData') as any | null
  const getDataLocal = JSON.parse(dataLocal)

  const [data, setData] = useState<DataType[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = window.localStorage.getItem('token')
        const response = await axiosConfig.get('/getDataMaster', {
          headers: {
            Authorization: `Bearer ${storedToken}`
          },
          params: {
            school_id: getDataLocal.school_id
          }
        })

        setData(response.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const renderStats = () => {
    return data.map((sale: DataType, index: number) => (
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={index}>
        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
          <CustomAvatar skin='light' color={sale.color} sx={{ mr: 4, width: 42, height: 42 }}>
            <Icon icon={sale.icon} fontSize='1.5rem' />
          </CustomAvatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{sale.stats}</Typography>
            <Typography variant='body2'>{sale.title}</Typography>
          </Box>
        </Box>
      </Grid>
    ))
  }

  const getCurrentDate = () => {
    const today = new Date()

    return today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <Card>
      <CardHeader
        title='Master Data'
        sx={{ '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' } }}
        action={
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            {getCurrentDate()}
          </Typography>
        }
      />
      <CardContent
        sx={{ pt: theme => `${theme.spacing(7)} !important`, pb: theme => `${theme.spacing(7.5)} !important` }}
      >
        <Grid container spacing={10}>
          {renderStats()}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CountAll
