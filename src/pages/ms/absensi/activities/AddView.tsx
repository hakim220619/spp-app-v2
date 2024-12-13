import React, { forwardRef, ChangeEvent } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import { Box } from '@mui/system'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Imports
import axiosConfig from '../../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import dayjs from 'dayjs'

interface ClassForm {
  activity_name: string
  description: string
  start_time_in: string
  end_time_in: string
  start_time_out: string
  end_time_out: string
  status: 'ON' | 'OFF'
}
interface CustomInputProps {
  value: DateType
  label: string
  error: boolean
  onChange: (event: ChangeEvent) => void
}

const CustomInput = forwardRef(({ ...props }: CustomInputProps, ref) => {
  return <CustomTextField fullWidth inputRef={ref} {...props} sx={{ width: '100%' }} />
})

const schema = yup.object().shape({
  activity_name: yup.string().required('Class activity_name is required'),
  description: yup.string().required('Class Description is required'),
  start_time_in: yup.date().required('Start Time is required'),
  end_time_in: yup.date().required('End Time is required'),
  start_time_out: yup.date().required('Start Time Out is required'),
  end_time_out: yup.date().required('End Time Out is required'),
  status: yup.string().oneOf(['ON', 'OFF'], 'Invalid class status').required('Class Status is required')
})

const AddForm = () => {
  const router = useRouter()

  const defaultValues: ClassForm = {
    activity_name: '',
    description: '',
    start_time_in: '',
    end_time_in: '',
    start_time_out: '',
    end_time_out: '',
    status: 'ON'
  }

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ClassForm>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  const onSubmit = (data: ClassForm) => {
    const formData = new FormData()
    formData.append('school_id', schoolId)
    formData.append('activity_name', data.activity_name)
    formData.append('start_time_in', data.start_time_in)
    formData.append('end_time_in', data.end_time_in)
    formData.append('start_time_out', data.start_time_out)
    formData.append('end_time_out', data.end_time_out)
    formData.append('description', data.description)
    formData.append('status', data.status)
    console.log(formData)

    const storedToken = window.localStorage.getItem('token')
    axiosConfig
      .post('/create-activities', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Class!')
        router.push('/ms/absensi/activities')
      })
      .catch(() => {
        toast.error('Failed to add class')
      })
  }

  return (
    <Card>
      <CardHeader title='Tambah Absensi Kegiatan' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Name Field */}
            <Grid item xs={6}>
              <Controller
                name='activity_name'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Nama Kegiatan'
                    onChange={onChange}
                    placeholder='e.g. Class A'
                    error={Boolean(errors.activity_name)}
                    helperText={errors.activity_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='status'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Status'
                    onChange={onChange}
                    error={Boolean(errors.status)}
                    helperText={errors.status?.message}
                  >
                    <MenuItem value='ON'>ON</MenuItem>
                    <MenuItem value='OFF'>OFF</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='start_time_in'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value ? new Date(value) : null} // Ensure it's a Date object
                      onChange={(date: Date | null) => onChange(date)} // Pass the date to the form state
                      placeholderText='MM/DD/YYYY HH:mm'
                      dateFormat='MM/dd/yyyy HH:mm' // Format to include both date and time
                      showTimeSelect // Add time selection
                      showTimeSelectOnly={false} // Allow both date and time selection
                      timeIntervals={15} // You can change the interval of minutes if needed
                      customInput={
                        <CustomInput
                          value={value ? (dayjs(value).format('MM/DD/YYYY HH:mm') as any) : ''} // Format as 'MM/DD/YYYY HH:mm'
                          onChange={onChange}
                          label='Mulai Kegiatan'
                          error={!!errors.start_time_in}
                          {...(errors.start_time_in && { helperText: errors.start_time_in?.message })}
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
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value ? new Date(value) : null} // Ensure it's a Date object
                      onChange={(date: Date | null) => onChange(date)} // Pass the date to the form state
                      placeholderText='MM/DD/YYYY HH:mm'
                      dateFormat='MM/dd/yyyy HH:mm' // Format to include both date and time
                      showTimeSelect // Add time selection
                      showTimeSelectOnly={false} // Allow both date and time selection
                      timeIntervals={15} // You can change the interval of minutes if needed
                      customInput={
                        <CustomInput
                          value={value ? (dayjs(value).format('MM/DD/YYYY HH:mm') as any) : ''} // Format as 'MM/DD/YYYY HH:mm'
                          onChange={onChange}
                          label='Selesai Kegiatan'
                          error={Boolean(errors.end_time_in)}
                          {...(errors.end_time_in && { helperText: 'This field is required' })}
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
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value ? new Date(value) : null} // Ensure it's a Date object
                      onChange={(date: Date | null) => onChange(date)} // Pass the date to the form state
                      placeholderText='MM/DD/YYYY HH:mm'
                      dateFormat='MM/dd/yyyy HH:mm' // Format to include both date and time
                      showTimeSelect // Add time selection
                      showTimeSelectOnly={false} // Allow both date and time selection
                      timeIntervals={15} // You can change the interval of minutes if needed
                      customInput={
                        <CustomInput
                          value={value ? (dayjs(value).format('MM/DD/YYYY HH:mm') as any) : ''} // Format as 'MM/DD/YYYY HH:mm'
                          onChange={onChange}
                          label='Mulai Kegiatan'
                          error={!!errors.start_time_out}
                          {...(errors.start_time_out && { helperText: errors.start_time_out?.message })}
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
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value ? new Date(value) : null} // Ensure it's a Date object
                      onChange={(date: Date | null) => onChange(date)} // Pass the date to the form state
                      placeholderText='MM/DD/YYYY HH:mm'
                      dateFormat='MM/dd/yyyy HH:mm' // Format to include both date and time
                      showTimeSelect // Add time selection
                      showTimeSelectOnly={false} // Allow both date and time selection
                      timeIntervals={15} // You can change the interval of minutes if needed
                      customInput={
                        <CustomInput
                          value={value ? (dayjs(value).format('MM/DD/YYYY HH:mm') as any) : ''} // Format as 'MM/DD/YYYY HH:mm'
                          onChange={onChange}
                          label='Selesai Kegiatan'
                          error={Boolean(errors.end_time_out)}
                          {...(errors.end_time_out && { helperText: 'This field is required' })}
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={12}>
              <Controller
                name='description'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Deskripsi'
                    onChange={onChange}
                    rows={4}
                    multiline
                    placeholder='Enter class description'
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Box m={1} display='inline' />
              <Button
                type='button'
                variant='contained'
                color='secondary'
                onClick={() => router.push('/ms/absensi/kegiatan')}
              >
                Back
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddForm
