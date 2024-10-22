import { ChangeEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

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

const FormValidationSchema = () => {
  const { handleSubmit } = useForm()
  const router = useRouter()
  const { id } = router.query

  // State variables
  const [storedToken, setStoredToken] = useState('')
  const [unitId, setUnitId] = useState('')
  const [target, setTarget] = useState('')
  const [years, setYears] = useState([])
  const [year, setYear] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('')
  const [address, setAddress] = useState('')
  const [school_id, setSchoolId] = useState('')
  const [units, setUnits] = useState([])
  const [image, setImage] = useState<File | null>(null)

  // Fetch token from localStorage
  useEffect(() => {
    const token = window.localStorage.getItem('token')
    if (token) {
      setStoredToken(token)
    } else {
      console.error('No token found')
    }
  }, [])

  // Fetch units
  useEffect(() => {
    const fetchUnits = async () => {
      if (!storedToken) return

      try {
        const response = await axiosConfig.get('/getUnit', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })

        const userData = JSON.parse(localStorage.getItem('userData') as any)
        const schoolId = userData?.school_id

        if (schoolId) {
          const filteredUnits = response.data.filter((unit: any) => unit.school_id === schoolId)
          setUnits(filteredUnits)
        } else {
          console.warn('No school_id found in userData')
          setUnits([])
        }
      } catch (error) {
        console.error('Failed to fetch units:', error)
        toast.error('Failed to load units')
      }
    }

    fetchUnits()
  }, [storedToken])

  // Fetch years and detail settings
  useEffect(() => {
    const fetchYears = async () => {
      if (!storedToken) return

      try {
        const response = await axiosConfig.get('/getYears', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setYears(response.data)
      } catch (error) {
        console.error('Failed to fetch years:', error)
        toast.error('Failed to load years')
      }
    }

    const fetchDetailSettings = async () => {
      if (!storedToken || !id) return

      try {
        const response = await axiosConfig.post(
          '/detailPpdbSetting',
          { id },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )

        const { unit_id, target, years, amount, status, address, school_id } = response.data
        setUnitId(unit_id)
        setTarget(target)
        setYear(years)
        setAmount(amount)
        setStatus(status)
        setAddress(address)
        setSchoolId(school_id)
      } catch (error) {
        console.error('Error fetching class details:', error)
        toast.error('Failed to load class details')
      }
    }

    fetchYears()
    fetchDetailSettings()
  }, [storedToken, id])

  const onSubmit = async () => {
    const formData = new FormData() // Membuat instance FormData

    // Menambahkan data ke formData
    formData.append('id', id as any)
    formData.append('unit_id', unitId)
    formData.append('target', target)
    formData.append('years', year)
    formData.append('amount', amount)
    formData.append('status', status)
    formData.append('address', address)
    formData.append('school_id', school_id)

    // Jika ada gambar, tambahkan ke formData
    if (image) {
      formData.append('image', image) // Menambahkan file image
    }
    console.log(formData)

    if (storedToken) {
      try {
        await axiosConfig.post('/update-ppdb-setting', formData, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'multipart/form-data' // Tambahkan header ini untuk mengirim FormData
          }
        })
        toast.success('Successfully Updated!')
        router.push('/ms/setting/ppdb')
      } catch (error) {
        console.error('Error updating:', error)
        toast.error("Failed. This didn't work.")
      }
    }
  }

  const formatRupiah = (value: any) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const handleAmountChange = (e: any) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // Only numbers
    setAmount(value)
  }

  return (
    <Card>
      <CardHeader title='Update Setting PPDB' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Unit Selection */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomTextField select fullWidth label='Unit' value={unitId} onChange={e => setUnitId(e.target.value)}>
                {units.map((unit: any) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.unit_name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>

            {/* Target Field */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomTextField
                fullWidth
                label='Target'
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder='Target'
                type='number'
              />
            </Grid>

            {/* Years Field */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomTextField
                select
                fullWidth
                label='Tahun'
                value={year}
                onChange={(e: any) => setYear(e.target.value)}
              >
                {years.map((year: any) => (
                  <MenuItem key={year.years_name} value={year.years_name}>
                    {year.years_name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>

            {/* Amount Field */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomTextField
                fullWidth
                label='Jumlah'
                value={amount ? formatRupiah(amount) : ''}
                onChange={handleAmountChange}
                placeholder='Amount'
              />
            </Grid>

            {/* Status Field */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomTextField select fullWidth label='Status' value={status} onChange={e => setStatus(e.target.value)}>
                <MenuItem value='ON'>ON</MenuItem>
                <MenuItem value='OFF'>OFF</MenuItem>
              </CustomTextField>
            </Grid>

            {/* Image Upload Field */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomTextField
                fullWidth
                name='image'
                type='file'
                label='Gambar'
                InputLabelProps={{
                  shrink: true
                }}
                inputProps={{
                  accept: 'image/png, image/jpeg'
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    setImage(file)
                  }
                }}
              />
            </Grid>

            {/* Address Field */}
            <Grid item xs={12} sm={12} md={12}>
              <CustomTextField
                fullWidth
                label='Alamat'
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder='Address'
                multiline
                rows={3}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Save
              </Button>
              <Box m={1} display='inline' />
              <Link href='/ms/setting/ppdb' passHref>
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
