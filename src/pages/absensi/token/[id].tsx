import { ReactNode, useEffect, useRef, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import QrScanner from 'qr-scanner'
import { useRouter } from 'next/router'
import axiosConfig from 'src/configs/axiosConfig'
import toast from 'react-hot-toast'
import urlImage from 'src/configs/url_image'
import Swal from 'sweetalert2'
import Grid, { GridProps } from '@mui/material/Grid'
import { styled, useTheme, Theme } from '@mui/material/styles'

const StyledGrid = styled(Grid)<GridProps>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const absensiToken = () => {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [detectedCode, setDetectedCode] = useState<string | null>(null)
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false)
  const camera = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const { id } = router.query
  const [dataAll, setDataAll] = useState<any>([])
  const [dataUsers, setDataUsers] = useState<any>([])
  const [dataAbsensi, setDataAbsensi] = useState<any>([])
  const theme = useTheme<Theme>()
  const qrScanner = useRef<QrScanner | null>(null)

  useEffect(() => {
    Swal.fire({
      title: 'Loading...',
      text: '',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    const fetchToken = async () => {
      try {
        const response = await axiosConfig.get(`/getDataAbsensiFromToken?token=${id}`, {
          headers: {
            Accept: 'application/json'
          }
        })
        setDataAll(response.data)

        Swal.close()
        setLoadingComplete(true)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load data, please try again!', { duration: 2000 })
        Swal.close()
        setLoadingComplete(true)
      }
    }

    const delayFetch = setTimeout(() => {
      fetchToken()
      setIsCameraActive(true)
    }, 2000)

    return () => clearTimeout(delayFetch)
  }, [id])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Start the QR scanner
  const startQrScanner = () => {
    if (camera.current) {
      qrScanner.current = new QrScanner(
        camera.current,
        result => {
          setDetectedCode(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true
        }
      )
      qrScanner.current.start()
    }
  }

  useEffect(() => {
    if (isCameraActive) {
      startQrScanner()
    }

    return () => {
      // Clean up QR scanner when component unmounts or camera is turned off
      if (qrScanner.current) {
        qrScanner.current.destroy()
      }
    }
  }, [isCameraActive])

  useEffect(() => {
    if (detectedCode) {
      let status = 'Present' // Default status
      const nisn = detectedCode
      const school_id = dataAll.school_id
      const activity_id = dataAll.activity_id
      const subject_id = dataAll.subject_id

      const type = new Date().getTime() > parseTime(dataAll.end_time_in) ? 'KELUAR' : 'MASUK'
      console.log(type)
      if (type === 'MASUK') {
        // If the time is before or after the end_time_in
        if (new Date().getTime() < parseTime(dataAll.end_time_in)) {
          status = 'Present'
        } else {
          status = 'Late'
        }
      } else {
        // If the time is before or after the end_time_out for 'KELUAR'
        if (new Date().getTime() < parseTime(dataAll.end_time_out)) {
          status = 'Present'
        } else {
          status = 'Late'
        }
      }

      if (nisn && school_id) {
        const dataToSend = {
          token: id,
          nisn: nisn,
          school_id: school_id,
          activity_id: activity_id,
          subject_id: subject_id,
          type: type,
          status: status
        }

        axiosConfig
          .post('/absensi-with-token', dataToSend, {
            headers: {
              Accept: 'application/json'
            }
          })
          .then(response => {
            console.log(response)
            setDataUsers(response.data.dataUsers)
            setDataAbsensi(response.data)
            Swal.fire({
              icon: 'success',
              title: 'Absensi Berhasil!',
              text: 'Anda telah berhasil melakukan absensi.',
              confirmButtonText: 'OK',
              timer: 2000, // Close the alert after 2000ms (2 seconds)
              timerProgressBar: true, // Optional: show a progress bar for the timer
              willClose: () => {
                // Optional: add any additional actions after the alert closes
              }
            })

            setDetectedCode(null) // Reset the detected code
            startQrScanner() // Restart the scanner
          })
          .catch(error => {
            setDetectedCode(null)

            console.error('Error during absensi submission:', error)

            // toast.error('Failed to submit absensi. Please try again!', { duration: 2000 })
          })
      } else {
        // toast.error('Data is incomplete, please try again!', { duration: 2000 })
      }
    }
  }, [detectedCode, dataAll, id])

  useEffect(() => {
    // If detectedCode is reset, restart the scanner detection
    if (detectedCode === null && isCameraActive) {
      if (qrScanner.current) {
        qrScanner.current.start()
      }
    }
  }, [detectedCode, isCameraActive])

  const parseTime = (dateStr: string) => {
    const date = new Date(dateStr)

    return date.setFullYear(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '20px 40px',
          borderBottom: '1px solid black',
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: 'center'
        }}
      >
        <Box
          component='img'
          src={`${urlImage}${dataAll.logo}`}
          alt='Logo'
          sx={{
            width: { xs: 60, sm: 80 },
            height: { xs: 60, sm: 80 },
            objectFit: 'contain',
            marginRight: { sm: 2 } // tambahkan margin kanan untuk desktop
          }}
        />

        <Box
          sx={{
            textAlign: 'center',
            mt: { xs: 2, sm: 0 },
            flex: 1, // tambahkan flex untuk mengisi ruang kosong
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography
            variant='h1'
            sx={{
              fontWeight: 'bold',
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            {dataAll.owner}
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: theme.palette.mode === 'dark' ? 'white' : 'black',
              fontSize: { xs: '1rem', sm: '1.9rem' }
            }}
          >
            {dataAll.address}
          </Typography>
        </Box>
      </Box>

      <Box m={3} display='inline'></Box>
      <Card>
        <Grid container>
          {loadingComplete && (
            <>
              <Grid container>
                {/* Camera Section */}
                <Grid item xs={12} sm={12}>
                  <Typography
                    variant='h1'
                    sx={{
                      color: theme.palette.mode === 'dark' ? 'white' : 'black',
                      textAlign: 'center',
                      backgroundColor: theme.palette.mode === 'dark' ? '#4B4376' : 'yellow'
                    }}
                  >
                    {dataAll.activity_name || dataAll.subject_name}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
          <StyledGrid item sm={12} xs={12}>
            <Grid container sx={{ width: '100%' }}>
              <Grid
                item
                xs={6}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.mode === 'dark' ? 'green' : '#5DB996'
                }}
              >
                {loadingComplete && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      textAlign: 'center',
                      color: theme.palette.mode === 'dark' ? 'white' : 'black',
                      padding: '10px',
                      borderRadius: '8px',
                      boxSizing: 'border-box',
                      justifyContent: 'center' // Center text horizontally
                    }}
                  >
                    <span>{new Date().getTime() > parseTime(dataAll.end_time_in) ? 'Mulai' : 'Selesai'}</span>
                    <div>
                      <span>
                        {new Date().getTime() > parseTime(dataAll.end_time_in)
                          ? new Date(dataAll.start_time_out).toLocaleString('id-ID', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
                          : new Date(dataAll.start_time_in).toLocaleString('id-ID', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                      </span>
                    </div>
                  </div>
                )}
              </Grid>

              <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center', backgroundColor: 'red' }}>
                {loadingComplete && (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      textAlign: 'center',
                      border: '1px', // Add border style
                      padding: '10px',
                      borderRadius: '8px',
                      boxSizing: 'border-box',
                      justifyContent: 'center',
                      color: theme.palette.mode === 'dark' ? 'white' : 'black'
                    }}
                  >
                    <span>{new Date().getTime() > parseTime(dataAll.end_time_in) ? 'Selesai' : 'Mulai'}</span>
                    <div>
                      <span>
                        {new Date().getTime() > parseTime(dataAll.end_time_in)
                          ? new Date(dataAll.end_time_out).toLocaleString('id-ID', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
                          : new Date(dataAll.end_time_in).toLocaleString('id-ID', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                      </span>
                    </div>
                  </div>
                )}
              </Grid>
            </Grid>
          </StyledGrid>
        </Grid>
        {loadingComplete && (
          <>
            <Grid container>
              {/* Camera Section */}
              <Grid item xs={12} sm={12}>
                <Typography
                  variant='h1'
                  sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black', textAlign: 'center', marginTop: 2 }}
                >
                  {currentTime}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
        <Grid container spacing={1}>
          {/* Camera Section */}
          <Grid item xs={12} sm={6}>
            <CardContent>
              {isCameraActive && (
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    marginTop: 1,
                    textAlign: 'center'
                  }}
                >
                  <Card sx={{ padding: 2, width: '100%', borderRadius: 2 }}>
                    <Box sx={{ width: '100%', position: 'relative' }}>
                      <video
                        ref={camera}
                        style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                        muted
                        playsInline
                      />
                    </Box>
                  </Card>
                </Box>
              )}
            </CardContent>
          </Grid>

          {/* User Data Section */}
          <Grid item xs={12} sm={6}>
            <CardContent
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              {/* <Box
                component='img'
                src={imageUrl}
                alt='User Image'
                sx={{
                  width: '100%',
                  height: '130px',
                  borderRadius: '15%',
                  margin: '10px',
                  objectFit: 'cover'
                }}
              /> */}
              {loadingComplete && (
                <>
                  <TableContainer>
                    <Table sx={{ border: 'none' }}>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ borderBottom: 'none' }}>Nama Lengkap</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>: {dataUsers.full_name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ borderBottom: 'none' }}>Kelas</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>: {dataUsers.class_name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ borderBottom: 'none' }}>Jurusan</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>: {dataUsers.major_name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ borderBottom: 'none' }}>Absensi</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>
                            :{' '}
                            {dataAbsensi.status === 'Present'
                              ? 'Hadir'
                              : dataAbsensi.status === 'Late'
                              ? 'Terlambat'
                              : dataAbsensi.status}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ borderBottom: 'none' }}>Tanggal Absensi</TableCell>
                          <TableCell sx={{ borderBottom: 'none' }}>
                            :{' '}
                            {new Date(dataAbsensi.created_at).toLocaleString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              second: 'numeric'
                            })}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Box>
  )
}

absensiToken.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

absensiToken.guestGuard = true

export default absensiToken
