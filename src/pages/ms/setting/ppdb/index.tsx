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
import { fetchDataSettingPpdb, deleteSettingPpdb } from 'src/store/apps/ppdb/setting/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/setting/ppdb/TableHeader'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import axiosConfig from 'src/configs/axiosConfig'
import urlImage from 'src/configs/url_image'

interface CellType {
  row: UsersType
}

const statusObj: any = {
  ON: { title: 'ON', color: 'success' },
  OFF: { title: 'OFF', color: 'error' }
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

    fetchStudentData()
  }, [id])
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
  const handleRowEditedClick = () => router.push('/ms/setting/ppdb/' + id)

  const handleDelete = async () => {
    try {
      await dispatch(deleteSettingPpdb(id)).unwrap()
      await dispatch(fetchDataSettingPpdb({ school_id: getDataLocal.school_id, q: '' }))
      toast.success('Successfully deleted!')
      setOpen(false)
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user. Please try again.')
    }
  }

  const [openDetails, setOpenDetails] = useState(false)
  const handleClickOpenDelete = () => setOpen(true)
  const handleClose = () => setOpen(false)

  // Function to close the details dialog
  const handleCloseDetails = () => setOpenDetails(false)
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
          dispatch(fetchDataSettingPpdb({ school_id: getDataLocal.school_id, q: '' }))
          setOpenDetails(false)
        }
      })
      .catch(() => {
        toast.error("Failed. This didn't work.")
      })
  }

  return (
    <>
      <IconButton size='small' color='success' onClick={handleRowEditedClick}>
        <Icon icon='tabler:edit' />
      </IconButton>

      <IconButton size='small' color='error' onClick={handleClickOpenDelete}>
        <Icon icon='tabler:trash' />
      </IconButton>

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

      {/* Student Details Dialog */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth='md' fullWidth>
        <DialogTitle>{'Detail Siswa Baru'}</DialogTitle>
        <DialogContent>
          {student ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
                      <strong>Email</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {student.email}
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
                    <Button
                      variant='contained'
                      color={
                        student.status === 'Registered'
                          ? 'primary'
                          : student.status === 'Verification'
                          ? 'success'
                          : 'inherit' // Fallback to inherit for other statuses
                      }
                      sx={{ textAlign: 'left' }}
                    >
                      {student.status}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>No. Registrasi</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {student.no_registrasi}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>No. Wa</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {student.phone}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Tanggal Lahir</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      :{' '}
                      {new Date(student.date_of_birth).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pembayaran Status</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {student.status_pembayaran}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {/* Add any other fields as needed */}
            </Grid>
          ) : (
            <DialogContentText>Loading student details...</DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color='primary'>
            Close
          </Button>
          {student && student.status !== 'Verification' && student.status_pembayaran === 'Paid' && (
            <Button onClick={handleVerifikasi} color='success'>
              Verifikasi
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
const formatRupiah = (number: any) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  })
    .format(number)
    .replace('IDR', 'Rp')
    .trim()
}
const columns: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  {
    field: 'image',
    headerName: 'Gambar',
    flex: 0.175,
    minWidth: 70,
    renderCell: params => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center', // Center horizontally
          alignItems: 'center', // Center vertically
          height: '100%' // Ensure the cell height is utilized
        }}
      >
        <img
          src={`${urlImage}uploads/school/siswa_baru/${params.row.school_id}/${params.value}`}
          alt='image'
          style={{
            padding: 2,
            width: '40px', // Reduced width
            height: '40px', // Reduced height for a circular shape
            borderRadius: '50%', // Makes the image circular
            objectFit: 'cover' // Ensures the image covers the area without stretching
          }}
        />
      </div>
    )
  },
  { field: 'school_name', headerName: 'Sekolah', flex: 0.175, minWidth: 280 },
  { field: 'unit_name', headerName: 'Nama Unit', flex: 0.175, minWidth: 280 },
  { field: 'target', headerName: 'Target Siswa', flex: 0.175, minWidth: 140 },
  { field: 'years', headerName: 'Tahun', flex: 0.175, minWidth: 140 },
  {
    field: 'amount',
    headerName: 'Amount',
    flex: 0.25,
    minWidth: 180,
    valueFormatter: params => formatRupiah(params.value) // Format Rupiah di sini
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.175,
    minWidth: 140,
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
  { field: 'url', headerName: 'Url', flex: 0.175, minWidth: 300 },

  {
    flex: 0,
    minWidth: 240,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: CellType) => <RowOptions id={row.id} />
  }
]

const SettingPpdb = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const [status] = useState<any>('')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.SettingPpdb)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataSettingPpdb({ school_id, q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, status, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Setting PPDB' />
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

export default SettingPpdb
