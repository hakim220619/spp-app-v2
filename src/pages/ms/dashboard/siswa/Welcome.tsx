import React, { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { Box } from '@mui/system'

const Illustration = styled('img')(({ theme }) => ({
  right: 10,
  bottom: -15,
  position: 'absolute',
  [theme.breakpoints.down('sm')]: {
    right: 5,
    width: 110
  }
}))

const Welcome = () => {
  const [userName, setUserName] = useState('')
  const [motivationalQuote, setMotivationalQuote] = useState('')
  const [waktuNow, setWaktuNow] = useState('')

  // Daftar kalimat motivasi
  const quotes = [
    'Keberhasilan dimulai dari langkah kecil! Setiap usaha membawamu lebih dekat.',
    'Jangan pernah menyerah pada impianmu! Berjuang untuk mencapainya!',
    'Setiap hari adalah kesempatan baru untuk mencapai tujuanmu!',
    'Tetap fokus dan jangan berhenti berusaha! Setiap langkah membawa kemajuan.',
    'Semangat! Kamu pasti bisa mencapai lebih! Percayalah diri dan terus berjuang!'
  ]

  useEffect(() => {
    // Mengambil data pengguna dari localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    if (userData && userData.full_name) {
      setUserName(userData.full_name)
    }

    // Mengambil kalimat motivasi secara acak
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setMotivationalQuote(randomQuote)

    // Mengatur waktu saat ini setiap detik
    const intervalId = setInterval(() => {
      const waktu = new Date().toLocaleTimeString()
      setWaktuNow(waktu)
    }, 1000)

    // Membersihkan interval saat komponen unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <Card
      sx={{
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <CardContent>
        <Typography variant='h5' sx={{ mb: 0.5 }}>
          Selamat Datang {userName}! 🎉
        </Typography>
        <Typography sx={{ mb: 10, color: 'text.secondary' }}>
          {motivationalQuote} {/* Menampilkan kalimat motivasi yang diambil secara acak */}
        </Typography>
        <Box m={5} display='inline'></Box>

        <Typography variant='h4' sx={{ mb: 0.75, color: 'primary.main' }}></Typography>
        <Typography variant='h4' sx={{ mb: 0.75, color: 'dark.main' }}>
          {' '}
          {waktuNow}
        </Typography>

        <Illustration width={116} alt='congratulations' src='/images/pages/create-account-dark.png' />
      </CardContent>
    </Card>
  )
}

export default Welcome
