import React, { useState, useEffect, forwardRef, ChangeEvent } from 'react'

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
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ** Custom Imports
import axiosConfig from '../../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import dayjs from 'dayjs'

interface ClassForm {
  user_id: string
  start_date: string
  end_date: string
  notes: string
  status: 'Pending' | 'Rejected' | 'Approved'
  gambar: File | null
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
  notes: yup.string().required('Notes are required'), // Ensures notes are required

  status: yup
    .string()
    .oneOf(['Pending', 'Rejected', 'Approved'], 'Invalid class status')
    .required('Class status is required'), // Ensures status is either 'ON' or 'OFF'

  start_date: yup.date().required('Start time is required'), // Ensures start_date is a required date
  end_date: yup
    .date()
    .required('End time is required') // Ensures end_date is a required date
    .min(yup.ref('start_date'), 'End time must be after start time') // Validates that end_date is after start_date
})

const AddForm = () => {
  const [users, setUsers] = useState<any[]>([])
  const [jenisCuti, setJenisCuti] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('') // Manage selected user state
  const [selectedJenisCuti, setSelectedJenisCuti] = useState<string>('') // Manage selected jenis cuti state
  const [image, setGambarValue] = useState<File>()

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id
  const storedToken = window.localStorage.getItem('token')
  const router = useRouter()

  const defaultValues: ClassForm = {
    user_id: '',
    start_date: '',
    end_date: '',
    notes: '',
    status: 'Pending',
    gambar: null
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosConfig.get(`/list-siswa/?school_id=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setUsers(response.data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    const fetchJenisCuti = async () => {
      try {
        const response = await axiosConfig.get(`/list-jenisCuti/?school_id=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setJenisCuti(response.data)
      } catch (error) {
        console.error('Error fetching jenisCuti:', error)
      }
    }

    fetchJenisCuti()
    fetchUsers()
  }, [schoolId, storedToken])

  const onSubmit = (data: ClassForm) => {
    const formData = new FormData()

    // Append form data including the values from the form state
    formData.append('school_id', schoolId)
    formData.append('user_id', selectedUser) // Use selected user ID from state
    formData.append('jenis_cuti_id', selectedJenisCuti) // Use selected jenis cuti ID from state
    formData.append('notes', data.notes.toUpperCase())
    formData.append('status', data.status)
    formData.append('start_date', dayjs(data.start_date).toISOString())
    formData.append('end_date', dayjs(data.end_date).toISOString())

    // If there is an image file, append it to the formData
    if (image) {
      formData.append('gambar', image)
    }

    // Make API call with the FormData
    axiosConfig
      .post('/create-cuti', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)

        toast.success('Successfully Added Cuti!')
        router.push('/ms/absensi/cuti')
      })
      .catch(() => {
        toast.error('Failed to add Cuti!')
      })
  }

  return (
    <Card>
      <CardHeader title='Tambah Cuti' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* User Autocomplete */}
            <Grid item xs={12} sm={6} md={6}>
              <CustomAutocomplete
                fullWidth
                value={users.find(user => user.id === selectedUser) || null} // Ensure the selected user is correctly displayed
                options={users}
                onChange={(event, newValue) => {
                  const userId = newValue ? newValue.id : ''
                  setSelectedUser(userId) // Update selected user state
                }}
                id='autocomplete-siswa'
                getOptionLabel={option => option.full_name || ''}
                renderInput={params => <CustomTextField {...params} label='Siswa' variant='outlined' />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <CustomAutocomplete
                fullWidth
                value={jenisCuti.find(cuti => cuti.id === selectedJenisCuti) || null} // Ensure the selected cuti is correctly displayed
                options={jenisCuti.filter(cuti => cuti.status === 'ON')} // Filter options where status is ON
                onChange={(event, newValue) => {
                  const jenisCutiId = newValue ? newValue.id : ''
                  setSelectedJenisCuti(jenisCutiId) // Update selected jenis cuti state
                }}
                id='autocomplete-jenis-cuti'
                getOptionLabel={option => option.cuti_name || ''} // Assuming `cuti_name` is the label for jenis cuti
                renderInput={params => <CustomTextField {...params} label='Jenis Cuti' variant='outlined' />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='start_date'
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
                          label='Mulai Cuti'
                          error={!!errors.start_date}
                          {...(errors.start_date && { helperText: errors.start_date?.message })}
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='end_date'
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
                          label='Selesai Cuti'
                          error={Boolean(errors.end_date)}
                          {...(errors.end_date && { helperText: 'This field is required' })}
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>
            {/* Status Field */}
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
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Rejected'>Ditolak</MenuItem>
                    <MenuItem value='Approved'>Diterima</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='gambar'
                control={control}
                render={({ field: { onChange } }) => (
                  <CustomTextField
                    fullWidth
                    name='gambar'
                    type='file'
                    label='Upload Gambar'
                    InputLabelProps={{
                      shrink: true
                    }}
                    inputProps={{
                      accept: 'image/*'
                    }}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const file = event.target.files?.[0]

                      setGambarValue(file)
                      onChange(event)
                    }}
                    error={Boolean(errors.gambar)}
                    helperText={errors.gambar?.message}
                  />
                )}
              />
            </Grid>
            {/* Description Field */}
            <Grid item xs={12} sm={12} md={12}>
              <Controller
                name='notes'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Keterangan'
                    onChange={onChange}
                    rows={4}
                    multiline
                    placeholder='Enter notes'
                    error={Boolean(errors.notes)}
                    helperText={errors.notes?.message}
                  />
                )}
              />
            </Grid>

            {/* Submit and Back Buttons */}
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Box m={1} display='inline' />
              <Button
                type='button'
                variant='contained'
                color='secondary'
                onClick={() => router.push('/ms/absensi/cuti')}
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
