import React, { useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Box } from '@mui/system'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

import toast from 'react-hot-toast'

// ** Custom Imports
import axiosConfig from '../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import AbsensiKegiatan from './absenKegiatan'
import { Divider, MenuItem } from '@mui/material'
import AbsensiMataPelajaran from './absenMataPelajaran'

const AddForm = () => {
  const router = useRouter()

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id
  const storedToken = window.localStorage.getItem('token')

  const [selectedButton, setSelectedButton] = useState<string>('') // State to track selected button
  const [unit, setUnit] = useState<string>('')
  const [units, setUnits] = useState<any[]>([])
  const [clas, setClass] = useState<string>('')
  const [activity, setActivity] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [activityDetails, setActivityDetails] = useState<any>({})
  const [subjectDetails, setSubjectsDetails] = useState<any>({})

  const [filteredClasses, setFilteredClasses] = useState<any[]>([]) // Filtered classes based on selected unit
  const [activities, setActivities] = useState<any[]>([]) // List of activitiesz
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<{ userId: string; status: string }[]>([])
  const [selectedType, setSelectedType] = useState('')
  const menuItems = ['MASUK', 'KELUAR']

  const handleSelectedUsers = (users: { userId: string; status: string }[]) => {
    setSelectedUsers(users)
  }
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

    const fetchActivities = async () => {
      try {
        const response = await axiosConfig.get(`/getActivities/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setActivities(response.data)
      } catch (error) {
        console.error('Error fetching activities:', error)
      }
    }

    const fetchSubjects = async () => {
      try {
        const response = await axiosConfig.get(`/getSubjects/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })

        // Filter the subjects based on class_id (assuming each subject has a class_id field)
        const filteredSubjects = response.data.filter((subject: any) => subject.class_id === clas)

        setSubjects(filteredSubjects)
      } catch (error) {
        console.error('Error fetching subjects:', error)
      }
    }

    fetchUnits()
    if (unit) fetchClasses()
    fetchActivities()

    // Fetch subjects only when class (clas) changes
    if (clas) {
      fetchSubjects()
    }
  }, [schoolId, storedToken, unit, clas]) // Add clas dependency to re-fetch subjects

  const onSubmit = () => {
    const formData = new FormData()

    // Append form values to formData
    formData.append('school_id', schoolId)
    formData.append('unit_id', unit)
    formData.append('class_id', clas) // Add class_id to the form data
    formData.append('activity_id', activity)

    formData.append('type', selectedType)

    // Send selectedUsers as a JSON string
    formData.append('user_id', JSON.stringify(selectedUsers))
    console.log(formData)

    axiosConfig
      .post('/create-absensi', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Absesi!')
        router.push('/ms/absensi')
      })
      .catch(error => {
        console.error('Error:', error)
        toast.error('Gagal menambahkan jenis Cuti!')
      })
  }
  console.log(selectedType)
  const onSubmitSubjects = () => {
    const formData = new FormData()

    // Append form values to formData
    formData.append('school_id', schoolId)
    formData.append('unit_id', unit)
    formData.append('class_id', clas) // Add class_id to the form data
    formData.append('subject_id', subject)

    formData.append('type', selectedType)

    // Send selectedUsers as a JSON string
    formData.append('user_id', JSON.stringify(selectedUsers))

    axiosConfig
      .post('/create-absensi', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Absesi!')
        router.push('/ms/absensi')
      })
      .catch(error => {
        console.error('Error:', error)
        toast.error('Gagal menambahkan jenis Cuti!')
      })
  }

  function formatDate(date: any) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0') // Month is zero-based
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const handleActivityChange = (event: any, newValue: any) => {
    setActivity(newValue ? newValue.id : '')

    // Set the correct start time (start_time_in or start_time_out) based on selectedType
    setActivityDetails(
      newValue
        ? {
            start_time_in: formatDate(newValue.start_time_in), // Format start_time_in
            end_time_in: formatDate(newValue.end_time_in),
            start_time_out: formatDate(newValue.start_time_out), // Format start_time_out
            end_time_out: formatDate(newValue.end_time_out),
            description: newValue.description
          }
        : {}
    )
  }

  const handleSubjectChange = (event: any, newValue: any) => {
    setSubject(newValue ? newValue.id : '')

    // Set the correct start time (start_time_in or start_time_out) based on selectedType

    setSubjectsDetails(
      newValue
        ? {
            start_time_in: newValue.start_time_in, // Format start_time_in
            end_time_in: newValue.end_time_in,

            start_time_out: newValue.start_time_out, // Format start_time_out
            end_time_out: newValue.end_time_out,
            description: newValue.description
          }
        : {}
    )
  }

  const isWithinTimeRange = () => {
    const currentTime = new Date() // Get the current time

    if (!activityDetails) return false // Early return if activity details are missing

    // Determine start and end time based on selectedType
    const startTime = new Date(
      selectedType === 'MASUK' ? activityDetails.start_time_in : activityDetails.start_time_out
    )
    const endTime = new Date(selectedType === 'MASUK' ? activityDetails.end_time_in : activityDetails.end_time_out)

    // If it's 'KELUAR', add 2 hours to the end time
    if (selectedType === 'KELUAR') {
      endTime.setHours(endTime.getHours() + 2)
    }

    // Compare both date and time (no need to extract just the time part)
    const result = currentTime >= startTime && currentTime <= endTime

    // Return the result (true if currentTime is within the range, otherwise false)
    return result
  }

  const isWithinTimeRangeSubjects = () => {
    const currentTime = new Date() // Get the current time

    if (!subjectDetails) return false // Early return if subject details are missing

    const startTime = new Date(selectedType === 'MASUK' ? subjectDetails.start_time_in : subjectDetails.start_time_out)
    const endTime = new Date(selectedType === 'MASUK' ? subjectDetails.end_time_in : subjectDetails.end_time_out)

    // If it's 'KELUAR', add 2 hours to the end time
    if (selectedType === 'KELUAR') {
      endTime.setHours(endTime.getHours() + 2)
    }

    // Compare both date and time
    const result = currentTime >= startTime && currentTime <= endTime

    // Return the result (true if currentTime is within the range, otherwise false)
    return result
  }

  // Handle change in type selection
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedType(event.target.value as string) // Update the selectedType state
  }

  return (
    <Card>
      <CardHeader title='Absensi Manual' />
      <CardContent>
        <Grid container spacing={2} justifyContent='left'>
          <Grid item xs={12} sm={4} md={2}>
            <Button
              type='button'
              variant='contained'
              color={selectedButton === 'siswa' ? 'primary' : 'secondary'} // Conditionally set color
              fullWidth
              onClick={() => {
                setSelectedButton('siswa') // Update selected button
              }}
            >
              <Icon fontSize='1.125rem' icon='tabler:activity' /> Kegiatan
            </Button>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <Button
              type='button'
              variant='contained'
              color={selectedButton === 'mataPelajaran' ? 'primary' : 'secondary'}
              fullWidth
              onClick={() => {
                setSelectedButton('mataPelajaran') // Update selected button
              }}
            >
              <Icon fontSize='1.125rem' icon='tabler:book' />
              Mata Pelajaran
            </Button>
          </Grid>
        </Grid>
      </CardContent>
      <Divider style={{ marginTop: '16px' }} />
      <CardContent>
        <Grid container spacing={5}>
          {/* Conditionally render based on selected button */}
          {selectedButton === 'siswa' && (
            <>
              {/* Unit and Class Selection */}
              <Grid item xs={12} sm={3}>
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
              <Grid item xs={12} sm={3}>
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

              {/* Activity Selection */}
              <Grid item xs={12} sm={3}>
                <CustomAutocomplete
                  fullWidth
                  value={activities.find(activityObj => activityObj.id === activity) || null} // Correctly set the value
                  options={activities}
                  onChange={handleActivityChange}
                  id='autocomplete-activity'
                  getOptionLabel={option => option.activity_name || ''}
                  renderInput={params => <CustomTextField {...params} label='Kegiatan' variant='outlined' />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <CustomTextField select fullWidth label='Type' value={selectedType} onChange={handleChange}>
                  {menuItems.map(item => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Box m={3} display='inline' />

              <Grid container justifyContent='center' alignItems='center' spacing={4}>
                {/* Jam Mulai */}
                <Grid item xs={12} sm={2} container justifyContent='center' alignItems='center'>
                  {activity && (
                    <Button
                      variant='contained'
                      color='success'
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <span>Mulai:</span>
                      <span>
                        {new Date(
                          selectedType === 'MASUK' ? activityDetails.start_time_in : activityDetails.start_time_out
                        ).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </Button>
                  )}
                </Grid>

                {/* Jam Selesai */}
                <Grid item xs={12} sm={2} container justifyContent='center' alignItems='center'>
                  {activity && (
                    <Button
                      variant='contained'
                      color='error'
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <span>Selesai:</span>
                      <span>
                        {new Date(
                          selectedType === 'MASUK' ? activityDetails.end_time_in : activityDetails.end_time_out
                        ).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </Button>
                  )}
                </Grid>

                {/* Deskripsi */}
                <Grid item xs={12} sm={12} container justifyContent='center' alignItems='center'>
                  {activity && (
                    <Button variant='outlined' color='secondary' sx={{ display: 'flex', alignItems: 'center' }}>
                      <span>{activityDetails.description}</span>
                    </Button>
                  )}
                </Grid>
              </Grid>

              {activity && (
                <Grid container justifyContent='center' alignItems='center' sx={{ marginTop: 3 }}>
                  <Button
                    onClick={onSubmit}
                    variant='contained'
                    color='success'
                    disabled={selectedUsers.length === 0 || !isWithinTimeRange()} // Disable button if outside time range
                  >
                    <Icon fontSize='1.125rem' icon='tabler:check' />
                    Simpan Absensi
                  </Button>
                </Grid>
              )}

              {/* Render AbsensiKegiatan based on selected unit and class */}
              {unit && clas && activity && (
                <AbsensiKegiatan
                  class_id={clas}
                  unit_id={unit}
                  onSelectionChange={handleSelectedUsers}
                  activity_id={activity}
                  type={selectedType}
                  endTime={selectedType === 'MASUK' ? activityDetails.end_time_in : activityDetails.end_time_out}
                />
              )}
            </>
          )}

          {selectedButton === 'mataPelajaran' && (
            <>
              <Grid item xs={12} sm={3}>
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
              <Grid item xs={12} sm={3}>
                <CustomAutocomplete
                  fullWidth
                  value={filteredClasses.find(clasObj => clasObj.id === clas) || null} // Correctly set the value
                  options={filteredClasses}
                  onChange={(event, newValue) => {
                    setClass(newValue ? newValue.id : '')
                    setSubjects([])
                  }}
                  id='autocomplete-class'
                  getOptionLabel={option => option.class_name || ''}
                  renderInput={params => <CustomTextField {...params} label='Kelas' variant='outlined' />}
                />
              </Grid>

              {/* Activity Selection */}
              <Grid item xs={12} sm={3}>
                <CustomAutocomplete
                  fullWidth
                  value={subjects.find(subjectObj => subjectObj.id === subject) || null} // Correctly set the value
                  options={subjects}
                  onChange={handleSubjectChange}
                  id='autocomplete-subject'
                  getOptionLabel={option => option.subject_name || ''}
                  renderInput={params => <CustomTextField {...params} label='Mata Pelajaran' variant='outlined' />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <CustomTextField select fullWidth label='Type' value={selectedType} onChange={handleChange}>
                  {menuItems.map(item => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Box m={3} display='inline' />

              <Grid container justifyContent='center' alignItems='center' spacing={4}>
                {/* Jam Mulai */}
                <Grid item xs={12} sm={2} container justifyContent='center' alignItems='center'>
                  {subject && (
                    <Button
                      variant='contained'
                      color='success'
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <span>Mulai:</span>
                      <span>
                        {new Date(
                          selectedType === 'MASUK' ? subjectDetails.start_time_in : subjectDetails.end_time_in
                        ).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </Button>
                  )}
                </Grid>

                {/* Jam Selesai */}
                <Grid item xs={12} sm={2} container justifyContent='center' alignItems='center'>
                  {subject && (
                    <Button
                      variant='contained'
                      color='error'
                      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <span>Selesai:</span>
                      <span>
                        {new Date(
                          selectedType === 'MASUK' ? subjectDetails.start_time_out : subjectDetails.end_time_out
                        ).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </Button>
                  )}
                </Grid>

                {/* Deskripsi */}
                <Grid item xs={12} sm={12} container justifyContent='center' alignItems='center'>
                  {subject && (
                    <Button variant='outlined' color='secondary' sx={{ display: 'flex', alignItems: 'center' }}>
                      <span>{subjectDetails.description}</span>
                    </Button>
                  )}
                </Grid>
              </Grid>

              {subject && (
                <Grid container justifyContent='center' alignItems='center' sx={{ marginTop: 3 }}>
                  <Button
                    onClick={onSubmitSubjects}
                    variant='contained'
                    color='success'
                    disabled={selectedUsers.length === 0 || !isWithinTimeRangeSubjects()} // Disable button if outside time range
                  >
                    <Icon fontSize='1.125rem' icon='tabler:check' />
                    Simpan Absensi
                  </Button>
                </Grid>
              )}

              {unit && clas && subject && selectedType && (
                <AbsensiMataPelajaran
                  class_id={clas}
                  unit_id={unit}
                  onSelectionChange={handleSelectedUsers}
                  subject_id={subject}
                  type={selectedType}
                  endTime={selectedType === 'MASUK' ? subjectDetails.end_time_in : subjectDetails.end_time_out}
                />
              )}
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default AddForm
