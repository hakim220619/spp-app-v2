import { useEffect, useState } from 'react'
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
  const [startTime, setStartTime] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [clas, setClass] = useState<string>('')
  const [user, setUser] = useState<string>('')
  const [units, setUnits] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [filteredClasses, setFilteredClasses] = useState<any[]>([])
  const [status, setStatus] = useState<string>('')

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
          const { unit_id, class_id, user_id, subject_name, code, start_time, end_time, description, status } =
            response.data
          setUnit(unit_id)
          setClass(class_id)
          setUser(user_id)
          setSubjectName(subject_name)
          setCode(code)
          setStartTime(start_time)
          setEndTime(end_time)
          setDescription(description)
          setStatus(status)

          // Set default values for react-hook-form
          setValue('subject_name', subject_name)
          setValue('code', code)
          setValue('start_time', start_time)
          setValue('end_time', end_time)
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
      start_time: data.start_time, // Ensure correct time format
      end_time: data.end_time, // Ensure correct time format
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
            <Grid item xs={12} sm={12} md={6}>
              <Controller
                name='start_time'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    defaultValue={startTime}
                    value={value}
                    label='Jam Mulai'
                    onChange={onChange}
                    type='time'
                    placeholder='Enter start_time'
                    error={Boolean(errors.start_time)}
                    helperText={errors.status ? 'Status is required' : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Controller
                name='end_time'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    defaultValue={endTime}
                    value={value}
                    label='Jam Selesai'
                    onChange={onChange}
                    type='time'
                    placeholder='Enter end_time'
                    error={Boolean(errors.end_time)}
                    helperText={errors.end_time ? 'end_time is required' : ''}
                  />
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
