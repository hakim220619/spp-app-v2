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
import axiosConfig from '../../../../configs/axiosConfig'
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

const FormValidationSchema = () => {
  const { handleSubmit, control, setValue } = useForm()
  const router = useRouter()
  const { id } = router.query
  const storedToken = window.localStorage.getItem('token')
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  const [holiday_name, setHolidayName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [holiday_date_start, setHolidayDateStart] = useState<Date | null>(null)
  const [holiday_date_end, setHolidayDateEnd] = useState<Date | null>(null)
  const [status, setStatus] = useState<'ON' | 'OFF'>('ON')
  console.log(description)

  // Fetch class details
  useEffect(() => {
    if (storedToken && id) {
      axiosConfig
        .post(
          '/detailHoliday',
          { id },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { holiday_name, holiday_date_start, holiday_date_end, description, status } = response.data
          setHolidayName(holiday_name)
          setHolidayDateStart(holiday_date_start)
          setHolidayDateEnd(holiday_date_end)
          setDescription(description)
          setStatus(status)

          // Set default values for react-hook-form
          setValue('holiday_name', holiday_name)
          setValue('holiday_date_start', dayjs(holiday_date_start).toDate())
          setValue('holiday_date_end', dayjs(holiday_date_end).toDate())
          setValue('description', description)
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
      holiday_name: data.holiday_name.toUpperCase(),
      holiday_date_start: dayjs(data.holiday_date_start).format('YYYY-MM-DD'),
      holiday_date_end: dayjs(data.holiday_date_end).format('YYYY-MM-DD'),
      description: data.description.toUpperCase(),
      status: data.status
    }

    if (storedToken) {
      axiosConfig
        .post(
          '/update-holiday',
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
          router.push('/ms/absensi/hariLibur')
        })
        .catch(() => {
          toast.error("Failed. This didn't work.")
        })
    }
  }

  return (
    <Card>
      <CardHeader title='Update Hari Libur' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Name Field */}
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='holiday_name'
                control={control}
                defaultValue={holiday_name}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Nama Kegiatan'
                    placeholder='Name'
                    {...field} // Pass all the necessary props from react-hook-form
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='status'
                control={control}
                defaultValue={status}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Status'
                    {...field} // Pass all the necessary props from react-hook-form
                  >
                    <MenuItem value='ON'>ON</MenuItem>
                    <MenuItem value='OFF'>OFF</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='holiday_date_start'
                control={control}
                rules={{ required: 'Tanggal is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={holiday_date_start ? dayjs(holiday_date_start).toDate() : null} // Ensure valid date object
                      onChange={(date: Date | null) => {
                        setHolidayDateStart(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy'
                      dateFormat='dd/MM/yyyy' // Format to display only date
                      customInput={
                        <CustomInput
                          value={holiday_date_start ? (dayjs(holiday_date_start) as any) : ''} // Check if the value is valid
                          onChange={onChange}
                          label='Tanggal Mulai'
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='holiday_date_end'
                control={control}
                rules={{ required: 'Tanggal is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={holiday_date_end ? dayjs(holiday_date_end).toDate() : null} // Ensure valid date object
                      onChange={(date: Date | null) => {
                        setHolidayDateEnd(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy'
                      dateFormat='dd/MM/yyyy' // Format to display only date
                      customInput={
                        <CustomInput
                          value={holiday_date_end ? (dayjs(holiday_date_end) as any) : ''} // Check if the value is valid
                          onChange={onChange}
                          label='Tanggal Selesai'
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    rows={4}
                    multiline
                    label='Description'
                    placeholder='Description'
                    {...field} // Pass all the necessary props from react-hook-form
                  />
                )}
              />
            </Grid>
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Save
              </Button>
              <Box m={1} display='inline'></Box>
              <Link href='/ms/absensi/hariLibur' passHref>
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
