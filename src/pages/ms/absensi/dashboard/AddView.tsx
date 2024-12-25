import React, { useEffect, useState } from 'react'

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

interface ClassForm {
  unit_id: string
  activity_id: string
  subject_id: string
  status: string
  deskripsi: string
}

const schema = yup.object().shape({
  unit_id: yup.string().required('Unit is required'),
  status: yup.string().required('Unit is required'),
  deskripsi: yup.string().required('Unit is required')
})

const SettingAbsensiFormComponent = () => {
  const router = useRouter()
  const [units, setUnits] = useState([])
  const [activities, setActivities] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filteredSubjects, setFilteredSubjects] = useState([]) // New state for filtered subjects

  const defaultValues: ClassForm = {
    unit_id: '',
    activity_id: '',
    subject_id: '',
    status: '',
    deskripsi: ''
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue // setValue is used to programmatically change field values
  } = useForm<ClassForm>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const unit_id = watch('unit_id') // Watch for changes in the unit_id field
  const activity_id = watch('activity_id') // Watch for changes in the activity_id field
  const subject_id = watch('subject_id') // Watch for changes in the subject_id field

  useEffect(() => {
    const fetchData = async () => {
      const userData = JSON.parse(localStorage.getItem('userData') as any)
      const schoolId = userData?.school_id

      if (!schoolId) {
        console.error('School ID is missing')
        toast.error('School ID is missing')

        return
      }

      try {
        // Run all fetches in parallel using Promise.all
        const [unitsRes, activitiesRes, subjectsRes] = await Promise.all([
          axiosConfig.get('/getUnit', {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${window.localStorage.getItem('token')}`
            }
          }),
          axiosConfig.get('/getActivities', {
            params: { schoolId: schoolId },
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${window.localStorage.getItem('token')}`
            }
          }),
          axiosConfig.get('/getSubjects', {
            params: { school_id: schoolId },
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${window.localStorage.getItem('token')}`
            }
          })
        ])

        // Filter units based on the school_id
        const filteredUnits = unitsRes.data.filter((unit: any) => unit.school_id === schoolId)
        setUnits(filteredUnits)
        setActivities(activitiesRes.data)
        setSubjects(subjectsRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load data')
      }
    }

    fetchData()
  }, []) // empty dependency ensures this effect runs only once when the component mounts

  useEffect(() => {
    // Filter subjects based on selected unit_id
    if (unit_id) {
      const filtered = subjects.filter((subject: any) => subject.unit_id === unit_id)
      setFilteredSubjects(filtered)
    }
  }, [unit_id, subjects]) // Triggered when unit_id or subjects change

  useEffect(() => {
    // When activity_id is selected, set subject_id to null
    if (activity_id) {
      setValue('subject_id', '')
    }
  }, [activity_id, setValue])

  useEffect(() => {
    // When subject_id is selected, set activity_id to null
    if (subject_id) {
      setValue('activity_id', '')
    }
  }, [subject_id, setValue])

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  const onSubmit = (data: ClassForm) => {
    const formData = new FormData()
    formData.append('school_id', schoolId)
    formData.append('unit_id', data.unit_id)
    formData.append('activity_id', data.activity_id)
    formData.append('subject_id', data.subject_id)
    formData.append('status', data.status)
    formData.append('deskripsi', data.deskripsi)

    const storedToken = window.localStorage.getItem('token')
    axiosConfig
      .post('/create-absensi-aktif', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Class!')
        router.push('/ms/absensi/dashboard')
      })
      .catch(() => {
        toast.error('Failed to add class')
      })
  }

  return (
    <Card>
      <CardHeader title='Tambah Setting Absensi' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='unit_id'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Unit'
                    onChange={onChange}
                    error={Boolean(errors.unit_id)}
                    helperText={errors.unit_id?.message}
                  >
                    {units.map((unit: any) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.unit_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='activity_id'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Activity'
                    onChange={onChange}
                    error={Boolean(errors.activity_id)}
                    helperText={errors.activity_id?.message}
                  >
                    {activities.map((activity: any) => (
                      <MenuItem key={activity.id} value={activity.id}>
                        {activity.activity_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='subject_id'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Subject'
                    onChange={onChange}
                    error={Boolean(errors.subject_id)}
                    helperText={errors.subject_id?.message}
                  >
                    {filteredSubjects.map((subject: any) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.subject_name} - {subject.class_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12}>
              <Controller
                name='deskripsi'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    multiline
                    rows={4}
                    label='Deskripsi'
                    onChange={onChange}
                    placeholder='Enter class description'
                    error={Boolean(errors.deskripsi)}
                    helperText={errors.deskripsi?.message}
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
                onClick={() => router.push('/ms/absensi/dashboard')}
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

export default SettingAbsensiFormComponent
