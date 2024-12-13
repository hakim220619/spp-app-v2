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

  const [activity_name, setActivityName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [start_time_in, setStartTime] = useState<Date | null>(null)
  const [end_time_in, setEndTime] = useState<Date | null>(null)
  const [start_time_out, setStartTimeOut] = useState<Date | null>(null)
  const [end_time_out, setEndTimeOut] = useState<Date | null>(null)
  const [status, setStatus] = useState<'ON' | 'OFF'>('ON')
  console.log(description)

  // Fetch class details
  useEffect(() => {
    if (storedToken && id) {
      axiosConfig
        .post(
          '/detailActivities',
          { id },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { activity_name, description, start_time_in, end_time_in, start_time_out, end_time_out, status } =
            response.data
          setActivityName(activity_name)
          setDescription(description)
          setStartTime(dayjs(start_time_in).toDate())
          setEndTime(dayjs(end_time_in).toDate())
          setStartTimeOut(dayjs(start_time_out).toDate())
          setEndTimeOut(dayjs(end_time_out).toDate())
          setStatus(status)

          // Set default values for react-hook-form
          setValue('activity_name', activity_name)
          setValue('description', description)
          setValue('start_time_in', dayjs(start_time_in).toDate())
          setValue('end_time_in', dayjs(end_time_in).toDate())
          setValue('start_time_out', dayjs(start_time_out).toDate())
          setValue('end_time_out', dayjs(end_time_out).toDate())
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
      activity_name: data.activity_name.toUpperCase(),
      description: data.description.toUpperCase(),
      start_time_in: data.start_time_in ? dayjs(data.start_time_in).toISOString() : null,
      end_time_in: data.end_time_in ? dayjs(data.end_time_in).toISOString() : null,
      start_time_out: data.start_time_out ? dayjs(data.start_time_out).toISOString() : null,
      end_time_out: data.end_time_out ? dayjs(data.end_time_out).toISOString() : null,
      status: data.status
    }

    if (storedToken) {
      axiosConfig
        .post(
          '/update-activities',
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
          router.push('/ms/absensi/activities')
        })
        .catch(() => {
          toast.error("Failed. This didn't work.")
        })
    }
  }

  return (
    <Card>
      <CardHeader title='Update Kegiatan Kelas' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Name Field */}
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='activity_name'
                control={control}
                defaultValue={activity_name}
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
            {/* Description Field */}

            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='start_time_in'
                control={control}
                rules={{ required: 'Start time is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={start_time_in} // Use the Date object directly
                      onChange={(date: Date | null) => {
                        setStartTime(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy HH:mm'
                      dateFormat='dd/MM/yyyy HH:mm'
                      showTimeSelect
                      timeIntervals={15}
                      customInput={
                        <CustomInput
                          value={start_time_in ? (dayjs(start_time_in).format('HH:mm:ss') as any) : ''}
                          onChange={onChange}
                          label='Mulai Kegiatan Awal'
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='end_time_in'
                control={control}
                rules={{ required: 'End time is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={end_time_in} // Use the Date object directly
                      onChange={(date: Date | null) => {
                        setEndTime(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy HH:mm'
                      dateFormat='dd/MM/yyyy HH:mm'
                      showTimeSelect
                      timeIntervals={15}
                      customInput={
                        <CustomInput
                          value={end_time_in ? (dayjs(end_time_in).format('HH:mm:ss') as any) : ''}
                          onChange={onChange}
                          label='Mulai Kegiatan AKhir'
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='start_time_out'
                control={control}
                rules={{ required: 'Start time is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={start_time_out} // Use the Date object directly
                      onChange={(date: Date | null) => {
                        setStartTimeOut(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy HH:mm'
                      dateFormat='dd/MM/yyyy HH:mm'
                      showTimeSelect
                      timeIntervals={15}
                      customInput={
                        <CustomInput
                          value={start_time_out ? (dayjs(start_time_out).format('HH:mm:ss') as any) : ''}
                          onChange={onChange}
                          label='Selesai Kegiatan Awal'
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='end_time_out'
                control={control}
                rules={{ required: 'End time is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={end_time_out} // Use the Date object directly
                      onChange={(date: Date | null) => {
                        setEndTimeOut(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy HH:mm'
                      dateFormat='dd/MM/yyyy HH:mm'
                      showTimeSelect
                      timeIntervals={15}
                      customInput={
                        <CustomInput
                          value={end_time_out ? (dayjs(end_time_out).format('HH:mm:ss') as any) : ''}
                          onChange={onChange}
                          label='Selesai Kegiatan AKhir'
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
              <Link href='/ms/absensi/kegiatan' passHref>
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
