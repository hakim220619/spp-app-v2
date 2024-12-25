import { ChangeEvent, forwardRef, useEffect, useState } from 'react'
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
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import dayjs from 'dayjs'

interface CustomInputProps {
  value: DateType
  label: string
  onChange: (event: ChangeEvent) => void
}

const CustomInput = forwardRef(({ ...props }: CustomInputProps, ref) => {
  return <CustomTextField fullWidth inputRef={ref} {...props} sx={{ width: '100%' }} />
})

const FormValidationSchema = () => {
  const { handleSubmit, control, setValue } = useForm()
  const router = useRouter()
  const { id } = router.query
  const storedToken = window.localStorage.getItem('token')
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id
  const [selectedJenisCuti, setSelectedJenisCuti] = useState<string>('') // Add jenis cuti state
  const [image, setImage] = useState<File | null>(null) // Image state
  const [jenisCuti, setJenisCuti] = useState<any[]>([]) // State to hold jenis cuti options
  const [start_date, setStartDate] = useState<Date | null>(null)
  const [end_date, setEndDate] = useState<Date | null>(null)
  const [full_name, setFullName] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  // Fetch Jenis Cuti options
  useEffect(() => {
    const fetchJenisCuti = async () => {
      try {
        const response = await axiosConfig.get(`/list-jenisCuti/?school_id=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setJenisCuti(response.data)
      } catch (error) {
        console.error('Error fetching jenisCuti:', error)
      }
    }
    fetchJenisCuti()
  }, [schoolId, storedToken])

  // Fetch existing data if editing
  useEffect(() => {
    if (storedToken && id) {
      axiosConfig
        .post(
          '/detailCuti',
          { id },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          // console.log(response.data)

          const { full_name, cuti_type_id, description, status, start_date, end_date, notes } = response.data
          setStartDate(dayjs(start_date).toDate())
          setEndDate(dayjs(end_date).toDate())
          setSelectedJenisCuti(cuti_type_id)
          setFullName(full_name)
          setNotes(notes)

          setValue('full_name', full_name)
          setValue('cuti_type_id', cuti_type_id)
          setValue('description', description)
          setValue('status', status)
          setValue('start_date', dayjs(start_date).toDate()) // Set start date
          setValue('end_date', dayjs(end_date).toDate()) // Set end date
          setValue('notes', notes)
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }
  }, [id, storedToken, setValue])

  const onSubmit = async (data: any) => {
    const formData = new FormData()
    formData.append('id', id as string)
    formData.append('jenis_cuti_id', selectedJenisCuti) // Use selected jenis cuti ID from state
    formData.append('status', data.status)
    formData.append('start_date', dayjs(data.start_date).toISOString())
    formData.append('end_date', dayjs(data.end_date).toISOString())
    formData.append('notes', data.notes.toUpperCase())

    // If there is an image file, append it to the formData
    if (image) {
      formData.append('gambar', image)
    }
    console.log(formData)

    if (storedToken) {
      try {
        await axiosConfig.post('/update-cuti', formData, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        toast.success('Successfully Updated!')
        router.push('/ms/absensi/cuti')
      } catch (error) {
        toast.error("Failed. This didn't work.")
      }
    }
  }

  return (
    <Card>
      <CardHeader title='Update Jenis Cuti' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='full_name'
                control={control}
                defaultValue={full_name}
                render={({ field }) => (
                  <CustomTextField
                    disabled
                    fullWidth
                    label='Nama'
                    placeholder='Name'
                    {...field} // Pass all the necessary props from react-hook-form
                  />
                )}
              />
            </Grid>
            {/* Jenis Cuti Selection */}
            <Grid item xs={12} sm={6} md={6}>
              <CustomTextField
                select
                fullWidth
                label='Jenis Cuti'
                value={selectedJenisCuti}
                onChange={e => setSelectedJenisCuti(e.target.value)}
              >
                {jenisCuti.map(item => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.cuti_name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='start_date'
                control={control}
                rules={{ required: 'Start time is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={start_date} // Use the Date object directly
                      onChange={(date: Date | null) => {
                        setStartDate(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy HH:mm'
                      dateFormat='dd/MM/yyyy HH:mm'
                      showTimeSelect
                      timeIntervals={15}
                      customInput={
                        <CustomInput
                          value={start_date ? (dayjs(start_date).format('HH:mm:ss') as any) : ''}
                          onChange={onChange}
                          label='Mulai Cuti'
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='end_date'
                control={control}
                rules={{ required: 'Start time is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={end_date} // Use the Date object directly
                      onChange={(date: Date | null) => {
                        setEndDate(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy HH:mm'
                      dateFormat='dd/MM/yyyy HH:mm'
                      showTimeSelect
                      timeIntervals={15}
                      customInput={
                        <CustomInput
                          value={end_date ? (dayjs(end_date).format('HH:mm:ss') as any) : ''}
                          onChange={onChange}
                          label='Selesai Cuti'
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6} md={6}>
              <Controller
                name='status'
                control={control}
                defaultValue={status}
                render={({ field }) => (
                  <CustomTextField select fullWidth label='Status' {...field}>
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='Rejected'>Ditolak</MenuItem>
                    <MenuItem value='Approved'>Diterima</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
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
                    // You can set the image state here if needed
                    setImage(file) // Assuming setImage is defined in your state
                  }
                }}
              />
            </Grid>
            {/* Notes */}
            <Grid item xs={12} sm={12} md={12}>
              <Controller
                name='notes'
                control={control}
                defaultValue={notes}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    rows={4}
                    multiline
                    label='Notes'
                    placeholder='Enter notes here'
                    {...field}
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
              <Link href='/ms/absensi/cuti' passHref>
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
