import React, { ChangeEvent, forwardRef, useEffect, useState } from 'react'

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
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import dayjs from 'dayjs'

interface DataForm {
  subject_name: string
  code: string
  start_time_in: string
  end_time_in: string
  start_time_out: string
  end_time_out: string
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
  subject_name: yup.string().required('Class subject_name is required'),
  description: yup.string().required('Class Description is required'),
  status: yup.string().oneOf(['ON', 'OFF'], 'Invalid class status').required('Class Status is required')
})

const AddForm = () => {
  const router = useRouter()

  const defaultValues: DataForm = {
    subject_name: '',
    code: '',
    start_time_in: '',
    end_time_in: '',
    start_time_out: '',
    end_time_out: '',
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
  const storedToken = window.localStorage.getItem('token')
  const [unit, setUnit] = useState<string>('')
  const [clas, setClass] = useState<string>('')
  const [user, setUser] = useState<string>('')
  const [units, setUnits] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axiosConfig.get(`/getUnit`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        const filteredUnits = response.data.filter((unit: any) => unit.school_id === schoolId)
        setUnits(filteredUnits)
      } catch (error) {
        console.error('Error fetching units:', error)
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await axiosConfig.get(`/getTeacher/?schoolId=${schoolId}`, {
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
    const fetchClasses = async () => {
      try {
        const response = await axiosConfig.get(`/getClass/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        const filteredClass = response.data.filter((cla: any) => cla.unit_id === unit)

        setFilteredClasses(filteredClass)
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }

    fetchUnits()
    fetchUsers()
    if (unit) fetchClasses()
  }, [schoolId, storedToken, unit])

  const onSubmit = (data: DataForm) => {
    const formData = new FormData()
    formData.append('school_id', schoolId)
    formData.append('unit_id', unit)
    formData.append('class_id', clas)
    formData.append('user_id', user)
    formData.append('subject_name', data.subject_name.toUpperCase())
    formData.append('code', data.code)
    formData.append('start_time_in', data.start_time_in)
    formData.append('end_time_in', data.end_time_in)
    formData.append('start_time_out', data.start_time_out)
    formData.append('end_time_out', data.end_time_out)
    formData.append('description', data.description.toUpperCase())
    formData.append('status', data.status)
    console.log(formData)

    axiosConfig
      .post('/create-subjects', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Mata Pelajaran!')
        router.push('/ms/absensi/mataPelajaran')
      })
      .catch(() => {
        toast.error('Gagal menambahkan Mata Pelajaran!')
      })
  }

  return (
    <Card>
      <CardHeader title='Tambah Mata Pelajaran' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={4}>
              <CustomAutocomplete
                fullWidth
                value={units.find(unitObj => unitObj.id === unit) || null} // Correctly set the value
                options={units}
                onChange={(event, newValue) => {
                  setUnit(newValue ? newValue.id : '') // Set unit ID based on selection
                  setClass('') // Reset class when unit changes
                }}
                id='autocomplete-unit'
                getOptionLabel={option => option.unit_name || ''}
                renderInput={params => <CustomTextField {...params} label='Unit' variant='outlined' />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomAutocomplete
                fullWidth
                value={filteredClasses.find(clasObj => clasObj.id === clas) || null} // Correctly set the value
                options={filteredClasses}
                onChange={(event, newValue) => {
                  setClass(newValue ? newValue.id : '') // Set class ID based on selection
                }}
                id='autocomplete-class'
                getOptionLabel={option => option.class_name || ''}
                renderInput={params => <CustomTextField {...params} label='Kelas' variant='outlined' />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomAutocomplete
                fullWidth
                value={users.find(userObj => userObj.id === user) || null} // Correctly set the value for user
                options={users}
                onChange={(event, newValue) => {
                  setUser(newValue ? newValue.id : '') // Set user ID based on selection
                }}
                id='autocomplete-user'
                getOptionLabel={option => option.full_name || ''}
                renderInput={params => <CustomTextField {...params} label='Guru' variant='outlined' />}
              />
            </Grid>

            {/* Other form fields (subject_name, holiday_date, status, etc.) */}
            {/* Name Field */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='subject_name'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Mata Pelajaran'
                    onChange={onChange}
                    placeholder='e.g. Class A'
                    error={Boolean(errors.subject_name)}
                    helperText={errors.subject_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='code'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Kode'
                    onChange={onChange}
                    placeholder='e.g. Class A'
                    error={Boolean(errors.code)}
                    helperText={errors.code?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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
                          label='Mulai Pelajaran Awal'
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
                          label='Selesai Pelajaran Awal'
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
                          label='Mulai Pelajaran Akhir'
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
                          label='Selesai Pelajaran Akhir'
                          error={Boolean(errors.end_time_out)}
                          {...(errors.end_time_out && { helperText: 'This field is required' })}
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
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Deskripsi'
                    onChange={onChange}
                    rows={3}
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
                onClick={() => router.push('/ms/absensi/mataPelajaran')}
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
