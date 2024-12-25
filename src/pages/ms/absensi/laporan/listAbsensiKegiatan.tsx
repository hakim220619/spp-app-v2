import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Grid,
  Divider,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material'
import { DataGrid, GridCloseIcon, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import TableHeader from 'src/pages/ms/absensi/laporan/TableHeaderLapKegiatan' // Ensure proper import of TableHeader
import axiosConfig from 'src/configs/axiosConfig'
import Icon from 'src/@core/components/icon'
import { useTheme } from '@emotion/react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ListAbsensiKegiatanProps {
  class_id: string
  unit_id: string
  unit_name: string
  activity_id: string
  activity_name: string
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
  'Early Leave': '#00bcd4',

  // Specific holidays
  'Tahun Baru 2024 Masehi': '#1e90ff',
  "Isra Mi'raj Nabi Muhammad SAW": '#9370db',
  'Tahun Baru Imlek 2575 Kongzili': '#ff4500',
  'Hari Suci Nyepi Tahun Baru Saka 1946': '#32cd32',
  'Wafat Isa Almasih': '#ff69b4',
  'Hari Paskah': '#ff6347',
  'Hari Raya Idul Fitri 1445 Hijriah': '#ff7f50',
  'Hari Buruh Internasional': '#4682b4',
  'Kenaikan Isa Almasih': '#8a2be2',
  'Hari Raya Waisak 2568': '#daa520',
  'Hari Lahir Pancasila': '#20b2aa',
  'Hari Raya Idul Adha 1445 Hijriah': '#deb887',
  'Tahun Baru Islam 1446 Hijriah': '#cd5c5c',
  'Hari Kemerdekaan RI': '#ff0000',
  'Maulid Nabi Muhammad SAW': '#ff8c00',
  'Hari Raya Natal': '#008000'
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
  unit_name,
  activity_name,
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
  const theme = useTheme()
  const isDarkMode = (theme as any).palette.mode === 'dark'
  const [openPdfPreview, setOpenPdfPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPDF, setLoadingPdf] = useState(false)

  const createPdf = async () => {
    setLoadingPdf(true)

    const doc = new jsPDF('landscape') // Set orientation to landscape

    // Add school logo
    const logoImageUrl = '/images/logo.png'
    const img = new Image()
    img.src = logoImageUrl

    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 20, 20)

      // Add school name
      doc.setFontSize(14)
      doc.setFont('verdana', 'bold')
      const schoolNameWidth = doc.getTextWidth(getDataLocal.school_name)
      const xSchoolNamePosition = (doc.internal.pageSize.getWidth() - schoolNameWidth) / 2
      doc.text(getDataLocal.school_name, xSchoolNamePosition, 20)

      // Draw a horizontal line under the header
      doc.line(10, 32, 290, 32) // Adjusted for landscape

      // Student Information
      const studentInfoY = 40 // Base Y position for student info
      const lineSpacing = 6 // Adjust this value to reduce spacing

      const infoLines = [
        { label: 'Unit', value: unit_name },
        { label: 'Kegiatan', value: activity_name },
        { label: 'Kelas', value: absensiData[0].class_name },
        { label: 'Bulan', value: selectedMonth }
      ]

      // Set positions for left and right columns
      const leftColumnX = 10 // X position for the left column
      const rightColumnX = 130 // X position for the right column
      const labelOffset = 30 // Offset for the label and value
      doc.setFontSize(10)
      infoLines.forEach((info, index) => {
        const yPosition = studentInfoY + Math.floor(index / 2) * lineSpacing // Increment y for each pair

        if (index % 2 === 0) {
          // Even index: Left column for the first two entries
          doc.text(info.label, leftColumnX, yPosition)
          doc.text(`: ${info.value}`, leftColumnX + labelOffset, yPosition) // Adjust padding for alignment
        } else {
          // Odd index: Right column for the last two entries
          doc.text(info.label, rightColumnX, yPosition)
          doc.text(`: ${info.value}`, rightColumnX + labelOffset, yPosition) // Adjust padding for alignment
        }
      })

      // Draw another horizontal line below the student information
      doc.line(10, studentInfoY + 2 * lineSpacing, 290, studentInfoY + 2 * lineSpacing)

      // Prepare table data with 'Type' column
      const tableHead = [['No', 'Nama Lengkap', 'Kelas', 'Type', ...Array.from({ length: 31 }, (_, i) => `${i + 1}`)]]

      const getStatus = (status: any) => {
        let icon, statusText
        switch (status) {
          case 'Present':
            icon = '✔' // Check icon
            statusText = 'Hadir'
            break
          case 'Absent':
            icon = '❌' // Cross icon
            statusText = 'Absen'
            break
          case 'Late':
            icon = '⏰' // Clock icon
            statusText = 'Terlambat'
            break
          case 'Excused':
            icon = '✅' // Calendar-check icon
            statusText = 'Izin'
            break
          case 'Sick':
            icon = '❤️' // Heartbeat icon
            statusText = 'Sakit'
            break
          case 'Permission':
            icon = '🛡' // Shield-check icon
            statusText = 'Izin'
            break
          case 'Alpha':
            icon = '👤' // User-off icon
            statusText = 'Alpha'
            break
          case 'Leave':
            icon = '✈️' // Airplane icon
            statusText = 'Cuti'
            break
          case 'Out of Office':
            icon = '🏠' // Home icon
            statusText = 'Di Luar Kantor'
            break
          case 'Holiday':
            icon = '🌞' // Sun icon
            statusText = 'Libur'
            break
          case 'Early Leave':
            icon = '🚪' // Logout icon
            statusText = 'Pulang Cepat'
            break
          default:
            icon = status // Default status text
            statusText = status
            break
        }

        return { icon, statusText }
      }

      const tableBody = absensiData.map((item, index) => {
        return [
          index + 1,
          item.full_name,
          item.class_name,
          'MASUK \n KELUAR',
          ...Array.from({ length: 31 }, (_, i) => {
            const morningStatus = item[`day_${i + 1}_M`] || '-'
            const afternoonStatus = item[`day_${i + 1}_K`] || '-'

            const { statusText: morningStatusText } = getStatus(morningStatus)
            const { statusText: afternoonStatusText } = getStatus(afternoonStatus)

            return `${morningStatusText}\n${afternoonStatusText}`
          })
        ]
      })

      // Generate the table
      doc.autoTable({
        startY: studentInfoY + infoLines.length * 3 + 4,
        head: tableHead,
        body: tableBody,
        margin: { left: 10 },
        theme: 'grid',
        headStyles: {
          fillColor: [50, 50, 50],
          textColor: [255, 255, 255],
          fontSize: 5,
          font: 'verdana',
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 4,
          font: 'verdana',
          valign: 'middle',
          halign: 'center',
          cellPadding: 2
        },
        alternateRowStyles: {
          fillColor: [230, 230, 230]
        },
        columnStyles: {
          0: { cellWidth: 6 }, // No
          1: { cellWidth: 13 }, // Nama Lengkap
          2: { cellWidth: 8 }, // Kelas
          3: { cellWidth: 10 }, // Type
          // Dynamically adjust column widths for dates as needed
          ...Object.fromEntries(Array.from({ length: 31 }, (_, i) => [i + 4, { cellWidth: 8 }]))
        }
      })

      // Save or preview the PDF
      const pdfOutput = doc.output('blob')
      const blobUrl = URL.createObjectURL(pdfOutput)
      setPdfUrl(blobUrl)
      setOpenPdfPreview(true)
    }

    img.onerror = () => {
      console.error('Failed to load image:', logoImageUrl)
    }
  }

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
          if (!status) {
            // Jika status null atau undefined
            return { icon: '-', statusText }
          }

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
              // Tampilkan teks status dengan gaya default
              icon = (
                <span
                  style={{
                    fontSize: '0.6rem',
                    color: isDarkMode ? 'white' : 'black',
                    display: 'inline-block',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {status}
                </span>
              )
              statusText = status
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Tooltip for Morning Status (MASUK) */}
            <Tooltip title={`${morningStatusDetails.statusText}`} arrow>
              <div
                style={{
                  maxWidth: '100px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  padding: '1px',
                  scrollbarWidth: 'thin', // untuk Firefox
                  scrollbarColor: 'gray thin' // untuk Firefox
                }}
              >
                <span>{morningStatusDetails.icon}</span>
              </div>
            </Tooltip>

            {/* Tooltip for Afternoon Status (KELUAR) */}
            <Tooltip title={`${kindStatusDetails.statusText}`} arrow>
              <div
                style={{
                  maxWidth: '100px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  padding: '1px',
                  scrollbarWidth: 'thin', // untuk Firefox
                  scrollbarColor: 'gray thin' // untuk Firefox
                }}
              >
                <span>{kindStatusDetails.icon}</span>
              </div>
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
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={12}></Grid>
        <Grid item xs={12}>
          <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
            <Card>
              <Divider sx={{ m: '0 !important' }} />
              <TableHeader value={value} handleFilter={handleFilter} cetakPdfAll={createPdf} loadingPdf={loadingPDF} />
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
      <Dialog
        open={openPdfPreview}
        onClose={() => {
          setOpenPdfPreview(false)
          setPdfUrl(null) // Clear the URL when closing
        }}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          style: {
            minHeight: '600px',
            backgroundColor: 'transparent', // Semi-transparent white

            boxShadow: 'none',

            position: 'relative' // Ini perlu ditambahkan untuk posisikan ikon close
          }
        }}
      >
        <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton
            onClick={() => {
              setOpenPdfPreview(false)
              setPdfUrl(null) // Clear the URL when closing
              setLoadingPdf(false)
            }}
            sx={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              zIndex: 1
            }}
          >
            <GridCloseIcon sx={{ color: 'white' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {pdfUrl && <iframe src={pdfUrl} width='100%' height='800px' title='PDF Preview' style={{ border: 'none' }} />}
        </DialogContent>
      </Dialog>
    </>
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
