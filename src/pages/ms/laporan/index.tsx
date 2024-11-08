import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Button, Grid, MenuItem } from '@mui/material'
import { ChangeEvent, forwardRef, useEffect, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker from 'react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import TabelReportPaymentDate from './TabelReportPaymentDate'
import { Box } from '@mui/system'
import axiosConfig from 'src/configs/axiosConfig'
import ReportByStudent from './siswa'
import TabelReportPaymentClass from './TabelReportPaymentClass'
import Icon from 'src/@core/components/icon'

// Custom input component for the DatePicker
const CustomInput = forwardRef(
  ({ ...props }: { value: DateType; label: string; error: boolean; onChange: (event: ChangeEvent) => void }, ref) => {
    return <CustomTextField fullWidth inputRef={ref} {...props} sx={{ width: '100%' }} />
  }
)

// Main Component
const PaymentInAdmin = () => {
  const userData = JSON.parse(localStorage.getItem('userData') as string)
  const schoolId = userData?.school_id // Use optional chaining for safety.

  const [dateOfBirth, setDateOfBirth] = useState<any>('') // Manage start date state.
  const [dateOfBirthLast, setDateOfBirthLast] = useState<any>('') // Manage end date state.
  const [formErrors, setFormErrors] = useState<{ date_of_birth?: string }>({})
  const [showPaymentTable, setShowPaymentTable] = useState(false) // State to control the visibility of the table
  const [showPaymentTableClass, setShowPaymentTableClass] = useState(false) // State to control the visibility of the table
  const [showPaymentTableStudent, setShowPaymentTableStudent] = useState(false) // State to control the visibility of the table
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null) // Menu anchor
  const [anchorClassEl, setAnchorClassEl] = useState<null | HTMLElement>(null) // Class menu anchor
  const openClassMenu = Boolean(anchorClassEl)
  const storedToken = window.localStorage.getItem('token')

  const [clas, setClas] = useState('') // State for selected class
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]) // New state for filtered classes

  // Functions to handle menu open/close
  const handleMenuClickDate = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setAnchorClassEl(null)
    setShowPaymentTableStudent(false)
    setShowPaymentTable(false)
    setShowPaymentTableClass(false)
  }

  const handleMenuClass = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorClassEl(event.currentTarget)
    setAnchorEl(null)
    setShowPaymentTableStudent(false)
    setShowPaymentTable(false)
    setShowPaymentTableClass(false)
  }

  const handleClassChange = (event: ChangeEvent<HTMLInputElement>) => {
    setClas(event.target.value)
    setShowPaymentTableClass(true)
  }

  // Handle start date change
  const handleDateChange = (date: any | null) => {
    setDateOfBirth(date)
    if (!date) {
      setFormErrors(prevErrors => ({ ...prevErrors, date_of_birth: 'Date of birth is required.' }))
    } else {
      setFormErrors(prevErrors => ({ ...prevErrors, date_of_birth: undefined }))
    }
  }

  // Handle end date change
  const handleDateChangeLast = (date: any | null) => {
    setDateOfBirthLast(date)
    if (!date) {
      setFormErrors(prevErrors => ({ ...prevErrors, date_of_birth: 'Date of birth is required.' }))
    } else {
      setFormErrors(prevErrors => ({ ...prevErrors, date_of_birth: undefined }))
    }
  }

  // Search button functionality
  const handleSearchClick = () => {
    if (dateOfBirth && dateOfBirthLast) {
      setShowPaymentTable(true) // Only show if both dates are selected
    }
  }

  // Search button functionality
  const handleSearchClickStudent = () => {
    setShowPaymentTableStudent(true) // Only show if both dates are selected
    setAnchorEl(null)
    setAnchorClassEl(null)
  }

  // Format date in YYYY-MM-DD format
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth() is zero-indexed
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axiosConfig.get(`/getClass/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setFilteredClasses(response.data)
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }
    fetchClasses()
  }, [schoolId, storedToken])

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Laporan Pembayaran
          </Typography>

          <Grid container spacing={2} justifyContent='left'>
            <Grid item xs={12} sm={4} md={3}>
              <Button type='button' variant='contained' color='info' fullWidth onClick={handleSearchClickStudent}>
                <Icon fontSize='1.125rem' icon='tabler:users' /> Siswa
              </Button>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <Button type='button' variant='contained' color='success' fullWidth onClick={handleMenuClickDate}>
                <Icon fontSize='1.125rem' icon='tabler:world' />
                Tanggal
              </Button>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <Button type='button' variant='contained' color='primary' fullWidth onClick={handleMenuClass}>
                <Icon fontSize='1.125rem' icon='tabler:building-pavilion' /> Kelas
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Class Menu */}
      {openClassMenu && (
        <>
          <Box m={1} display='inline' />
          <Card>
            {' '}
            <CardContent>
              <Box mt={2}>
                <CustomTextField select label='Kelas' value={clas} onChange={handleClassChange} fullWidth>
                  {filteredClasses.map((cls: any) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* Date Selection Inputs */}
      {anchorEl && (
        <>
          <Box m={1} display='inline' />

          <Card>
            <CardContent>
              <Grid container spacing={2} alignItems='center' style={{ marginTop: '10px' }}>
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
                <Box m={1} display='inline' />

                <Grid item xs={12} sm={2}>
                  <Button variant='contained' onClick={handleSearchClick} style={{ marginTop: '18px' }}>
                    Cari
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      <Box m={1} display='inline'></Box>

      {/* Show Payment Table */}
      {showPaymentTable && (
        <TabelReportPaymentDate
          school_id={schoolId}
          date_first={formatDate(dateOfBirth)}
          date_last={formatDate(dateOfBirthLast)}
        />
      )}
      {showPaymentTableClass && <TabelReportPaymentClass school_id={schoolId} class_id={clas} />}
      {showPaymentTableStudent && <ReportByStudent />}
    </>
  )
}

export default PaymentInAdmin
