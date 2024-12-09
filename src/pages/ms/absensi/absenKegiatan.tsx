import { useState, useEffect, useCallback } from 'react'
import { Card, Grid, Divider, CircularProgress, Select, MenuItem, FormControl } from '@mui/material'
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import TableHeader from 'src/pages/ms/absensi/TableHeaderKegiatan' // Ensure proper import of TableHeader
import axiosConfig from 'src/configs/axiosConfig'

interface AbsensiKegiatanProps {
  class_id: string
  unit_id: string
  activity_id: string
  type: string
  endTime: string
  onSelectionChange?: (selectedUsers: { userId: string; status: string }[]) => void
}

interface DataParams {
  school_id: number
  unit_id: string
  class_id: string
  activity_id: string
  type: string
}

const statusColorMap: { [key: string]: string } = {
  Present: '#28a745', // Green - visible in both modes
  Absent: '#dc3545', // Red - visible in both modes
  Late: '#fd7e14', // Orange - visible in both modes
  Excused: '#007bff', // Blue - visible in both modes
  Sick: '#6f42c1', // Purple - visible in both modes
  Permission: '#ffc107', // Yellow - visible in both modes
  Alpha: '#6c757d', // Grey - visible in both modes
  Leave: '#e83e8c', // Pink - visible in both modes
  'Out of Office': '#795548', // Brown - visible in both modes
  Holiday: '#ffd700', // Gold - visible in both modes
  'Early Leave': '#00bcd4' // Lightblue - visible in both modes
}

