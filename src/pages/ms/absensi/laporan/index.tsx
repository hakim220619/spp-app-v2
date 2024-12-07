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

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Imports
import axiosConfig from '../../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'
import Icon from 'src/@core/components/icon'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { Divider, MenuItem } from '@mui/material'
import { subject } from '@casl/ability'

interface FormValues {
  type: string
}

const AddForm = () => {
  const router = useRouter()

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id
  const storedToken = window.localStorage.getItem('token')

  const [selectedButton, setSelectedButton] = useState<string>('') // State to track selected button
  const [unit, setUnit] = useState<string>('') // State for unit selection
  const [units, setUnits] = useState<any[]>([]) // List of units
  const [clas, setClass] = useState<string>('') // State for class selection
  const [activity, setActivity] = useState<string>('') // State for activity selection
  const [subject, setSubject] = useState<string>('') // State for activity selection
  const [activityDetails, setActivityDetails] = useState<any>({}) // State for selected activity details
  const [subjectDetails, setSubjectsDetails] = useState<any>({}) // State for selected activity details

  const [filteredClasses, setFilteredClasses] = useState<any[]>([]) // Filtered classes based on selected unit
  const [activities, setActivities] = useState<any[]>([]) // List of activitiesz
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<{ userId: string; status: string }[]>([])
  const [selectedType, setSelectedType] = useState('')

  const menuItems = ['MASUK', 'KELUAR']

  // Menangani perubahan nilai yang dipilih
  const handleChange = (event: any) => {
    setSelectedType(event.target.value)
  }

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

    formData.append('type', 'MASUK')

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

  const onSubmitSubjects = () => {
    const formData = new FormData()

    // Append form values to formData
    formData.append('school_id', schoolId)
    formData.append('unit_id', unit)
    formData.append('class_id', clas) // Add class_id to the form data
    formData.append('subject_id', subject)

    formData.append('type', 'MASUK')

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
    </Card>
  )
}

export default AddForm
