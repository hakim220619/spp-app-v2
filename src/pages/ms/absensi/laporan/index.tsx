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

// ** Custom Imports
import axiosConfig from '../../../../configs/axiosConfig'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { Divider } from '@mui/material'
import ListAbsensiKegiatan from './listAbsensiKegiatan'
import ListAbsensiMataPelajaran from './ListAbsensiMataPelajaran'

const AddForm = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id
  const storedToken = window.localStorage.getItem('token')

  const [selectedButton, setSelectedButton] = useState<string>('') // State to track selected button
  const [unit, setUnit] = useState<string>('')
  const [unitName, setUnitName] = useState<string>('')
  const [activityName, setActivityName] = useState<string>('')
  const [units, setUnits] = useState<any[]>([]) // List of units
  const [clas, setClass] = useState<string>('') // State for class selection
  const [activity, setActivity] = useState<string>('') // State for activity selection
  const [month, setMonth] = useState<string>('') // State for activity selection
  const [year, setYear] = useState<number | null>(null)
  const [yearSubject, setYearSubject] = useState<number | null>(null)
  const [activityDetails, setActivityDetails] = useState<any>({}) // State for selected activity details
  const [subjectDetails, setSubjectsDetails] = useState<any>({}) // State for selected activity details
  const [subject, setSubject] = useState<string>('')

  const [filteredClasses, setFilteredClasses] = useState<any[]>([]) // Filtered classes based on selected unit
  const [activities, setActivities] = useState<any[]>([]) // List of activitiesz
  const [months, setMonths] = useState<any[]>([]) // List of activitiesz
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<{ userId: string; status: string }[]>([])
  const [selectedType] = useState('')
  console.log(selectedUsers)

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
    const fetchMonths = async () => {
      try {
        const response = await axiosConfig.get(`/getMonths/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })

        setMonths(response.data)
      } catch (error) {
        console.error('Error fetching subjects:', error)
      }
    }

    fetchUnits()
    if (unit) fetchClasses()
    fetchActivities()
    fetchMonths()

    // Fetch subjects only when class (clas) changes
    if (clas) {
      fetchSubjects()
    }
  }, [schoolId, storedToken, unit, clas]) // Add clas dependency to re-fetch subjects

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

    // Extract year from start_time_in
    const yearss = newValue ? new Date(newValue.start_time_in).getFullYear() : null
    setYear(yearss)

    // Set the correct start time (start_time_in or start_time_out) based on selectedType
    setActivityDetails(
      newValue
        ? {
            start_time_in: formatDate(newValue.start_time_in), // Format start_time_in
            end_time_in: formatDate(newValue.end_time_in),
            description: newValue.description
          }
        : {}
    )
  }

  const handleSubjectChange = (event: any, newValue: any) => {
    setSubject(newValue ? newValue.id : '')
    const yearss = newValue ? new Date(newValue.start_time_in).getFullYear() : null
    console.log(yearss)

    setYearSubject(yearss)

    // Set the correct start time (start_time_in or start_time_out) based on selectedType
    setSubjectsDetails(
      newValue
        ? {
            start_time_in: newValue.start_time_in, // Format start_time_in
            end_time_in: newValue.end_time_in,

            // start_time_out: newValue.start_time_out, // Format start_time_out
            // end_time_out: newValue.end_time_out,
            description: newValue.description
          }
        : {}
    )
  }

  return (
    <Card>
      <CardHeader title='Laporan Absensi' />
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
                    setUnit(newValue ? newValue.id : '')
                    setClass('')
                    setUnitName(newValue.unit_name)
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
                  onChange={(event, newValue) => {
                    handleActivityChange(event, newValue)
                    setActivityName(newValue ? newValue.activity_name : '') // Set the activity name here
                  }}
                  id='autocomplete-activity'
                  getOptionLabel={option => option.activity_name || ''}
                  renderInput={params => <CustomTextField {...params} label='Kegiatan' variant='outlined' />}
                />
              </Grid>

              {/* Activity Selection */}
              <Grid item xs={12} sm={3}>
                <CustomAutocomplete
                  fullWidth
                  value={months.find(monthObj => monthObj.month === month) || null} // Pastikan bulan yang dipilih ada dalam daftar months
                  options={months}
                  onChange={(event, newValue) => {
                    setMonth(newValue ? newValue.month : '') // Update month berdasarkan pemilihan
                  }}
                  id='autocomplete-month'
                  getOptionLabel={option => option.month || ''} // Ambil label bulan
                  renderInput={params => <CustomTextField {...params} label='Bulan' variant='outlined' />}
                />
              </Grid>

              <Box m={3} display='inline' />

              {/* Render AbsensiKegiatan based on selected unit and class */}
              {unit && clas && activity && month && (
                <ListAbsensiKegiatan
                  class_id={clas}
                  unit_id={unit}
                  unit_name={unitName}
                  activity_name={activityName}
                  onSelectionChange={handleSelectedUsers}
                  activity_id={activity}
                  type={selectedType}
                  selectedMonth={month}
                  year={year}
                  endTime={activityDetails.end_time_in}
                />
              )}
            </>
          )}

          {selectedButton === 'mataPelajaran' && (
            <>
              {/* Unit and Class Selection */}
              <Grid item xs={12} sm={3}>
                <CustomAutocomplete
                  fullWidth
                  value={units.find(unitObj => unitObj.id === unit) || null} // Correctly set the value
                  options={units}
                  onChange={(event, newValue) => {
                    setUnit(newValue ? newValue.id : '') // Set unit ID based on selection
                    setClass('')
                    setUnitName(newValue.unit_name)
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
                  value={subjects.find(subjectObj => subjectObj.id === subject) || null} // Correctly set the value
                  options={subjects}
                  onChange={(event, newValue) => {
                    handleSubjectChange(event, newValue)
                    setActivityName(newValue ? newValue.subject_name : '') // Set the activity name here
                  }}
                  id='autocomplete-subject'
                  getOptionLabel={option => option.subject_name || ''}
                  renderInput={params => <CustomTextField {...params} label='Mata Pelajaran' variant='outlined' />}
                />
              </Grid>
              {/* Activity Selection */}
              <Grid item xs={12} sm={3}>
                <CustomAutocomplete
                  fullWidth
                  value={months.find(monthObj => monthObj.month === month) || null} // Pastikan bulan yang dipilih ada dalam daftar months
                  options={months}
                  onChange={(event, newValue) => {
                    setMonth(newValue ? newValue.month : '') // Update month berdasarkan pemilihan
                  }}
                  id='autocomplete-month'
                  getOptionLabel={option => option.month || ''} // Ambil label bulan
                  renderInput={params => <CustomTextField {...params} label='Bulan' variant='outlined' />}
                />
              </Grid>

              <Box m={3} display='inline' />

              {/* Render AbsensiKegiatan based on selected unit and class */}
              {unit && clas && subject && month && (
                <ListAbsensiMataPelajaran
                  class_id={clas}
                  unit_id={unit}
                  unit_name={unitName}
                  activity_name={activityName}
                  onSelectionChange={handleSelectedUsers}
                  subject_id={subject}
                  type={selectedType}
                  selectedMonth={month}
                  year={yearSubject}
                  endTime={subjectDetails.end_time_in}
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