const AbsensiKegiatan = ({
  class_id,
  unit_id,
  onSelectionChange,
  activity_id,
  type,
  endTime
}: AbsensiKegiatanProps) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 })
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [absensiData, setAbsensiData] = useState<any[]>([])
  const [attendanceStatuses, setAttendanceStatuses] = useState<any[]>([])

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const params: DataParams = { school_id, unit_id, class_id, activity_id, type }
        const dataFromApi = await fetchAbsensiData(params)
        setAbsensiData(dataFromApi)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching absensi data:', error)
        setLoading(false)
      }
    }

    fetchData()

    // Fetch available attendance statuses (e.g., "Hadir", "Absen", "Telat") from the API
    const fetchAttendanceStatuses = async () => {
      try {
        const storedToken = window.localStorage.getItem('token')
        const response = await axiosConfig.get('/getStatus', {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + storedToken
          },
          params: {
            school_id,
            jenis: 'Attendance' // You can modify this as per your requirement
          }
        })

        setAttendanceStatuses(response.data) // Assuming the response is an array of status objects
      } catch (error) {
        console.error('Error fetching attendance statuses:', error)
      }
    }

    fetchAttendanceStatuses()
  }, [school_id, class_id, unit_id, activity_id, type])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    const selectedUsersArray = newSelection as string[]
    setSelectedUsers(selectedUsersArray)

    const selectedUsersWithStatus = selectedUsersArray.map(userId => {
      const selectedUser = absensiData.find(row => row.id === userId)
      const status = selectedUser?.status || getDefaultStatus()
      
      return { userId, status }
    })

    if (onSelectionChange) {
      onSelectionChange(selectedUsersWithStatus)
    }
  }

  const handleStatusChange = (userId: string, newStatus: string) => {
    const currentTime = new Date()

    // Convert current time and endTime to timestamps for accurate comparison
    const endTimeDate = new Date(endTime)
    const endTimeOnly = new Date().setHours(
      endTimeDate.getHours(),
      endTimeDate.getMinutes(),
      endTimeDate.getSeconds(),
      0
    )

    // Convert both to timestamps (in milliseconds)
    const currentTimestamp = currentTime.getTime()
    const endTimeTimestamp = endTimeOnly

    // Set status based on whether current time is before or after the end time
    const finalStatus = currentTimestamp < endTimeTimestamp ? 'Present' : 'Late'

    // Update the status in absensiData
    setAbsensiData(prevData =>
      prevData.map((row: any) => {
        if (row.id === userId) {

          return { ...row, status: newStatus || finalStatus }
        }

        return row
      })
    )

    // Update selectedUsers with the new status
    const updatedSelectedUsers = selectedUsers.map(user => {
      if (user === userId) {

        return { userId, status: newStatus || finalStatus }
      }
      const existingUser = absensiData.find(row => row.id === user)

      return existingUser
        ? { userId: user, status: existingUser.status || 'Present' }
        : { userId: user, status: 'Present' }
    })

    // Trigger onSelectionChange if provided
    if (onSelectionChange) {
      onSelectionChange(updatedSelectedUsers)
    }
  }

  const columns: GridColDef[] = [
    { field: 'no', headerName: 'No', width: 70 },
    { field: 'full_name', headerName: 'Nama Lengkap', flex: 0.175, minWidth: 340 },
    { field: 'class_name', headerName: 'Kelas', flex: 0.175, minWidth: 340 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.175,
      minWidth: 200,
      renderCell: params => {
        const userId = params.row.id
        const currentStatus = params.value || getDefaultStatus()

        return (
          <FormControl fullWidth sx={{ backgroundColor: 'transparent' }}>
            <Select
              value={currentStatus}
              onChange={e => handleStatusChange(userId, e.target.value)}
              sx={{
                backgroundColor: 'transparent',
                padding: 0,
                '& .MuiSelect-select': {
                  color: statusColorMap[currentStatus] || 'black',
                  padding: '8px 12px',
                  border: 'none'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                '& .MuiSelect-icon': {
                  color: statusColorMap[currentStatus] || 'black'
                }
              }}
            >
              {attendanceStatuses.map(status => (
                <MenuItem
                  key={status.id}
                  value={status.status}
                  sx={{ color: statusColorMap[status.status] || 'black' }}
                >
                  {status.status === 'Present'
                    ? 'Hadir'
                    : status.status === 'Absent'
                    ? 'Tidak Hadir'
                    : status.status === 'Late'
                    ? 'Terlambat'
                    : status.status === 'Excused'
                    ? 'Diterima'
                    : status.status === 'Sick'
                    ? 'Sakit'
                    : status.status === 'Permission'
                    ? 'Izin'
                    : status.status === 'Alpha'
                    ? 'Alpha'
                    : status.status === 'Leave'
                    ? 'Cuti'
                    : status.status === 'Out of Office'
                    ? 'Tidak di Kantor'
                    : status.status === 'Holiday'
                    ? 'Libur'
                    : status.status === 'Early Leave'
                    ? 'Pulang Awal'
                    : status.status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      }
    }
  ]

  // Helper function to determine the default status
  // Helper function to determine the default status
  const getDefaultStatus = () => {
    const currentTime = new Date()

    // Set the current time to have only hour, minute, and second (ignore the date part)
    const currentTimeOnly = new Date().setHours(
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds(),
      0
    )

    // Extract the time (hour, minute, second) from endTime string
    const endTimeDate = new Date(endTime)
    const endTimeOnly = new Date().setHours(
      endTimeDate.getHours(),
      endTimeDate.getMinutes(),
      endTimeDate.getSeconds(),
      0
    )

    // Compare current time (hours, minutes, seconds) to endTime (hours, minutes, seconds)
    return currentTimeOnly > endTimeOnly ? 'Late' : 'Present'
  }

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <Card>
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader value={value} handleFilter={handleFilter} />
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress color='secondary' />
            </div>
          ) : (
            <DataGrid
              autoHeight
              rowHeight={50}
              rows={absensiData}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[20, 40, 60, 100]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              checkboxSelection
              rowSelectionModel={selectedUsers}
              onRowSelectionModelChange={handleSelectionChange}
              sx={{
                '& .MuiDataGrid-cell': {
                  fontSize: '0.75rem'
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontSize: '0.75rem'
                }
              }}
            />
          )}
        </Card>
      </Grid>
    </Grid>
  )
}

const fetchAbsensiData = async (params: DataParams) => {
  try {
    const storedToken = window.localStorage.getItem('token')
    const customConfig = {
      params,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + storedToken
      }
    }

    const response = await axiosConfig.get('/list-absensi-kegiatan-by-userId', customConfig)

    return response.data
  } catch (error) {
    console.error('Error fetching absensi data:', error)
    throw error
  }
}

export default AbsensiKegiatan
