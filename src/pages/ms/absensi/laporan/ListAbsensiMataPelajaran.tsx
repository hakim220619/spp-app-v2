import { useState, useEffect, useCallback } from 'react'
import { Card, Grid, Divider, CircularProgress, Tooltip } from '@mui/material'
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import TableHeader from 'src/pages/ms/absensi/TableHeaderKegiatan' // Ensure proper import of TableHeader
import axiosConfig from 'src/configs/axiosConfig'
import Icon from 'src/@core/components/icon'

interface ListAbsensiMataPelajaranProps {
  class_id: string
  unit_id: string
  subject_id: string
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
  subject_id: string
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

const ListAbsensiMataPelajaran = ({
  class_id,
  unit_id,
  onSelectionChange,
  subject_id,
  type,
  endTime,
  selectedMonth,
  year
}: ListAbsensiMataPelajaranProps) => {
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
        const params: DataParams = { q: value, school_id, unit_id, class_id, subject_id, type, selectedMonth, year }
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
  }, [value, school_id, class_id, unit_id, subject_id, type, selectedMonthIndex, year])

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
    { field: 'full_name', headerName: 'Nama Lengkap', flex: 0.175, minWidth: 340 },
    { field: 'class_name', headerName: 'Kelas', flex: 0.175, minWidth: 240 }
  ]

  const attendanceColumns: GridColDef[] = []

  for (let i = 1; i <= daysInMonth; i++) {
    attendanceColumns.push({
      field: `day_${i}`,
      headerName: `${i}`,
      width: 50,
      renderCell: params => {
        let icon = null
        let statusText = '-' // Default status text in case of an unknown status

        switch (params.value) {
          case 'Present':
            icon = <Icon fontSize='1.125rem' icon='tabler:check' color={statusColorMap['Present']} />
            statusText = 'Hadir'
            break
          case 'Absent':
            icon = <Icon fontSize='1.125rem' icon='tabler:x' color={statusColorMap['Absent']} />
            statusText = 'Absen'
            break
          case 'Late':
            icon = <Icon fontSize='1.125rem' icon='tabler:clock' color={statusColorMap['Late']} />
            statusText = 'Terlambat'
            break
          case 'Excused':
            icon = <Icon fontSize='1.125rem' icon='tabler:calendar-check' color={statusColorMap['Excused']} />
            statusText = 'Izin'
            break
          case 'Sick':
            icon = <Icon fontSize='1.125rem' icon='tabler:heartbeat' color={statusColorMap['Sick']} />
            statusText = 'Sakit'
            break
          case 'Permission':
            icon = <Icon fontSize='1.125rem' icon='tabler:shield-check' color={statusColorMap['Permission']} />
            statusText = 'Izin'
            break
          case 'Alpha':
            icon = <Icon fontSize='1.125rem' icon='tabler:user-off' color={statusColorMap['Alpha']} />
            statusText = 'Alpha'
            break
          case 'Leave':
            icon = <Icon fontSize='1.125rem' icon='tabler:airplane' color={statusColorMap['Leave']} />
            statusText = 'Cuti'
            break
          case 'Out of Office':
            icon = <Icon fontSize='1.125rem' icon='tabler:home' color={statusColorMap['Out of Office']} />
            statusText = 'Di Luar Kantor'
            break
          case 'Holiday':
            icon = <Icon fontSize='1.125rem' icon='tabler:sun' color={statusColorMap['Holiday']} />
            statusText = 'Libur'
            break
          case 'Early Leave':
            icon = <Icon fontSize='1.125rem' icon='tabler:logout' color={statusColorMap['Early Leave']} />
            statusText = 'Pulang Cepat'
            break
          default:
            icon = '-'
            break
        }

        return (
          <Tooltip title={statusText} arrow>
            <span>{icon}</span>
          </Tooltip>
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

    const response = await axiosConfig.get('/laporan-absensi-mataPelajaran-by-userId', customConfig)

    return response.data
  } catch (error) {
    console.error('Error fetching absensi data:', error)
    throw error
  }
}

export default ListAbsensiMataPelajaran
