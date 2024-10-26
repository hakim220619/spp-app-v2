import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Grid,
  Divider,
  IconButton,
  CardHeader,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchDataPpdb, deletePpdb } from 'src/store/apps/ppdb/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/ppdb/TableHeader'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import axiosConfig from 'src/configs/axiosConfig'
import * as XLSX from 'xlsx'
import CardStatsHorizontalWithDetails from './cardCount'
import Tooltip from '@mui/material/Tooltip'

interface CellType {
  row: UsersType
}

const statusObj: any = {
  Registered: { title: 'Terdaftar', color: 'primary' },
  Pending: { title: 'Pending', color: 'warning' },
  Rejected: { title: 'Ditolak', color: 'error' },
  Accepted: { title: 'Diterima', color: 'success' },
  Verification: { title: 'Proses Verifikasi', color: 'info' }
}
const statusPemObj: any = {
  Paid: { title: 'Lunas', color: 'warning' },
  Pending: { title: 'Belum Bayar', color: 'error' },
  Verified: { title: 'Verified', color: 'info' }
}

interface StudentCandidate {
  school_id: number
  no_registrasi: string
  username: string
  password: string
  nik: string
  date_of_birth: string // Use string here if the date comes as a string, or Date if it's a Date object
  email: string
  full_name: string
  phone: string
  unit_id: number
  status: 'Registered' | 'Pending' | 'Rejected' | 'Accepted' | 'Verification' // enum type
  order_id: string
  redirect_url: string
  status_pembayaran: 'Paid' | 'Pending' | 'Verified' // enum type
  created_at: string
}

