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
import axiosConfig from '../../../../../configs/axiosConfig'
import { useRouter } from 'next/router'
import Link from 'next/link'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'

const FormValidationSchema = () => {
  const { handleSubmit, control, setValue } = useForm()
  const router = useRouter()
  const { id } = router.query
  const storedToken = window.localStorage.getItem('token')
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  const [cuti_name, setCutiName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [status, setStatus] = useState<'ON' | 'OFF'>('ON')
  console.log(description)

  // Fetch class details
  useEffect(() => {
    if (storedToken && id) {
      axiosConfig
        .post(
          '/detailJenisCuti',
          { id },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { cuti_name, description, status } = response.data
          setCutiName(cuti_name)
          setDescription(description)
          setStatus(status)

          // Set default values for react-hook-form
          setValue('cuti_name', cuti_name)
          setValue('description', description)
          setValue('status', status)
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }
  }, [id, storedToken, setValue])

  const onSubmit = (data: any) => {
    const formData = {
      id,
      school_id: schoolId,
      cuti_name: data.cuti_name.toUpperCase(),
      description: data.description.toUpperCase(),
      status: data.status
    }

    if (storedToken) {
      axiosConfig
        .post(
          '/update-jenis-cuti',
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
          router.push('/ms/absensi/cuti/jenisCuti')
        })
        .catch(() => {
          toast.error("Failed. This didn't work.")
        })
    }
  }

  return (
    <Card>
      <CardHeader title='Update Jenis Cuti' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Name Field */}
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='cuti_name'
                control={control}
                defaultValue={cuti_name}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Nama Kegiatan'
                    placeholder='Name'
                    {...field} // Pass all the necessary props from react-hook-form
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='status'
                control={control}
                defaultValue={status}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Status'
                    {...field} // Pass all the necessary props from react-hook-form
                  >
                    <MenuItem value='ON'>ON</MenuItem>
                    <MenuItem value='OFF'>OFF</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    rows={4}
                    multiline
                    label='Description'
                    placeholder='Description'
                    {...field} // Pass all the necessary props from react-hook-form
                  />
                )}
              />
            </Grid>
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Save
              </Button>
              <Box m={1} display='inline'></Box>
              <Link href='/ms/absensi/cuti/jenisCuti' passHref>
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
