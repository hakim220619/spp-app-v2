// ** React Imports
import { ReactNode } from 'react'

// ** MUI Components
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrations from 'src/views/pages/misc/FooterIllustrations'
import { useAuth } from 'src/hooks/useAuth'

// ** Styled Components
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    height: 400
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(20)
  }
}))

const Error404 = () => {
  const { logout } = useAuth()
  const back = () => {
    logout()
    document.cookie = 'userData=; Max-Age=0; path=/;'
    document.cookie = 'token=; Max-Age=0; path=/;'

    // Clear localStorage (userData and token)
    localStorage.removeItem('userData')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  return (
    <Box className='content-center'>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <BoxWrapper>
          <Typography variant='h2' sx={{ mb: 1.5 }}>
            Page Not Found :(
          </Typography>
          <Typography sx={{ mb: 6, color: 'text.secondary' }}>
            Oops! 😖 The requested URL was not found on this server.
          </Typography>
          <Button onClick={back} variant='contained'>
            Back to Home
          </Button>
        </BoxWrapper>
        <Img height='500' alt='error-illustration' src='/images/pages/404.png' />
      </Box>
      <FooterIllustrations />
    </Box>
  )
}

Error404.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default Error404
