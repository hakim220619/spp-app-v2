import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Button, Grid } from '@mui/material'
import { ChangeEvent, forwardRef, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'

// import TabelReportPaymentDate from './TabelReportPaymentDate'

const CustomInput = forwardRef(
  ({ ...props }: { value: DateType; label: string; error: boolean; onChange: (event: ChangeEvent) => void }, ref) => {
    return <CustomTextField fullWidth inputRef={ref} {...props} sx={{ width: '100%' }} />
  }
)

// Main Component
const PaymentInAdmin = () => {
  //   const userData = JSON.parse(localStorage.getItem('userData') as string)

  //   const storedToken = localStorage.getItem('token') // Ensure token is handled properly if used.
  //   const schoolId = userData?.school_id // Use optional chaining for safety.

  const [dateOfBirth, setDateOfBirth] = useState<any>('') // Manage date state.
  const [dateOfBirthLast, setDateOfBirthLast] = useState<any>('') // Manage date state.
  const [formErrors, setFormErrors] = useState<{ date_of_birth?: string }>({})
  const [showPaymentTable, setShowPaymentTable] = useState(false) // State to control the visibility of the table

  const handleDateChange = (date: any | null) => {
    setDateOfBirth(date)
    if (!date) {
      setFormErrors(prevErrors => ({ ...prevErrors, date_of_birth: 'Date of birth is required.' }))
    } else {
      setFormErrors(prevErrors => ({ ...prevErrors, date_of_birth: undefined }))
    }
  }

  const handleDateChangeLast = (date: any | null) => {
    setDateOfBirthLast(date)
    if (!date) {
      setFormErrors(prevErrors => ({ ...prevErrors, date_of_birth: 'Date of birth is required.' }))
    } else {
      setFormErrors(prevErrors => ({ ...prevErrors, date_of_birth: undefined }))
    }
  }

  const handleSearchClick = () => {
    // Logic to show the payment table when the button is clicked
    if (dateOfBirth && dateOfBirthLast) {
      setShowPaymentTable(true) // Only show if both dates are selected
    } else {
      // You might want to show a notification or message indicating that both dates are required
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Laporan Pembayaran
        </Typography>

        <Grid container spacing={2} alignItems='center'>
          {/* Date of Birth Selection */}
          <Grid item xs={12} sm={4}>
            <DatePickerWrapper>
              <DatePicker
                selected={dateOfBirth}
                onChange={handleDateChange}
                placeholderText='MM/DD/YYYY'
                dateFormat='MM/dd/yyyy'
                customInput={
                  <CustomInput
                    value={dateOfBirth ? dateOfBirth.toLocaleDateString('en-US') : ''}
                    label='Tanggal Mulai'
                    error={!!formErrors.date_of_birth}
                    onChange={() => {
                      console.log('asd')
                    }}
                  />
                }
              />
            </DatePickerWrapper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePickerWrapper>
              <DatePicker
                selected={dateOfBirthLast}
                onChange={handleDateChangeLast}
                placeholderText='MM/DD/YYYY'
                dateFormat='MM/dd/yyyy'
                customInput={
                  <CustomInput
                    value={dateOfBirthLast ? dateOfBirthLast.toLocaleDateString('en-US') : ''}
                    label='Tanggal Akhir'
                    error={!!formErrors.date_of_birth}
                    onChange={() => {
                      console.log('asd')
                    }}
                  />
                }
              />
            </DatePickerWrapper>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant='contained' onClick={handleSearchClick} style={{ marginTop: '18px' }}>
              Cari
            </Button>
          </Grid>
        </Grid>

        {/* Show Payment Table */}
        {showPaymentTable && (
          <p>asd</p>

          //   <TabelReportPaymentDate
          //     date_first={dateOfBirth}
          //     date_last={dateOfBirthLast}
          //     // Add other necessary props here
          //   />
        )}
      </CardContent>
    </Card>
  )
}

export default PaymentInAdmin
