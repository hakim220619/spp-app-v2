// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled, useTheme } from '@mui/material/styles'
import urlImage from '../../../../../configs/url_image'

// ** Type Import
import { LayoutProps } from 'src/@core/layouts/types'
import { useRouter } from 'next/router'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'


interface Props {
  hidden: LayoutProps['hidden']
  settings: LayoutProps['settings']
  saveSettings: LayoutProps['saveSettings']
  appBarContent: NonNullable<NonNullable<LayoutProps['horizontalLayoutProps']>['appBar']>['content']
  appBarBranding: NonNullable<NonNullable<LayoutProps['horizontalLayoutProps']>['appBar']>['branding']
}

const LinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  marginRight: theme.spacing(8)
}))

const AppBarContent = (props: Props) => {


  // ** Props
  const { appBarContent: userAppBarContent, appBarBranding: userAppBarBranding } = props
  const [logo, setLogo] = useState<string | null>('')

  // ** Hooks
  const [aplikasiName, setAplikasiName] = useState<string | null>(null)
  const theme = useTheme()
  const router = useRouter()

  useEffect(() => {
    const userDataString = localStorage.getItem('userData') as string | null

    if (!userDataString) {
      window.localStorage.removeItem('userData')
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('refreshToken')

      // Remove cookies
      Cookies.remove('token')
      Cookies.remove('userData')

      router.push('/login')

      return
    }

    const userData = JSON.parse(userDataString)

    // Check if the userData or required properties are null/undefined
    if (!userData || !userData.logo || !userData.aplikasi_name) {
      router.push('/login')

      return
    }

    const storedLogo = urlImage + userData.logo
    setLogo(storedLogo)
    setAplikasiName(userData.aplikasi_name)

  }, [router, logo])

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {userAppBarBranding ? (
        userAppBarBranding(props)
      ) : (
        <LinkStyled href='/'>
          <img
            src={logo || `${urlImage}uploads/aplikasi/logo.png`} // Use the logo from state or a default
            alt='Logo' // Provide an alt text for accessibility
            style={{ width: 50, height: 34 }} // Set the width and height
          />
          <Typography variant='h4' sx={{ ml: 2.5, fontWeight: 700, lineHeight: '24px' }}>
            {aplikasiName}
          </Typography>
        </LinkStyled>
      )}
      {userAppBarContent ? userAppBarContent(props) : null}
    </Box>
  )
}

export default AppBarContent
