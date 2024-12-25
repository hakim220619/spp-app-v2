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
import Link from 'next/link'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

const FormValidationSchema = () => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm()

  const router = useRouter()
  const { uid } = router.query
  const storedToken = window.localStorage.getItem('token')

  // State variables
  const [status, setStatus] = useState<string>('ON')
  const [activityId, setActivity] = useState<string>('')
  const [subjectId, setSubject] = useState<string>('')
  const [deskripsi, setDeskripsi] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [school_id, setSchoolId] = useState<string>('')
  const [unit_id, setUnitId] = useState<string>('')
  const [units, setUnits] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([])
console.log(token);

  // Fetch class details
  useEffect(() => {
    if (storedToken) {
      axiosConfig
        .post(
          '/detailSettingAbsensi',
          { uid },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { school_id, unit_id, activity_id, subject_id, status, deskripsi, token } = response.data
          setActivity(activity_id)
          setSubject(subject_id)
          setStatus(status)
          setSchoolId(school_id)
          setUnitId(unit_id)
          setDeskripsi(deskripsi)
          setToken(token)

          // Set form values
          setValue('school_id', school_id || '')
          setValue('unit_id', unit_id || '')
          setValue('activity_id', activity_id || '')
          setValue('subject_id', subject_id)
          setValue('status', status || 'ON')
          setValue('deskripsi', deskripsi || '')
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }
  }, [uid, storedToken, setValue])

  // Fetch units
  useEffect(() => {
    const fetchData = async () => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}')
      const schoolId = userData?.school_id

      if (!schoolId) {
        toast.error('School ID is missing')

        return
      }

      try {
        const [unitsRes, activitiesRes, subjectsRes] = await Promise.all([
          axiosConfig.get('/getUnit', {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }),
          axiosConfig.get('/getActivities', {
            params: { schoolId: schoolId },
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }),
          axiosConfig.get('/getSubjects', {
            params: { school_id: schoolId },
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          })
        ])

        setUnits(unitsRes.data.filter((unit: any) => unit.school_id === schoolId))
        setActivities(activitiesRes.data)
        setSubjects(subjectsRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load data')
      }
    }

    fetchData()
  }, [storedToken])

  useEffect(() => {
    if (unit_id) {
      const filtered = subjects.filter((subject: any) => subject.unit_id === unit_id)
      setFilteredSubjects(filtered)
    } else {
      setFilteredSubjects([])
    }
  }, [unit_id, subjects])

  // Reset subject when activity changes
  useEffect(() => {
    if (activityId) {
      setSubject('')
      setValue('subject_id', '')
    }
  }, [activityId, setValue])

  // Reset activity when subject changes
  useEffect(() => {
    if (subjectId) {
      setActivity('')
      setValue('activity_id', '')
    }
  }, [subjectId, setValue])
  const onSubmit = async (data: any) => {
    const formData = {
      id: uid,
      school_id,
      unit_id,
      activity_id: activityId,
      subject_id: subjectId,
      status: data.status, // Ensure status from the form is included
      deskripsi: data.deskripsi // Include description from the form
    }
    console.log(formData)

    try {
      // Send POST request to update absensi settings
      const response = await axiosConfig.post(
        '/update-absensi-aktif',
        { data: formData },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        }
      )
      console.log(response)

      // Display success message and redirect
      toast.success('Successfully Updated!')
      router.push('/ms/absensi/dashboard')
    } catch (error) {
      // Display error message
      toast.error("Failed. This didn't work.")
      console.error('Error updating absensi:', error)
    }
  }

  return (
    <Card>
      <CardHeader title='Update Setting Absensi' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Unit Selection Field */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='unit_id'
                control={control}
                defaultValue={unit_id || ''}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Unit'
                    onChange={onChange}
                    error={Boolean(errors.unit_id)}
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

            {/* Activity Selection Field */}
            <Grid item xs={12} sm={6} md={6}>
              <CustomAutocomplete
                fullWidth
                value={activities.find(activity => activity.id === activityId) || null}
                options={activities.filter(activity => activity.status === 'ON')}
                onChange={(event, newValue) => {
                  setActivity(newValue ? newValue.id : '')
                  setValue('activity_id', newValue ? newValue.id : '')
                }}
                id='autocomplete-activity'
                getOptionLabel={option => option.activity_name || ''}
                renderInput={params => <CustomTextField {...params} label='Kegiatan' variant='outlined' />}
              />
            </Grid>

            {/* Subject Selection Field */}
            <Grid item xs={12} sm={6} md={6}>
              <CustomAutocomplete
                fullWidth
                value={filteredSubjects.find(subject => subject.id === subjectId) || null}
                options={filteredSubjects.filter(subject => subject.status === 'ON')}
                onChange={(event, newValue) => {
                  setSubject(newValue ? newValue.id : '')
                  setValue('subject_id', newValue ? newValue.id : '')
                }}
                id='autocomplete-subjects'
                getOptionLabel={option => option.subject_name || ''}
                renderInput={params => <CustomTextField {...params} label='Mata Pelajaran' variant='outlined' />}
              />
            </Grid>

            {/* Status Field */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='status'
                control={control}
                defaultValue={status || 'ON'}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Status'
                    onChange={onChange}
                    error={Boolean(errors.status)}
                  >
                    <MenuItem value='ON'>ON</MenuItem>
                    <MenuItem value='OFF'>OFF</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Description Field */}
            <Grid item xs={12}>
              <Controller
                name='deskripsi'
                control={control}
                defaultValue={deskripsi}
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
                  />
                )}
              />
            </Grid>

            {/* Submit and Back Buttons */}
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Save
              </Button>
              <Box m={1} display='inline'></Box>
              <Link href='/ms/absensi/dashboard' passHref>
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
