// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

const FooterContent = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const userData = localStorage.getItem('userData')
  const schoolName = userData ? JSON.parse(userData).school_name : 'Your School Name'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'right',
        justifyContent: isMobile ? 'center' : 'right',
        padding: '16px',
        position: 'relative',
        width: '100%'
      }}
    >
      <Typography sx={{ display: 'flex' }}>{`© ${new Date().getFullYear()}, ${schoolName}`}</Typography>
    </Box>
  )
}

export default FooterContent
