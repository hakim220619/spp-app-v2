// Other imports remain the same
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Button, Grid } from '@mui/material'
import axiosConfig from 'src/configs/axiosConfig'
import { useCallback, useEffect, useState } from 'react'
import { GridSearchIcon } from '@mui/x-data-grid'
import TabelPaymentMonth from 'src/pages/ms/pembayaran/v2/admin/TabelPaymentMonth'
import UserDetailsCard from './userDetail'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import CustomTextField from 'src/@core/components/mui/text-field'

const PaymentInAdmin = () => {
  const userData = JSON.parse(localStorage.getItem('userData') as string)
  const storedToken = window.localStorage.getItem('token')
  const schoolId = userData.school_id
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [unit, setUnit] = useState<string>('')
  const [units, setUnits] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [showTable, setShowTable] = useState<boolean>(false)
  const [searchParams, setSearchParams] = useState({ schoolId: '', unitId: '', userId: '' })
  const [userDetails, setUserDetails] = useState<any>(null)
  console.log(userDetails)

  // Fetch units and users
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

    const fetchUsers = async () => {
      try {
        const response = await axiosConfig.get(`/list-siswa/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        setUsers(response.data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUnits()
    fetchUsers()
  }, [schoolId, storedToken])

  // Filter users based on the selected unit
  useEffect(() => {
    if (unit) {
      const filtered = users.filter(user => user.unit_id === unit && user.school_id === schoolId)
      setFilteredUsers(filtered)
    } else {
      const filtered = users.filter(user => user.school_id === schoolId)
      setFilteredUsers(filtered)
    }
  }, [unit, users, schoolId])

  // Handle Search
  const onSearch = useCallback(() => {
    if (selectedUser) {
      setSearchParams({ schoolId, unitId: unit, userId: selectedUser });
      setShowTable(true);  // Show table only after setting searchParams
    } else {
      setShowTable(false);
    }
  }, [unit, selectedUser, schoolId]);
  useEffect(() => {
    if (selectedUser) {
      onSearch(); // Trigger search automatically after user selection
    }
  }, [selectedUser]); // This effect will run when selectedUser changes


  return (
    <>
      <Card>
        <CardContent>


          <Grid container spacing={3} alignItems="center">
            {/* Siswa Selection Text */}
            <Grid item xs={12} sm={12} alignItems="center">
              <Typography>Pilih Siswa
                Untuk dapat memproses transaksi tagihan</Typography>
            </Grid>

            {/* Unit Selection */}
            <Grid item xs={6} sm={6}>
              <CustomAutocomplete
                fullWidth
                value={units.find(unitObj => unitObj.id === unit) || null} // Correctly set the value
                options={units}
                onChange={(event, newValue) => {
                  setUnit(newValue ? newValue.id : '') // Set unit ID based on selection
                  setUserDetails(null) // Reset user details on unit change
                  setShowTable(false)
                }}
                id="autocomplete-unit"
                getOptionLabel={option => option.unit_name || ''}
                renderInput={params => <CustomTextField {...params} label="Unit" variant="outlined" />}
              />
            </Grid>

            {/* Siswa Selection */}
            <Grid item xs={6} sm={6}>
              <CustomAutocomplete
                fullWidth
                value={filteredUsers.find(user => user.id === selectedUser) || null}
                options={filteredUsers}
                onChange={(event, newValue) => {
                  setSelectedUser(newValue ? newValue.id : '')
                  const userDetail = newValue ? users.find(user => user.id === newValue.id) : null
                  setUserDetails(userDetail || null)
                  setShowTable(userDetail ? true : false)

                  // Automatically trigger search when user is selected
                  if (newValue) {
                    onSearch() // This will trigger the search
                  }
                }}
                id="autocomplete-siswa"
                getOptionLabel={option => option.full_name || ''}
                renderInput={params => <CustomTextField {...params} label="Siswa" variant="outlined" />}
              />
            </Grid>
          </Grid>


          {/* Display User Details */}
          {userDetails ? (
            <>
              <Box m={3} display='inline'></Box>

              <UserDetailsCard userDetails={userDetails} />
            </>
          ) : (
            <Typography variant='body2' color='textSecondary'></Typography>
          )}
        </CardContent>
      </Card>
      <Box m={3} display='inline'></Box>

      {/* Show Payment Table */}
      {showTable && searchParams.schoolId && searchParams.userId && (
        <Card>
          <CardContent>
            <TabelPaymentMonth
              school_id={searchParams.schoolId}
              unit_id={searchParams.unitId}
              uid={searchParams.userId}
            />
          </CardContent>
        </Card>
      )}

    </>
  )
}

export default PaymentInAdmin
