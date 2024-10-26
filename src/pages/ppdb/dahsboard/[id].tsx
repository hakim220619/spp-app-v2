// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** MUI Components
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'
import Navbar from 'src/pages/ppdb/navbar/index' // Import the Navbar
import axiosConfig from 'src/configs/axiosConfig'
import { useRouter } from 'next/router'
import StepperCustomHorizontal from './steep'
import Icon from 'src/@core/components/icon'
import { Stack } from '@mui/system'

// ** Styled Components
const SuccessText = styled('span')(({ theme }) => ({
  color: theme.palette.success.main // Use the success color from the theme
}))

const DashboardByTokenSiswa = () => {
  const [fullName, setFullName] = useState<string | null>(null)
  const [roleName, setRoleName] = useState<string | null>(null)
  const [dataAll, setDataALll] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true) // Tambahkan state loading
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    setLoading(true) // Mulai loading saat data sedang diambil
    axiosConfig
      .post(
        '/detailSiswaBaru',
        { uid: id },
        {
          headers: {
            Accept: 'application/json'
          }
        }
      )
      .then(response => {
        const { full_name, role_name } = response.data
        setFullName(full_name)
        setRoleName(role_name)
        setDataALll(response.data)
      })
      .catch(error => {
        console.error('Error fetching details:', error)
      })
      .finally(() => {
        setLoading(false) // Set loading selesai
      })
  }, [id])

  if (loading) {
    return <Typography>Loading...</Typography> // Tampilkan indikator loading
  }

  if (!dataAll) {
    return <Typography>Data tidak ditemukan.</Typography> // Tangani kasus data tidak tersedia
  }

  return (
    <Box className='content-right' margin={10} sx={{ backgroundColor: 'customColors.bodyBg' }}>
      <Box sx={{ maxWidth: 'auto', mx: 'auto', mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Navbar />
            <Box m={1} display='inline'></Box>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ position: 'relative', mb: 4 }}>
              <CardContent sx={{ p: theme => `${theme.spacing(6.75, 7.5)} !important` }}>
                <Typography variant='h5' sx={{ mb: 4.5 }}>
                  Selamat Datang{' '}
                  <Box component='span' sx={{ fontWeight: 'bold' }}>
                    {fullName}
                  </Box>
                  ! 🎉
                </Typography>
                <Typography variant='body2'>
                  Selamat datang kepada siswa baru, <SuccessText>{roleName}</SuccessText>! Kami sangat senang Anda
                  bergabung dengan kami. Semoga perjalanan belajar Anda penuh inspirasi dan kesuksesan!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Box m={1} display='inline'></Box>

        {dataAll.review === null ? (
          <StepperCustomHorizontal token={id} dataAll={dataAll} />
        ) : (
          <Card
            sx={{
              mt: 4,
              boxShadow: 4,
              borderRadius: 2
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant='h6'
                sx={{
                  mb: 3,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: 'warning.main'
                }}
              >
                Pengumuman
              </Typography>

              <Box display='flex' alignItems='center' justifyContent='center' sx={{ gap: 2 }}>
                {dataAll.status === 'Accepted' ? (
                  <Stack
                    spacing={2} // Jarak antar elemen
                    alignItems='center' // Pusatkan secara horizontal
                  >
                    <Icon icon='mdi:check-circle' fontSize={48} />

                    <Typography
                      variant='h5'
                      sx={{
                        fontWeight: 'bold',
                        color: 'AppWorkspace',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <SuccessText> Selamat! Anda telah diterima 🎉.</SuccessText>
                    </Typography>

                    <Typography
                      variant='h5'
                      sx={{
                        fontWeight: 'bold',
                        color: 'AppWorkspace',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <SuccessText> Silakan tunggu pemberitahuan selanjutnya dari kami.</SuccessText>
                    </Typography>
                  </Stack>
                ) : (
                  <>
                    <Icon icon='mdi:close-circle' />
                    <Typography
                      variant='h5'
                      sx={{
                        fontWeight: 'bold',
                        color: 'red',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Mohon maaf, Anda belum diterima 😞
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}

DashboardByTokenSiswa.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
DashboardByTokenSiswa.guestGuard = true

export default DashboardByTokenSiswa
