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
import TabelReportPaymentPaidorPending from './TabelReportPaymentPaidorPendning'

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
  const [showPaymentTablePaidorPending, setShowPaymentTablePaidorPending] = useState(false) // State to control the visibility of the table
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null) // Menu anchor
  const [anchorClassEl, setAnchorClassEl] = useState<null | HTMLElement>(null) // Class menu anchor
  const [anchorPaidorPendingEl, setAnchorPaidorPendingEl] = useState<null | HTMLElement>(null) // Class menu anchor
  const [months, setMonths] = useState<any[]>([])
  const [years, setYears] = useState([])
  const openClassMenu = Boolean(anchorClassEl)
  const openPaidorPending = Boolean(anchorPaidorPendingEl)
  const storedToken = window.localStorage.getItem('token')
  const [status, setStatus] = useState('')
  const [clas, setClas] = useState('')
  const [year, setYear] = useState('')
  const [mont, setMont] = useState('')
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]) // New state for filtered classes
  const [selectedButton, setSelectedButton] = useState<string>('') // State to track selected button

  // Functions to handle menu open/close
  const handleMenuClickDate = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setAnchorClassEl(null)
    setAnchorPaidorPendingEl(null)
    setShowPaymentTableStudent(false)
    setShowPaymentTable(false)
    setShowPaymentTableClass(false)
    setShowPaymentTablePaidorPending(false)
  }

  const handleMenuClass = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorClassEl(event.currentTarget)
    setAnchorEl(null)
    setAnchorPaidorPendingEl(null)

    setShowPaymentTableStudent(false)
    setShowPaymentTable(false)
    setShowPaymentTableClass(false)
    setShowPaymentTablePaidorPending(false)
  }
  const handleMenuLunasorBelumLunas = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorPaidorPendingEl(event.currentTarget)
    setAnchorEl(null)
    setAnchorClassEl(null)

    setShowPaymentTableStudent(false)
    setShowPaymentTable(false)
    setShowPaymentTableClass(false)
  }

  const handleClassChange = (event: ChangeEvent<HTMLInputElement>) => {
    setClas(event.target.value)
    setShowPaymentTableClass(true)
    setShowPaymentTablePaidorPending(true) // Trigger visibility based on class change
  }

  const handleClassChangePaidorPend = (event: ChangeEvent<HTMLInputElement>) => {
    setClas(event.target.value)
    setShowPaymentTablePaidorPending(true)
  }

  const handleYearsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYear(event.target.value)
    setShowPaymentTablePaidorPending(true)
  }

  const handleMonthsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMont(event.target.value)
    setShowPaymentTablePaidorPending(true)
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

  const handleStatusChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStatus(event.target.value)
    setShowPaymentTablePaidorPending(true) // Trigger visibility for paid/pending table
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
        console.error('Error fetching months:', error)
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
      }
    }
    fetchClasses()
    fetchMonths()
    fetchYears()
  }, [schoolId, storedToken])

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Laporan Pembayaran
          </Typography>

          <Grid container spacing={2} justifyContent='left'>
            <Grid item xs={12} sm={4} md={2}>
              <Button
                type='button'
                variant='contained'
                color={selectedButton === 'siswa' ? 'primary' : 'secondary'} // Conditionally set color
                fullWidth
                onClick={() => {
                  handleSearchClickStudent() // Existing functionality
                  setSelectedButton('siswa') // Update selected button
                }}
              >
                <Icon fontSize='1.125rem' icon='tabler:users' /> Siswa
              </Button>
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <Button
                type='button'
                variant='contained'
                color={selectedButton === 'tanggal' ? 'primary' : 'secondary'}
                fullWidth
                onClick={e => {
                  handleMenuClickDate(e) // Pass the event here
                  setSelectedButton('tanggal') // Update the selected button state
                }}
              >
                <Icon fontSize='1.125rem' icon='tabler:world' />
                Tanggal
              </Button>
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <Button
                type='button'
                variant='contained'
                color={selectedButton === 'kelas' ? 'primary' : 'secondary'} // Check if 'kelas' is selected
                fullWidth
                onClick={e => {
                  handleMenuClass(e) // Pass the event to the handler
                  setSelectedButton('kelas') // Update selected button state to 'kelas'
                }}
              >
                <Icon fontSize='1.125rem' icon='tabler:building-pavilion' />
                Kelas
              </Button>
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <Button
                type='button'
                variant='contained'
                color={selectedButton === 'lunas' ? 'primary' : 'secondary'} // Check if 'lunas' is selected
                fullWidth
                onClick={e => {
                  handleMenuLunasorBelumLunas(e) // Pass the event to the handler
                  setSelectedButton('lunas') // Update selected button state to 'lunas'
                }}
              >
                <Icon fontSize='1.125rem' icon='tabler:home-dollar' />
                Lunas / Belum Lunas
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
      {openPaidorPending && (
        <>
          <Box m={1} display='inline' />
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <CustomTextField select label='Kelas' value={clas} onChange={handleClassChangePaidorPend} fullWidth>
                    {filteredClasses.map((cls: any) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.class_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <CustomTextField select label='Tahun' value={year} onChange={handleYearsChange} fullWidth>
                    {years.map((a: any) => (
                      <MenuItem key={a.years_name} value={a.years_name}>
                        {a.years_name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <CustomTextField select label='Bulan' value={mont} onChange={handleMonthsChange} fullWidth>
                    {months.map((a: any) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.month}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <CustomTextField
                    select
                    label='Status Pembayaran'
                    value={status}
                    onChange={handleStatusChange}
                    fullWidth
                  >
                    <MenuItem value='Paid'>Lunas</MenuItem>
                    <MenuItem value='Pending'>Belum Lunas</MenuItem>
                  </CustomTextField>
                </Grid>
              </Grid>
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
      {showPaymentTablePaidorPending && (
        <TabelReportPaymentPaidorPending
          school_id={schoolId}
          class_id={clas}
          status={status}
          years={year}
          month={mont}
        />
      )}
    </>
  )
}

export default PaymentInAdmin
