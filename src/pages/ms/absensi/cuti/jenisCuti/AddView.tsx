import React from 'react'

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
import axiosConfig from '../../../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'

interface ClassForm {
  cuti_name: string
  description: string
  status: 'ON' | 'OFF'
}

const schema = yup.object().shape({
  cuti_name: yup.string().required('Class cuti_name is required'),
  description: yup.string().required('Class Description is required'),
  status: yup.string().oneOf(['ON', 'OFF'], 'Invalid class status').required('Class Status is required')
})

const AddForm = () => {
  const router = useRouter()

  const defaultValues: ClassForm = {
    cuti_name: '',
    description: '',
    status: 'ON'
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

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  const onSubmit = (data: ClassForm) => {
    const formData = new FormData()
    formData.append('school_id', schoolId)
    formData.append('cuti_name', data.cuti_name.toUpperCase())
    formData.append('description', data.description.toUpperCase())
    formData.append('status', data.status)
    console.log(formData)

    const storedToken = window.localStorage.getItem('token')
    axiosConfig
      .post('/create-jenis-cuti', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Class!')
        router.push('/ms/absensi/cuti/jenisCuti')
      })
      .catch(() => {
        toast.error('Gagal menambahkan jenis Cuti!')
      })
  }

  return (
    <Card>
      <CardHeader title='Tambah Jenis Cuti' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Name Field */}
            <Grid item xs={6}>
              <Controller
                name='cuti_name'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Nama Kegiatan'
                    onChange={onChange}
                    placeholder='e.g. Class A'
                    error={Boolean(errors.cuti_name)}
                    helperText={errors.cuti_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
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
                name='description'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Deskripsi'
                    onChange={onChange}
                    rows={4}
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
                onClick={() => router.push('/ms/absensi/kegiatan')}
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
