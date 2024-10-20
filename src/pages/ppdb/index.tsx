import { ReactNode, useEffect, useState } from 'react'
import { Box, Typography, TextField, Grid, Card, CardContent, CardMedia, Button, Container, Icon } from '@mui/material'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import axiosConfig from 'src/configs/axiosConfig'
import urlImage from 'src/configs/url_image'
import { useRouter } from 'next/router'

const Register = () => {
  const [sekolahData, setSekolahData] = useState([]) // State untuk menyimpan data sekolah
  const [search, setSearch] = useState('')

  const router = useRouter()

  const handleClick = (unit: any) => {
    router.push(`/ppdb/${unit}`)
  }

  // Mengambil data dari API ketika komponen di-mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosConfig.get('/getListPpdbActive', {
          params: { school_id: 530 }
        })
        setSekolahData(response.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const filteredData = sekolahData.filter((sekolah: any) =>
    sekolah.unit_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 15,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('/images/landing.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -2 // Pastikan di bawah overlay
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.9)', // Overlay lebih gelap untuk mode dark
          zIndex: -1 // Overlay di atas gambar tapi di bawah konten
        }
      }}
    >
      <Typography variant='h3' color='white' gutterBottom>
        PPDB ONLINE
      </Typography>

      {/* Form Pencarian */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 6,
          width: '100%',
          maxWidth: 600,
          color: 'white' // Tetap warna putih untuk komponen di dalam Box
        }}
      >
        <TextField
          variant='outlined'
          placeholder='Cari Sekolah'
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <Icon sx={{ mr: 1, color: 'white' }} />, // Ikon warna putih
            style: { color: 'white' } // Teks input warna putih
          }}
          inputProps={{
            style: { color: 'white' } // Placeholder warna putih
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'white' // Border warna putih
              },
              '&:hover fieldset': {
                borderColor: 'white'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white'
              }
            }
          }}
        />
      </Box>

      {/* Daftar Sekolah */}
      <Container maxWidth='lg' sx={{ padding: '40px 0' }}>
        <Grid container spacing={4} justifyContent='center'>
          {filteredData.map((sekolah: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={sekolah.id}>
              <Card
                sx={{
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
                  },
                  backgroundImage: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(41, 128, 185, 0.8) 200%)',
                  color: 'white',
                  margin: '5px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <CardMedia
                  component='img'
                  height='180'
                  image={`${urlImage}uploads/school/siswa_baru/${sekolah.school_id}/${sekolah.image}`}
                  alt={sekolah.school_name}
                  sx={{
                    objectFit: 'scale-down',
                    borderRadius: '16px 16px 0 0',
                    backgroundColor: 'transparent',
                    boxShadow: 'none'
                  }}
                />

                <CardContent
                  sx={{
                    background: 'linear-gradient(to bottom, #ffffff, #f1f1f1)',
                    padding: '20px',
                    textAlign: 'left',
                    minHeight: 200
                  }}
                >
                  {/* Mengatur Typography agar tampil berdampingan */}
                  <Grid container spacing={0}>
                    <Grid item xs={9}>
                      <Typography
                        variant='body1'
                        component='div'
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: '#333', fontSize: '15px' }}
                      >
                        {sekolah.unit_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} textAlign='right'>
                      <Typography
                        variant='body2'
                        component='div'
                        gutterBottom
                        sx={{ fontWeight: 'bold', color: '#333' }}
                      >
                        {sekolah.years}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography variant='body2' color='text.secondary' gutterBottom sx={{ color: '#555' }}>
                    {sekolah.address}
                  </Typography>
                  <Button
                    variant='contained'
                    color='primary'
                    sx={{
                      mt: 2,
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(90deg, #092f32 0%, #185a9d 80%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #146e74 0%, #5b86e5 100%)'
                      }
                    }}
                    onClick={() => handleClick(sekolah.url)} // Perbaikan di sini
                  >
                    Daftar Sekarang
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

Register.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

Register.guestGuard = true

export default Register
