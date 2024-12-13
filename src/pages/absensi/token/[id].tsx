import { ReactNode, useEffect, useRef, useState } from 'react'
import { Box, Typography, Card, Button, Container, Grid } from '@mui/material'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import QrScanner from 'qr-scanner'
import { useRouter } from 'next/router'
import axiosConfig from 'src/configs/axiosConfig'
import toast from 'react-hot-toast'
import urlImage from 'src/configs/url_image'
import { useTheme, Theme } from '@mui/material/styles'

const absensiToken = () => {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [detectedCode, setDetectedCode] = useState<string | null>(null)
  const camera = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const { id } = router.query
  const [dataAll, setDataAll] = useState<any>([])
  const theme = useTheme<Theme>()

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

  useEffect(() => {
    if (isCameraActive && camera.current) {
      const qrScanner = new QrScanner(
        camera.current,
        result => {
          console.log('Barcode detected:', result)
          setDetectedCode(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true
        }
      )
      qrScanner.start()

      return () => qrScanner.destroy()
    }
  }, [isCameraActive])

  useEffect(() => {
    // Fetch data when the component mounts
    const fetchUnits = async () => {
      try {
        const response = await axiosConfig.get(`/getDataAbsensiFromToken?token=${id}`, {
          headers: {
            Accept: 'application/json'
          }
        })
        console.log(response.data)

        setDataAll(response.data)
      } catch (error) {
        console.error('Failed to fetch units:', error)
        toast.error('Failed to load units')
      }
    }

    fetchUnits()

    // Automatically start the camera when the page is opened
    setIsCameraActive(true)
  }, [id])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 15
      }}
    >
      {/* Kop Surat */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '20px 40px',
          borderBottom: '1px solid black'
        }}
      >
        <Box component='img' src={`${urlImage}${dataAll.logo}`} alt='Logo' sx={{ width: 80, height: 80 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='h1'
            sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
          >
            {dataAll.owner}
          </Typography>
          <Typography variant='body1' sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>
            {dataAll.address}
          </Typography>
        </Box>
        <Box sx={{ width: 80 }} /> {/* Spacer untuk simetri */}
      </Box>
      <Box m={4} display='inline'></Box>

      {/* Konten utama */}
      <Typography variant='h3' sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }} gutterBottom>
        {dataAll.activity_name || dataAll.subject_name}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          gap: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Button
            variant='contained'
            color='success'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 300
            }}
          >
            <span>Jam Mulai:</span>
            <span>
              {new Date(dataAll.start_time_in).toLocaleString('id-ID', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </Button>

          <Button
            variant='contained'
            color='error'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 300
            }}
          >
            <span>Jam Selesai:</span>
            <span>
              {new Date(dataAll.end_time_in).toLocaleString('id-ID', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </Button>
        </Box>

        <Typography
          variant='h4'
          sx={{
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            marginTop: 2,
            fontSize: '2rem',
            fontWeight: 'bold'
          }}
        >
          {currentTime}
        </Typography>
      </Box>

      <Card sx={{ padding: 2, maxWidth: 500, margin: '0 auto', marginTop: 4 }}>
        {isCameraActive && (
          <Box sx={{ width: '100%', position: 'relative' }}>
            <video ref={camera} style={{ width: '100%', height: 'auto', borderRadius: 8 }} muted playsInline />
            {detectedCode && (
              <Typography variant='h6' sx={{ color: 'green', textAlign: 'center', marginTop: 2 }}>
                Nisn: {detectedCode}
              </Typography>
            )}
          </Box>
        )}
      </Card>

      <Container maxWidth='lg' sx={{ padding: '40px 0' }}>
        <Grid container spacing={4} justifyContent='center'></Grid>
      </Container>
    </Box>
  )
}

absensiToken.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

absensiToken.guestGuard = true

export default absensiToken
