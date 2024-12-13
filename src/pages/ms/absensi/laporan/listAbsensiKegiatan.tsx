import { useState, useEffect, useCallback } from 'react'
import { Card, Grid, Divider, CircularProgress, Tooltip } from '@mui/material'
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import TableHeader from 'src/pages/ms/absensi/TableHeaderKegiatan' // Ensure proper import of TableHeader
import axiosConfig from 'src/configs/axiosConfig'
import Icon from 'src/@core/components/icon'

interface ListAbsensiKegiatanProps {
  class_id: string
  unit_id: string
  activity_id: string
  type: string
  endTime: string
  onSelectionChange?: (selectedUsers: { userId: string; status: string }[]) => void
  selectedMonth: string
  year: any
}

interface DataParams {
  q: string
  school_id: number
  unit_id: string
  class_id: string
  activity_id: string
  type: string
  selectedMonth: string
  year: string
}

const statusColorMap: { [key: string]: string } = {
  Present: '#28a745',
  Absent: '#dc3545',
  Late: '#fd7e14',
  Excused: '#007bff',
  Sick: '#6f42c1',
  Permission: '#ffc107',
  Alpha: '#6c757d',
  Leave: '#e83e8c',
  'Out of Office': '#795548',
  Holiday: '#ffd700',
  'Early Leave': '#00bcd4'
}

const monthNames = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER'
]

const ListAbsensiKegiatan = ({
  class_id,
  unit_id,
  onSelectionChange,
  activity_id,
  type,
  endTime,
  selectedMonth,
  year
}: ListAbsensiKegiatanProps) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 })
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [absensiData, setAbsensiData] = useState<any[]>([])
  const [attendanceStatuses, setAttendanceStatuses] = useState<any[]>([])

  const selectedMonthIndex = monthNames.indexOf(selectedMonth) + 1 // Convert month name to numeric month (1-12)
  console.log(attendanceStatuses)

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const params: DataParams = { q: value, school_id, unit_id, class_id, activity_id, type, selectedMonth, year }
        const dataFromApi = await fetchAbsensiData(params)
        setAbsensiData(dataFromApi)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching absensi data:', error)
        setLoading(false)
      }
    }

    fetchData()

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
            jenis: 'Attendance'
          }
        })

        setAttendanceStatuses(response.data)
      } catch (error) {
        console.error('Error fetching attendance statuses:', error)
      }
    }

    fetchAttendanceStatuses()
  }, [value, school_id, class_id, unit_id, activity_id, type, selectedMonthIndex, year])

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

  // Calculate the number of days in the selected month
  const daysInMonth = new Date(2024, selectedMonthIndex, 0).getDate()

  const baseColumns: GridColDef[] = [
    { field: 'no', headerName: 'No', width: 70 },
    { field: 'full_name', headerName: 'Nama Lengkap', flex: 0.2, minWidth: 340 },
    { field: 'class_name', headerName: 'Kelas', flex: 0.2, minWidth: 240 },
    {
      field: 'attendance_type',
      headerName: 'Type',
      width: 150,
      renderCell: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>MASUK</span>
          <span>KELUAR</span>
        </div>
      )
    }
  ]

  const attendanceColumns: GridColDef[] = []
  for (let i = 1; i <= daysInMonth; i++) {
    attendanceColumns.push({
      field: `day_${i}`, // Update field to combine both M and K
      headerName: `${i}`,
      width: 10, // Adjust width as needed
      renderCell: params => {
        const getStatusIcon = (status: string, colorMap: any) => {
          let icon = null
          let statusText = '-' // Default status text

          switch (status) {
            case 'Present':
              icon = <Icon fontSize='1.125rem' icon='tabler:check' color={colorMap['Present']} />
              statusText = 'Hadir'
              break
            case 'Absent':
              icon = <Icon fontSize='1.125rem' icon='tabler:x' color={colorMap['Absent']} />
              statusText = 'Absen'
              break
            case 'Late':
              icon = <Icon fontSize='1.125rem' icon='tabler:clock' color={colorMap['Late']} />
              statusText = 'Terlambat'
              break
            case 'Excused':
              icon = <Icon fontSize='1.125rem' icon='tabler:calendar-check' color={colorMap['Excused']} />
              statusText = 'Izin'
              break
            case 'Sick':
              icon = <Icon fontSize='1.125rem' icon='tabler:heartbeat' color={colorMap['Sick']} />
              statusText = 'Sakit'
              break
            case 'Permission':
              icon = <Icon fontSize='1.125rem' icon='tabler:shield-check' color={colorMap['Permission']} />
              statusText = 'Izin'
              break
            case 'Alpha':
              icon = <Icon fontSize='1.125rem' icon='tabler:user-off' color={colorMap['Alpha']} />
              statusText = 'Alpha'
              break
            case 'Leave':
              icon = <Icon fontSize='1.125rem' icon='tabler:airplane' color={colorMap['Leave']} />
              statusText = 'Cuti'
              break
            case 'Out of Office':
              icon = <Icon fontSize='1.125rem' icon='tabler:home' color={colorMap['Out of Office']} />
              statusText = 'Di Luar Kantor'
              break
            case 'Holiday':
              icon = <Icon fontSize='1.125rem' icon='tabler:sun' color={colorMap['Holiday']} />
              statusText = 'Libur'
              break
            case 'Early Leave':
              icon = <Icon fontSize='1.125rem' icon='tabler:logout' color={colorMap['Early Leave']} />
              statusText = 'Pulang Cepat'
              break
            default:
              icon = '-'
              break
          }

          return { icon, statusText }
        }

        // Fetch the status for morning (MASUK) and afternoon (KELUAR)
        const morningStatus = params.row[`day_${i}_M`]
        const kindStatus = params.row[`day_${i}_K`]

        const morningStatusDetails = getStatusIcon(morningStatus, statusColorMap)
        const kindStatusDetails = getStatusIcon(kindStatus, statusColorMap)

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Tooltip for Morning Status (MASUK) */}
            <Tooltip title={`${morningStatusDetails.statusText}`} arrow>
              <span>{morningStatusDetails.icon}</span>
            </Tooltip>

            {/* Tooltip for Afternoon Status (KELUAR) */}
            <Tooltip title={`${kindStatusDetails.statusText}`} arrow>
              <span>{kindStatusDetails.icon}</span>
            </Tooltip>
          </div>
        )
      }
    })
  }

  const columns: GridColDef[] = [...baseColumns, ...attendanceColumns]

  const getDefaultStatus = () => {
    const currentTime = new Date()

    const currentTimeOnly = new Date().setHours(
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds(),
      0
    )

    const endTimeDate = new Date(endTime)
    const endTimeOnly = new Date().setHours(
      endTimeDate.getHours(),
      endTimeDate.getMinutes(),
      endTimeDate.getSeconds(),
      0
    )

    return currentTimeOnly > endTimeOnly ? 'Late' : 'Present'
  }

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
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
                rowSelectionModel={selectedUsers}
                onRowSelectionModelChange={handleSelectionChange}
                sx={{
                  height: 400,
                  '& .MuiDataGrid-cell': { fontSize: '0.75rem' },
                  '& .MuiDataGrid-columnHeaderTitle': { fontSize: '0.75rem' }
                }}
              />
            )}
          </Card>
        </div>
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

    const response = await axiosConfig.get('/laporan-absensi-kegiatan-by-userId', customConfig)

    return response.data
  } catch (error) {
    console.error('Error fetching absensi data:', error)
    throw error
  }
}

export default ListAbsensiKegiatan
