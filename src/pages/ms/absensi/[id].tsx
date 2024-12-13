import { ChangeEvent, forwardRef, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import toast from 'react-hot-toast'

// Axios Import
import axiosConfig from '../../../configs/axiosConfig'
import { useRouter } from 'next/router'
import Link from 'next/link'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'

import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import dayjs from 'dayjs'

interface CustomInputProps {
  value: DateType
  label: string
  onChange: (event: ChangeEvent) => void
}

const CustomInput = forwardRef(({ ...props }: CustomInputProps, ref) => {
  return <CustomTextField fullWidth inputRef={ref} {...props} sx={{ width: '100%' }} />
})
const statusColorMap: { [key: string]: string } = {
  Present: '#28a745', // Green
  Absent: '#dc3545', // Red
  Late: '#fd7e14', // Orange
  Excused: '#007bff', // Blue
  Sick: '#6f42c1', // Purple
  Permission: '#ffc107', // Yellow
  Alpha: '#6c757d', // Grey
  Leave: '#e83e8c', // Pink
  'Out of Office': '#795548', // Brown
  Holiday: '#ffd700', // Gold
  'Early Leave': '#00bcd4' // Light Blue
}

const statusTranslations: { [key: string]: string } = {
  Present: 'Hadir',
  Absent: 'Tidak Hadir',
  Late: 'Terlambat',
  Excused: 'Izin',
  Sick: 'Sakit',
  Permission: 'Cuti',
  Alpha: 'Alpha',
  Leave: 'Cuti',
  'Out of Office': 'Luar Kantor',
  Holiday: 'Libur',
  'Early Leave': 'Pulang Cepat'
}

const FormValidationSchema = () => {
  const { handleSubmit, control, setValue } = useForm()
  const router = useRouter()
  const { id } = router.query
  const storedToken = window.localStorage.getItem('token')
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id
  const [status, setStatus] = useState<'ON' | 'OFF'>('ON')
  const [created_at, setCreatedAt] = useState<Date | null>(null)

  // Fetch class details
  useEffect(() => {
    if (storedToken && id) {
      axiosConfig
        .post(
          '/detailAbsensi',
          { id },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { created_at, status } = response.data
          setCreatedAt(dayjs(created_at).toDate())
          setStatus(status)

          // Set default values for react-hook-form
          setValue('created_at', dayjs(created_at).toDate())
          setValue('status', status)
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }
  }, [id, storedToken, setValue])

  const onSubmit = (data: any) => {
    const formData = {
      id,
      school_id: schoolId,
      created_at: data.created_at ? dayjs(data.created_at).toISOString() : null,
      status: data.status
    }
    console.log(formData)

    if (storedToken) {
      axiosConfig
        .post(
          '/update-absensi',
          { data: formData },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(() => {
          toast.success('Successfully Updated!')
          router.push('/ms/absensi')
        })
        .catch(() => {
          toast.error("Failed. This didn't work.")
        })
    }
  }

  return (
    <Card>
      <CardHeader title='Update Absensi' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Name Field */}
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='created_at'
                control={control}
                rules={{ required: 'Start time is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={created_at} // Use the Date object directly
                      onChange={(date: Date | null) => {
                        setCreatedAt(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy HH:mm'
                      dateFormat='dd/MM/yyyy HH:mm'
                      showTimeSelect
                      timeIntervals={15}
                      customInput={
                        <CustomInput
                          value={created_at ? (dayjs(created_at).format('dd/MM/yyyy HH:mm:ss') as any) : ''}
                          onChange={onChange}
                          label='Tanggal & Jam Absensi'
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            {/* Status Dropdown */}
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='status'
                control={control}
                defaultValue={status}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Status' // Label translated to Indonesian
                    {...field} // Pass all the necessary props from react-hook-form
                  >
                    {Object.entries(statusColorMap).map(([statusName]) => (
                      <MenuItem key={statusName} value={statusName}>
                        {statusTranslations[statusName]} {/* Display translated status */}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Save
              </Button>
              <Box m={1} display='inline'></Box>
              <Link href='/ms/absensi/' passHref>
                <Button type='button' variant='contained' color='secondary'>
                  Back
                </Button>
              </Link>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationSchema
