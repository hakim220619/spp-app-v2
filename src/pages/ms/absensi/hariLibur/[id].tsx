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
  const {
    handleSubmit,
    control,
    setValue
  } = useForm()
  const router = useRouter()
  const { id } = router.query
  const storedToken = window.localStorage.getItem('token')
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  const [holiday_name, setHolidayName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [holiday_date, setHolidayDate] = useState<Date | null>(null)
  const [status, setStatus] = useState<'ON' | 'OFF'>('ON')
  console.log(description)

  // Fetch class details
  useEffect(() => {
    if (storedToken && id) {
      axiosConfig
        .post(
          '/detailHoliday',
          { id },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { holiday_name, holiday_date, description, status } = response.data
          setHolidayName(holiday_name)
          setHolidayDate(holiday_date)
          setDescription(description)
          setStatus(status)

          // Set default values for react-hook-form
          setValue('holiday_name', holiday_name)
          setValue('holiday_date', dayjs(holiday_date).toDate())
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
      holiday_name: data.holiday_name.toUpperCase(),
      holiday_date: dayjs(data.holiday_date).format('YYYY-MM-DD'),
      description: data.description.toUpperCase(),
      status: data.status
    }

    if (storedToken) {
      axiosConfig
        .post(
          '/update-holiday',
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
          router.push('/ms/absensi/hariLibur')
        })
        .catch(() => {
          toast.error("Failed. This didn't work.")
        })
    }
  }

  return (
    <Card>
      <CardHeader title='Update Hari Libur' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Name Field */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='holiday_name'
                control={control}
                defaultValue={holiday_name}
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
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='holiday_date'
                control={control}
                rules={{ required: 'Tanggal is required' }}
                render={({ field: { onChange } }) => (
                  <DatePickerWrapper>
                    <DatePicker
                      selected={holiday_date ? dayjs(holiday_date).toDate() : null} // Ensure valid date object
                      onChange={(date: Date | null) => {
                        setHolidayDate(date) // Update the state with the selected date
                        onChange(date) // Sync with react-hook-form
                      }}
                      placeholderText='dd/MM/yyyy'
                      dateFormat='dd/MM/yyyy' // Format to display only date
                      customInput={
                        <CustomInput
                          value={holiday_date ? (dayjs(holiday_date) as any) : ''} // Check if the value is valid
                          onChange={onChange}
                          label='Tanggal'
                        />
                      }
                    />
                  </DatePickerWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
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
              <Link href='/ms/absensi/hariLibur' passHref>
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
