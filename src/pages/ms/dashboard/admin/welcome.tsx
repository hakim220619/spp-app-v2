import React, { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { Box } from '@mui/system'

const Illustration = styled('img')(({ theme }) => ({
  right: 20,
  bottom: 0,
  position: 'absolute',
  [theme.breakpoints.down('sm')]: {
    right: 5,
    width: 110
  }
}))

const Welcome = () => {
  const [userName, setUserName] = useState('')
  const [motivationalQuote, setMotivationalQuote] = useState('')

  // Daftar kalimat motivasi
  const quotes = [
    'Keberhasilan dimulai dari langkah kecil! Setiap usaha membawamu lebih dekat.',
    'Jangan pernah menyerah pada impianmu! Berjuang untuk mencapainya!',
    'Setiap hari adalah kesempatan baru untuk mencapai tujuanmu!',
    'Tetap fokus dan jangan berhenti berusaha! Setiap langkah membawa kemajuan.',
    'Semangat! Kamu pasti bisa mencapai lebih! Percayalah diri dan terus berjuang!'
  ]

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}') // Mengambil data dari localStorage
    if (userData && userData.full_name) {
      setUserName(userData.full_name) // Mengatur nama pengguna jika ada
    }

    // Mengambil kalimat motivasi secara acak
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setMotivationalQuote(randomQuote)
  }, [])

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Typography variant='h5' sx={{ mb: 0.5 }}>
          Selamat Datang {userName}! 🎉
        </Typography>
        <Typography sx={{ mb: 10, color: 'text.secondary' }}>
          {motivationalQuote} {/* Menampilkan kalimat motivasi yang diambil secara acak */}
        </Typography>
        <Box m={5} display='inline'></Box>

        <Typography variant='h4' sx={{ mb: 0.75, color: 'primary.main' }}></Typography>

        <Button variant='contained'>{userName}</Button>
        <Illustration width={116} alt='congratulations' src='/images/cards/congratulations-john.png' />
      </CardContent>
    </Card>
  )
}

export default Welcome