const RowOptions = ({ id }: { id: any }) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [open, setOpen] = useState(false)
  const [student, setStudent] = useState<StudentCandidate | null>(null) // State for student data
  const [studentDetailExcel, setStudentDetailExcel] = useState<any | null>(null) // State for student data
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  // Fetch student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token') // Assuming token is stored in localStorage

        const response = await axiosConfig.post(
          '/detailPpdb', // The API endpoint for fetching student data
          { id }, // Request body with uid
          {
            headers: {
              Authorization: `Bearer ${token}` // Include token in the headers
            }
          }
        )
        setStudent(response.data)
      } catch (error) {
        console.error('Failed to fetch student data:', error)
      }
    }
    const fetchStudentDataExcel = async () => {
      try {
        const token = localStorage.getItem('token') // Assuming token is stored in localStorage

        const response = await axiosConfig.post(
          '/detailPpdbStudentExcel', // The API endpoint for fetching student data
          { id }, // Request body with uid
          {
            headers: {
              Authorization: `Bearer ${token}` // Include token in the headers
            }
          }
        )
        setStudentDetailExcel(response.data)
      } catch (error) {
        console.error('Failed to fetch student data:', error)
      }
    }

    fetchStudentDataExcel()
    fetchStudentData()
  }, [id])

  const exportToExcel = () => {
    if (!studentDetailExcel) {
      toast.error('Tidak ada data siswa untuk diekspor.')

      return
    }

    // Mengonversi data siswa ke dalam format yang sesuai
    const ws = XLSX.utils.json_to_sheet([studentDetailExcel]) // Mengubah objek siswa menjadi worksheet
    const wb = XLSX.utils.book_new() // Membuat workbook baru
    XLSX.utils.book_append_sheet(wb, ws, 'Student Data') // Menambahkan worksheet ke workbook

    // Membuat file Excel dan memulai unduhan
    XLSX.writeFile(wb, `${studentDetailExcel.full_name}_data.xlsx`)
  }

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token') // Assuming token is stored in localStorage

      const response = await axiosConfig.post(
        '/detailPpdb', // The API endpoint for fetching student data
        { id }, // Request body with uid
        {
          headers: {
            Authorization: `Bearer ${token}` // Include token in the headers
          }
        }
      )
      setStudent(response.data)
    } catch (error) {
      console.error('Failed to fetch student data:', error)
    }
  }
  const handleRowEditedClick = () => router.push('/ms/ppdb/' + id)

  const handleDelete = async () => {
    try {
      await dispatch(deletePpdb(id)).unwrap()
      await dispatch(fetchDataPpdb({ school_id: getDataLocal.school_id, q: '' }))
      toast.success('Successfully deleted!')
      setOpen(false)
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user. Please try again.')
    }
  }

  const [openDetails, setOpenDetails] = useState(false)
  const [openCheklist, setOpenCheklist] = useState(false)
  const [openSendPaymentReload, setOpenSendPaymentReload] = useState(false)
  const handleClickOpenDelete = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleClosePaymentReload = () => setOpenSendPaymentReload(false)
  const handleOpenDetails = () => setOpenDetails(true)
  const handleOpenCheklist = () => setOpenCheklist(true)

  // Function to close the details dialog
  const handleCloseDetails = () => setOpenDetails(false)
  const handleCloseCheklist = () => setOpenCheklist(false)
  const handleVerifikasi = () => {
    const token = localStorage.getItem('token') // Assuming token is stored in localStorage
    axiosConfig
      .post(
        '/verifikasi-siswa-baru',
        { id },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        if (response.status == 200) {
          toast.success('Successfully Verifikasi!')
          fetchStudentData()
          dispatch(fetchDataPpdb({ school_id: getDataLocal.school_id, q: '' }))
          setOpenDetails(false)
        }
      })
      .catch(() => {
        toast.error("Failed. This didn't work.")
      })
  }
  const handleAccepted = () => {
    const token = localStorage.getItem('token') // Assuming token is stored in localStorage
    axiosConfig
      .post(
        '/terima-siswa-baru',
        { id },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        if (response.status == 200) {
          toast.success('Successfully Accepted!')
          fetchStudentData()
          dispatch(fetchDataPpdb({ school_id: getDataLocal.school_id, q: '' }))
          setOpenCheklist(false)
        }
      })
      .catch(() => {
        toast.error("Failed. This didn't work.")
      })
  }
  const handleRejected = () => {
    const token = localStorage.getItem('token') // Assuming token is stored in localStorage
    axiosConfig
      .post(
        '/tolak-siswa-baru',
        { id },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        if (response.status == 200) {
          toast.success('Successfully Accepted!')
          fetchStudentData()
          dispatch(fetchDataPpdb({ school_id: getDataLocal.school_id, q: '' }))
          setOpenCheklist(false)
        }
      })
      .catch(() => {
        toast.error("Failed. This didn't work.")
      })
  }
  const handleSendPaymentReload = () => {
    const token = localStorage.getItem('token') // Assuming token is stored in localStorage
    axiosConfig
      .post(
        '/reload-payment-siswa-baru',
        { id },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => {
        if (response.status == 200) {
          toast.success('Successfully Accepted!')
          fetchStudentData()
          handleClosePaymentReload()
          dispatch(fetchDataPpdb({ school_id: getDataLocal.school_id, q: '' }))
          setOpenCheklist(false)
        }
      })
      .catch(() => {
        toast.error("Failed. This didn't work.")
      })
  }

  return (
    <>
      {student?.status === 'Verification' && student?.status_pembayaran === 'Paid' && (
        <Tooltip title='Terima Siswa Baru' placement='top'>
          <IconButton size='small' color='warning' onClick={handleOpenCheklist}>
            <Icon icon='tabler:check' />
          </IconButton>
        </Tooltip>
      )}
      {student?.status !== 'Verification' && (
        <Tooltip title='Verifikasi' placement='top'>
          <IconButton size='small' color='primary' onClick={handleOpenDetails}>
            <Icon icon='tabler:info-circle' />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title='Edit' placement='top'>
        <IconButton size='small' color='success' onClick={handleRowEditedClick}>
          <Icon icon='tabler:edit' />
        </IconButton>
      </Tooltip>
      <Tooltip title='Export to Excel' placement='top'>
        <IconButton size='small' color='secondary' onClick={exportToExcel}>
          <Icon icon='tabler:download' />
        </IconButton>
      </Tooltip>
      {student?.status_pembayaran === 'Pending' && student?.status === 'Registered' && (
        <Tooltip title='Kirim ulang pembayaran registrasi' placement='top'>
          <IconButton size='small' color='info' onClick={() => setOpenSendPaymentReload(true)}>
            <Icon icon='tabler:reload' />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title='Delete' placement='top'>
        <IconButton size='small' color='error' onClick={handleClickOpenDelete}>
          <Icon icon='tabler:trash' />
        </IconButton>
      </Tooltip>

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{'Are you sure you want to delete this user?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>You won't be able to revert this action!</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleDelete} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openSendPaymentReload} onClose={handleClosePaymentReload}>
        <DialogTitle>{'Apakah anda yakin?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>Jika siswa baru belum terima notif Pembayaran!</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentReload} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleSendPaymentReload} color='primary'>
            Kirim Ulang
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth='lg' fullWidth>
        <DialogTitle>{'Detail Siswa Baru'}</DialogTitle>
        <DialogContent>
          {student ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>No Pendaftaran</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {student?.no_registrasi}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Nama Lengkap</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {student.full_name}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Status</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {student?.status}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Status Pembayaran</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {student?.status_pembayaran}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <DialogContentText>Loading student details...</DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color='primary'>
            Close
          </Button>
          {student &&
            student.status !== 'Verification' &&
            student.status !== 'Accepted' &&
            student.status_pembayaran === 'Paid' && (
              <Button onClick={handleVerifikasi} color='success'>
                Verifikasi
              </Button>
            )}
        </DialogActions>
      </Dialog>
      <Dialog open={openCheklist} onClose={handleCloseCheklist} maxWidth='sm' fullWidth>
        <DialogTitle>{'Detail Siswa Baru'}</DialogTitle>
        <DialogContent>
          {student ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <Grid container alignItems='center'>
                  {/* Tambahkan pesan konfirmasi */}
                  <Typography variant='body1'>Apakah Anda yakin ingin menerima siswa ini?</Typography>
                </Grid>
              </Grid>

              {/* Tambahkan field lain jika diperlukan */}
            </Grid>
          ) : (
            <DialogContentText>Memuat detail siswa...</DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheklist} color='primary'>
            Tutup
          </Button>
          {student &&
            student.status !== 'Accepted' &&
            student.status !== 'Registered' &&
            student.status_pembayaran === 'Paid' && (
              <>
                <Button onClick={handleAccepted} color='success'>
                  Terima
                </Button>
                <Button onClick={handleRejected} color='error'>
                  Tolak
                </Button>
              </>
            )}
        </DialogActions>
      </Dialog>
    </>
  )
}

const UserList = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.Ppdb)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataPpdb({ school_id, q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  const columns: GridColDef[] = [
    { field: 'no', headerName: 'No', width: 70 },
    { field: 'school_name', headerName: 'Sekolah', flex: 0.175, minWidth: 140 },
    { field: 'unit_name', headerName: 'Nama Unit', flex: 0.175, minWidth: 140 },
    { field: 'no_registrasi', headerName: 'Nomor Pendaftaran', flex: 0.175, minWidth: 140 },
    {
      field: 'username',
      headerName: 'Username',
      flex: 0.175,
      minWidth: 140,
      renderCell: params => (
        <span
          style={{ cursor: 'pointer', color: 'red' }}
          onClick={() => router.push(`/ms/ppdb/detail/${params.row.id}`)}
        >
          {params.value}
        </span>
      )
    },
    { field: 'full_name', headerName: 'Nama Lengkap', flex: 0.175, minWidth: 140 },
    { field: 'nik', headerName: 'Nik', flex: 0.25, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 0.25, minWidth: 180 },
    { field: 'phone', headerName: 'No. Wa', flex: 0.25, minWidth: 180 },
    {
      field: 'date_of_birth',
      headerName: 'Tanggal Lahir',
      flex: 0.25,
      minWidth: 180,
      valueFormatter: params => {
        const date = new Date(params.value)

        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(
          2,
          '0'
        )}`
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.175,
      minWidth: 240,
      renderCell: (params: GridRenderCellParams) => {
        const status = statusObj[params.row.status]

        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            color={status.color}
            label={status.title}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },
    {
      field: 'status_pembayaran',
      headerName: 'Status Pembayaran',
      flex: 0.175,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        const statusPem = statusPemObj[params.row.status_pembayaran]

        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            color={statusPem.color}
            label={statusPem.title}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },
    {
      flex: 0,
      minWidth: 240,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }: CellType) => <RowOptions id={row.id} />
    }
  ]

  const statsData = [
    {
      title: 'Pendaftar',
      stats: store.data.filter((user: any) => user).length, // Ganti dengan logika sesuai kebutuhan
      subtitle: 'Total',
      trendDiff: '',
      trend: 'positive',
      icon: 'mdi:account',
      avatarColor: 'primary'
    },
    {
      title: 'Diterima',
      stats: store.data.filter((user: any) => user.status === 'Accepted').length,
      subtitle: 'Total',
      trendDiff: '',
      trend: 'negative',
      icon: 'mdi:account-multiple',
      avatarColor: 'success'
    },
    {
      title: 'Proses Verifikasi',
      stats: store.data.filter((user: any) => user.status === 'Verification').length,
      subtitle: 'Total',
      trendDiff: '',
      trend: 'negative',
      icon: 'mdi:account-multiple',
      avatarColor: 'warning'
    },
    {
      title: 'Ditolak',
      stats: store.data.filter((user: any) => user.status === 'Rejected').length,
      subtitle: 'Total',
      trendDiff: '',
      trend: 'negative',
      icon: 'mdi:account-multiple',
      avatarColor: 'error'
    },
    {
      title: 'Lunas',
      stats: store.data.filter((user: any) => user.status_pembayaran === 'Paid').length,
      subtitle: 'Total',
      trendDiff: '',
      trend: 'negative',
      icon: 'mdi:account-multiple',
      avatarColor: 'success'
    },
    {
      title: 'Belum Lunas',
      stats: store.data.filter((user: any) => user.status_pembayaran === 'Pending').length,
      subtitle: 'Total',
      trendDiff: '',
      trend: 'negative',
      icon: 'mdi:account-multiple',
      avatarColor: 'error'
    }
  ]

  return (
    <Grid container spacing={6.5}>
      <Grid container item xs={12}>
        {statsData.map((data, index) => (
          <Grid item xs={12} md={4} sm={4} key={index}>
            <CardStatsHorizontalWithDetails
              title={data.title}
              stats={data.stats}
              subtitle={data.subtitle}
              trendDiff={data.trendDiff}
              trend={data.trend}
              icon={data.icon}
              iconSize={24}
              avatarSize={38}
              avatarColor={data.avatarColor}
              sx={{ bgcolor: 'background.paper', borderRadius: '8px', boxShadow: 3, margin: 2 }}
            />
          </Grid>
        ))}
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Data Registrasi Siswa Baru' />
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader
            value={value}
            handleFilter={handleFilter}
            handleTable={() => {
              setLoading(true)
              dispatch(fetchDataPpdb({ school_id, q: value })).finally(() => {
                setLoading(false)
              })
            }}
          />
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress color='secondary' />
            </div>
          ) : (
            <DataGrid
              autoHeight
              rowHeight={50}
              rows={store.data}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[20, 40, 60, 100]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
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

export default UserList
