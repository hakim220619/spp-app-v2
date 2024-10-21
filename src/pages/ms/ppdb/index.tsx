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
import urlImage from 'src/configs/url_image'
interface CellType {
  row: UsersType
}

const statusObj: any = {
  Registered: { title: 'Registered', color: 'primary' },
  Pending: { title: 'Pending', color: 'warning' },
  Rejected: { title: 'Rejected', color: 'error' },
  Accepted: { title: 'Accepted', color: 'success' },
  Verification: { title: 'Verification', color: 'info' }
}
const statusPemObj: any = {
  Paid: { title: 'Lunas', color: 'success' },
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
  const [studentDetail, setStudentDetail] = useState<any | null>(null) // State for student data
  const [studentDetailExcel, setStudentDetailExcel] = useState<any | null>(null) // State for student data
  const [openDialog, setOpenDialog] = useState(false)
  const [openDialogPreview, setOpenDialogPreview] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
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
    const fetchStudentDetail = async () => {
      try {
        const token = localStorage.getItem('token') // Assuming token is stored in localStorage

        const response = await axiosConfig.post(
          '/detailPpdbStudentDetail', // The API endpoint for fetching student data
          { id }, // Request body with uid
          {
            headers: {
              Authorization: `Bearer ${token}` // Include token in the headers
            }
          }
        )
        setStudentDetail(response.data)
      } catch (error) {
        console.error('Failed to fetch student data:', error)
      }
    }
    fetchStudentDetail()
    fetchStudentDataExcel()
    fetchStudentData()
  }, [id])

  const exportToExcel = () => {
    if (!student) {
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
  const handleClosePreview = () => setOpenDialogPreview(false)
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
  const handleClickOpen = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setOpenDialogPreview(true)
  }
  return (
    <>
      <IconButton size='small' color='secondary' onClick={exportToExcel}>
        <Icon icon='tabler:download' />
      </IconButton>
      {student?.status_pembayaran === 'Pending' && student?.status === 'Registered' && (
        <IconButton size='small' color='info' onClick={() => setOpenSendPaymentReload(true)}>
          <Icon icon='tabler:reload' />
        </IconButton>
      )}

      {student?.status === 'Verification' && student?.status_pembayaran === 'Paid' && (
        <IconButton size='small' color='warning' onClick={handleOpenCheklist}>
          <Icon icon='tabler:check' />
        </IconButton>
      )}
      {student?.status !== 'Verification' && (
        <IconButton size='small' color='primary' onClick={handleOpenDetails}>
          <Icon icon='tabler:info-circle' />
        </IconButton>
      )}
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
                      <strong>Nama Panggilan</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.nick_name}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Jenis Kelamin</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.gender}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>NIK</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.nik}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>NISN</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.nisn}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Tempat dan Tanggal Lahir</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.birth_place_date}
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
                      : {new Date(studentDetail?.birth_date).toLocaleDateString('id-ID')}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Nomor Akta Kelahiran</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.birth_cert_no}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Alamat</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.address}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {/* Tambahkan semua field lain sesuai dengan permintaan */}
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Agama</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.religion}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>RT</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.rt}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>RW</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.rw}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Dusun</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.dusun}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Kecamatan</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.kecamatan}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Sekolah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.school}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Saudara</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.siblings}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Transportasi</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.transportation}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Jam Perjalanan</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.travel_hours} jam {studentDetail?.travel_minutes} menit
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Jarak (km)</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.distance_in_km} km
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Jarak ke Sekolah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.distance_to_school}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Tinggi Badan</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.height} cm
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Berat Badan</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.weight} kg
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Telepon Seluler</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.mobile_phone}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Telepon</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.phone}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Telepon Rumah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.home_phone}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Nomor KPS</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.kps_number}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Penerima KPS</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.kps_receiver}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Nama Ayah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.father_name}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>NIK Ayah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.father_nik}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Tahun Lahir Ayah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.father_birth_year}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pendidikan Ayah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.father_education}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pekerjaan Ayah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.father_job}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pendapatan Ayah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.father_income}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Nama Ibu</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.mother_name}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>NIK Ibu</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.mother_nik}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Tahun Lahir Ibu</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.mother_birth_year}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pendidikan Ibu</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.mother_education}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pekerjaan Ibu</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.mother_job}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pendapatan Ibu</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.mother_income}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Nama Wali</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.guardian_name}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>NIK Wali</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.guardian_nik}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Tahun Lahir Wali</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.guardian_birth_year}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pendidikan Wali</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.guardian_education}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pekerjaan Wali</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.guardian_job}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Pendapatan Wali</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {studentDetail?.guardian_income}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Tanggal Dibuat</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1' textAlign='left'>
                      : {new Date(studentDetail?.created_at).toLocaleDateString('id-ID')}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Kartu Keluarga</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' textAlign='left'>
                      :
                      <img
                        src={`${urlImage}${studentDetail?.kartu_keluarga}`}
                        style={{ width: '100px', marginTop: '10px', cursor: 'pointer' }}
                        onClick={() => handleClickOpen(`${urlImage}${studentDetail?.kartu_keluarga}`)}
                        alt='Ijazah'
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Akta Lahir</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' textAlign='left'>
                      :
                      <img
                        src={`${urlImage}${studentDetail?.akte_lahir}`}
                        style={{ width: '100px', marginTop: '10px', cursor: 'pointer' }}
                        onClick={() => handleClickOpen(`${urlImage}${studentDetail?.akte_lahir}`)}
                        alt='akte_lahir'
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>KTP Orang Tua</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' textAlign='left'>
                      :
                      <img
                        src={`${urlImage}${studentDetail?.ktp_orangtua}`}
                        style={{ width: '100px', marginTop: '10px', cursor: 'pointer' }}
                        onClick={() => handleClickOpen(`${urlImage}${studentDetail?.ktp_orangtua}`)}
                        alt='ktp_orangtua'
                      />
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography variant='subtitle1'>
                      <strong>Ijazah</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' textAlign='left'>
                      :
                      <img
                        src={`${urlImage}${studentDetail?.ijazah}`}
                        style={{ width: '100px', marginTop: '10px', cursor: 'pointer' }}
                        onClick={() => handleClickOpen(`${urlImage}${studentDetail?.ijazah}`)}
                        alt='ijazah'
                      />
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
      <Dialog open={openDialogPreview} onClose={handleClosePreview}>
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent>
          {selectedImage && <img src={selectedImage} style={{ width: '100%' }} alt='Preview' />}
        </DialogContent>
      </Dialog>
    </>
  )
}

const columns: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  { field: 'school_name', headerName: 'Sekolah', flex: 0.175, minWidth: 140 },
  { field: 'unit_name', headerName: 'Nama Unit', flex: 0.175, minWidth: 140 },
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

const UserList = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const [status] = useState<any>('')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.Ppdb)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataPpdb({ school_id, q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, status, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Data Registrasi Siswa Baru' />
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader
            value={value}
            handleFilter={handleFilter}
            handleTable={() => {
              setLoading(true) // Start loading
              dispatch(fetchDataPpdb({ school_id, q: value })).finally(() => {
                setLoading(false) // Stop loading
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
