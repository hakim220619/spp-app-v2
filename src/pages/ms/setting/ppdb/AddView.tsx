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

interface FormData {
  unit_id: string
  years: string
  amount: string
  status: string
  school_id: any
  image: File | null
  address: string
  url: string
  target: string // Tambahkan properti target
}

const schema = yup.object().shape({
  unit_id: yup.string().required('Unit is required'),
  years: yup.string().required('Years is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than zero')
    .required('Amount is required'),
  target: yup
    .number()
    .typeError('Target must be a number')
    .positive('Target must be greater than zero')
    .required('Target is required'), // Validasi untuk target
  status: yup.string().required('Status is required'),
  address: yup.string().required('Address is required')
})

const PpdbSettingForm = () => {
  const router = useRouter()
  const [units, setUnits] = useState([])
  const [years, setYears] = useState([])
  const [unitName, setUnitName] = useState<string>('')
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)

  const defaultValues: FormData = {
    unit_id: '',
    years: '',
    amount: '',
    target: '', // Inisialisasi target
    status: 'ON',
    school_id: getDataLocal.school_id,
    image: null,
    address: '',
    url: unitName
  }

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axiosConfig.get('/getUnit', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        const filteredUnits = response.data.filter((unit: any) => unit.school_id === getDataLocal.school_id)
        setUnits(filteredUnits)
      } catch (error) {
        console.error('Failed to fetch units:', error)
        toast.error('Failed to load units')
      }
    }

    const fetchYears = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axiosConfig.get('/getYears', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        setYears(response.data)
      } catch (error) {
        console.error('Failed to fetch years:', error)
        toast.error('Failed to load years')
      }
    }

    fetchUnits()
    fetchYears()
  }, [])

  const onSubmit = async (data: FormData) => {
    const token = localStorage.getItem('token')

    const formData = new FormData()
    formData.append('unit_id', data.unit_id)
    formData.append('years', data.years)
    formData.append('amount', data.amount)
    formData.append('target', data.target) // Tambahkan target ke formData
    formData.append('status', data.status)
    formData.append('school_id', data.school_id)
    formData.append('address', data.address)
    formData.append('url', unitName)
    if (data.image) {
      formData.append('image', data.image)
    }

    try {
      const response = await axiosConfig.post('/create-setting-ppdb', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
      console.log(response)

      toast.success('Successfully submitted!')
      router.push('/ms/setting/ppdb')
    } catch (error) {
      console.error('Failed to submit form:', error)
      toast.error('Failed to submit form')
    }
  }

  const formatRupiah = (value: any) => {
    const numberString = value.replace(/[^,\d]/g, '').toString()
    const split = numberString.split(',')
    const sisa = split[0].length % 3
    let rupiah = split[0].substr(0, sisa)
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi)

    if (ribuan) {
      const separator = sisa ? '.' : ''
      rupiah += separator + ribuan.join('.')
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah

    return 'Rp ' + rupiah
  }

  return (
    <Card>
      <CardHeader title='Tambah Setting PPDB' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Input Unit */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='unit_id'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Unit'
                    onChange={event => {
                      const selectedUnit: any = units.find((unit: any) => unit.id === event.target.value)
                      if (selectedUnit) {
                        setUnitName(selectedUnit.unit_name) // Simpan nama unit yang dipilih
                      }
                      onChange(event)
                    }}
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

            {/* Input Tahun */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='years'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Tahun'
                    onChange={onChange}
                    error={Boolean(errors.years)}
                    helperText={errors.years?.message}
                  >
                    {years.map((year: any) => (
                      <MenuItem key={year.years_name} value={year.years_name}>
                        {year.years_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Input Jumlah */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='amount'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={formatRupiah(value || '')}
                    label='Jumlah Pembayaran'
                    onChange={e => {
                      const rawValue = e.target.value.replace(/[^,\d]/g, '')
                      onChange(rawValue) // Simpan nilai asli tanpa format
                    }}
                    error={Boolean(errors.amount)}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Grid>

            {/* Input Target */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='target'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Target'
                    onChange={e => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, '') // Hanya izinkan angka
                      onChange(rawValue) // Simpan nilai asli tanpa huruf
                    }}
                    error={Boolean(errors.target)}
                    helperText={errors.target?.message}
                  />
                )}
              />
            </Grid>

            {/* Input Status */}
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

            {/* Input Gambar */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='image'
                control={control}
                render={({ field: { onChange } }) => (
                  <CustomTextField
                    label='Image'
                    type='file'
                    name='gambar'
                    fullWidth
                    inputProps={{ accept: 'image/*' }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files?.[0]) {
                        onChange(e.target.files[0])
                      }
                    }}
                    error={Boolean(errors.image)}
                    helperText={errors.image?.message}
                  />
                )}
              />
            </Grid>
            {/* Input Address */}
            <Grid item xs={12} sm={12} md={12}>
              <Controller
                name='address'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    multiline
                    rows={3}
                    value={value}
                    label='Alamat'
                    onChange={onChange}
                    error={Boolean(errors.address)}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>

            {/* Tombol Submit */}
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Box m={1} display='inline' />
              <Button
                type='button'
                variant='contained'
                color='secondary'
                onClick={() => router.push('/ms/setting/ppdb')}
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

export default PpdbSettingForm
