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

interface DataForm {
  holiday_name: string
  holiday_date_start: string
  holiday_date_end: string
  description: string
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
  holiday_name: yup.string().required('Class holiday_name is required'),
  description: yup.string().required('Class Description is required'),
  status: yup.string().oneOf(['ON', 'OFF'], 'Invalid class status').required('Class Status is required')
})

const AddForm = () => {
  const router = useRouter()

  const defaultValues: DataForm = {
    holiday_name: '',
    holiday_date_start: '',
    holiday_date_end: '',
    description: '',
    status: 'ON'
  }

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<DataForm>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  const onSubmit = (data: DataForm) => {
    const formData = new FormData()
    formData.append('school_id', schoolId)
    formData.append('holiday_name', data.holiday_name.toUpperCase())
    formData.append('holiday_date_start', data.holiday_date_start)
    formData.append('holiday_date_end', data.holiday_date_end)
    formData.append('description', data.description.toUpperCase())
    formData.append('status', data.status)

    const storedToken = window.localStorage.getItem('token')
    axiosConfig
      .post('/create-holiday', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Class!')
        router.push('/ms/absensi/hariLibur')
      })
      .catch(() => {
        toast.error('Gagal menambahkan hari Libur!')
      })
  }

  return (
    <Card>
      <CardHeader title='Tambah Hari Libur' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Name Field */}
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='holiday_name'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Nama Hari Libur'
                    onChange={onChange}
                    placeholder='e.g. Class A'
                    error={Boolean(errors.holiday_name)}
                    helperText={errors.holiday_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
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
                name='holiday_date_start'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value ? new Date(value) : null} // Ensure it's a Date object or null
                      onChange={(date: Date | null) => {
                        // Check if the date is valid before updating the state
                        if (date && !isNaN(date.getTime())) {
                          onChange(date)
                        } else {
                          onChange(null) // Fallback to null if the date is invalid
                        }
                      }}
                      placeholderText='MM/DD/YYYY'
                      dateFormat='MM/dd/yyyy' // Optional: format the date display
                      customInput={
                        <CustomInput
                          value={value ? (new Date(value).toLocaleDateString('en-US') as any) : ''} // Display formatted date
                          onChange={onChange}
                          label='Tanggal Mulai'
                          error={Boolean(errors.holiday_date_start)}
                          {...(errors.holiday_date_start && { helperText: 'This field is required' })}
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
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={value ? new Date(value) : null} // Ensure it's a Date object or null
                      onChange={(date: Date | null) => {
                        // Check if the date is valid before updating the state
                        if (date && !isNaN(date.getTime())) {
                          onChange(date)
                        } else {
                          onChange(null) // Fallback to null if the date is invalid
                        }
                      }}
                      placeholderText='MM/DD/YYYY'
                      dateFormat='MM/dd/yyyy' // Optional: format the date display
                      customInput={
                        <CustomInput
                          value={value ? (new Date(value).toLocaleDateString('en-US') as any) : ''} // Display formatted date
                          onChange={onChange}
                          label='Tanggal Selesai'
                          error={Boolean(errors.holiday_date_end)}
                          {...(errors.holiday_date_end && { helperText: 'This field is required' })}
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12}>
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

            <Grid item xs={12}>
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
