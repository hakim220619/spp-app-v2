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
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'

// CustomAutocomplete component import
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

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
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm()
  const router = useRouter()
  const { id } = router.query
  const storedToken = window.localStorage.getItem('token')
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  const [subjectName, setSubjectName] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [clas, setClass] = useState<string>('')
  const [user, setUser] = useState<string>('')
  const [units, setUnits] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])
  const [status, setStatus] = useState<string>('')

  const [start_time_in, setStartTime] = useState<Date | null>(null)
  const [end_time_in, setEndTime] = useState<Date | null>(null)
  const [start_time_out, setStartTimeOut] = useState<Date | null>(null)
  const [end_time_out, setEndTimeOut] = useState<Date | null>(null)

  // Fetch unit and user data
  useEffect(() => {
    const fetchUnitsAndUsers = async () => {
      try {
        const unitResponse = await axiosConfig.get(`/getUnit`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        const filteredUnits = unitResponse.data.filter((unit: any) => unit.school_id === schoolId)
        setUnits(filteredUnits)

        const userResponse = await axiosConfig.get(`/getTeacher/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setUsers(userResponse.data)
      } catch (error) {
        console.error('Error fetching units and users:', error)
      }
    }

    fetchUnitsAndUsers()
  }, [schoolId, storedToken])

  // Fetch classes data based on unit selection
  useEffect(() => {
    if (!unit) return
    const fetchClasses = async () => {
      try {
        const classResponse = await axiosConfig.get(`/getClass/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        const filteredClass = classResponse.data.filter((clas: any) => clas.unit_id === unit)
        setFilteredClasses(filteredClass)
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }

    fetchClasses()
  }, [unit, schoolId, storedToken])

  // Fetch subject details when editing
  useEffect(() => {
    if (storedToken && id) {
      axiosConfig
        .post(
          '/detailSubjects',
          { id },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const {
            unit_id,
            class_id,
            user_id,
            subject_name,
            code,
            start_time_in,
            end_time_in,
            start_time_out,
            end_time_out,
            description,
            status
          } = response.data
          setUnit(unit_id)
          setClass(class_id)
          setUser(user_id)
          setSubjectName(subject_name)
          setCode(code)
          setStartTime(dayjs(start_time_in).toDate())
          setEndTime(dayjs(end_time_in).toDate())
          setStartTimeOut(dayjs(start_time_out).toDate())
          setEndTimeOut(dayjs(end_time_out).toDate())
          setDescription(description)
          setStatus(status)

          // Set default values for react-hook-form
          setValue('subject_name', subject_name)
          setValue('code', code)
          setValue('start_time_in', dayjs(start_time_in).toDate())
          setValue('end_time_in', dayjs(end_time_in).toDate())
          setValue('start_time_out', dayjs(start_time_out).toDate())
          setValue('end_time_out', dayjs(end_time_out).toDate())
          setValue('description', description)
          setValue('status', status)
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }
  }, [id, storedToken, setValue])

  // Handle form submission
  const onSubmit = (data: any) => {
    // Prepare the form data for submission
    const formData = {
      id, // Subject ID (for editing)
      school_id: schoolId,
      subject_name: data.subject_name.toUpperCase(), // Ensure subject name is in uppercase
      code: data.code.toUpperCase(), // Ensure code is in uppercase
      start_time_in: data.start_time_in,
      end_time_in: data.end_time_in,
      start_time_out: data.start_time_out,
      end_time_out: data.end_time_out,
      description: data.description.toUpperCase(), // Ensure description is in uppercase
      status: data.status, // ON or OFF status
      unit_id: unit, // Unit ID
      class_id: clas, // Class ID
      user_id: user // User ID (Teacher)
    }

    if (storedToken) {
      axiosConfig
        .post(
          '/update-subjects', // Adjust endpoint if needed
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
          router.push('/ms/absensi/mataPelajaran')
        })
        .catch(error => {
          console.error('Submission error: ', error)
          toast.error('Failed to update subject. Please try again.')
        })
    }
  }

  return (
    <Card>
      <CardHeader title='Update Mata Pelajaran' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Unit Autocomplete */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomAutocomplete
                fullWidth
                defaultValue={unit}
                value={units.find(unitObj => unitObj.id === unit) || null}
                options={units}
                onChange={(event, newValue) => {
                  setUnit(newValue ? newValue.id : '')
                  setClass('') // Reset class when unit changes
                }}
                id='autocomplete-unit'
                getOptionLabel={option => option.unit_name || ''}
                renderInput={params => <CustomTextField {...params} label='Unit' variant='outlined' />}
              />
            </Grid>

            {/* Class Autocomplete */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomAutocomplete
                fullWidth
                defaultValue={clas}
                value={filteredClasses.find(clasObj => clasObj.id === clas) || null}
                options={filteredClasses}
                onChange={(event, newValue) => {
                  setClass(newValue ? newValue.id : '')
                }}
                id='autocomplete-class'
                getOptionLabel={option => option.class_name || ''}
                renderInput={params => <CustomTextField {...params} label='Class' variant='outlined' />}
              />
            </Grid>

            {/* User Autocomplete */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomAutocomplete
                fullWidth
                defaultValue={user}
                value={users.find(userObj => userObj.id === user) || null}
                options={users}
                onChange={(event, newValue) => {
                  setUser(newValue ? newValue.id : '')
                }}
                id='autocomplete-user'
                getOptionLabel={option => option.full_name || ''}
                renderInput={params => <CustomTextField {...params} label='Guru' variant='outlined' />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='subject_name'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    defaultValue={subjectName}
                    value={value}
                    label='Mata Pelajaran'
                    onChange={onChange}
                    placeholder='e.g. Class A'
                    error={Boolean(errors.subject_name)}
                    helperText={errors.subject_name ? 'Status is required' : ''}
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
                    defaultValue={code}
                    value={value}
                    label='Kode Mata Pelajaran'
                    onChange={onChange}
                    placeholder='e.g. Class A'
                    error={Boolean(errors.code)}
                    helperText={errors.code ? 'Status is required' : ''}
                  />
                )}
              />
            </Grid>
            {/* Status Field */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='status'
                defaultValue={status}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    select
                    label='Status'
                    {...field}
                    error={Boolean(errors.status)}
                    helperText={errors.status ? 'Status is required' : ''}
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
                          label='Mulai Pelajaran Awal'
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
                          label='Mulai Pelajaran Akhir'
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
                          label='Selesai Pelajaran Awal'
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
                          label='Selesai Pelajaran Akhir'
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
                    defaultValue={description}
                    value={value}
                    label='Deskripsi'
                    onChange={onChange}
                    rows={3}
                    multiline
                    placeholder='Enter class description'
                    error={Boolean(errors.description)}
                    helperText={errors.description ? 'description is required' : ''}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
            <Button variant='contained' color='primary' type='submit'>
              Simpan
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
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationSchema
