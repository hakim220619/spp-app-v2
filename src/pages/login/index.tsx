// ** React Imports
import { ReactNode, useState, useEffect } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'
import MuiCard, { CardProps } from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

import * as yup from 'yup'

// ** Demo Imports
import AuthIllustrationV1Wrapper from 'src/views/pages/auth/AuthIllustrationV1Wrapper'
import { Controller, useForm } from 'react-hook-form'
import { CircularProgress } from '@mui/material'

import { useAuth } from 'src/hooks/useAuth'
import { yupResolver } from '@hookform/resolvers/yup'
import urlImage from 'src/configs/url_image'

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '25rem' }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: `${theme.palette.primary.main} !important`
}))

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    color: theme.palette.text.secondary
  }
}))

const schema = yup.object().shape({
  emailOrnisn: yup.string().required(),
  password: yup.string().min(1).required()
})

const defaultValues = {
  password: '',
  emailOrnisn: ''
}

interface FormData {
  emailOrnisn: string
  password: string
}

const LoginV1 = () => {
  const [rememberMe, setRememberMe] = useState<boolean>(true)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [templateName, setTemplateName] = useState<any>([])

  // ** Hooks
  const auth = useAuth()

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    async function fetchTemplateName() {
      try {
        const response = await fetch(`/api/getsettingapk?school_id=${process.env.NEXT_PUBLIC_SCHOOL_ID}`)

        const data = await response.json()
        if (response.ok) {
          setTemplateName(data.data) // Ganti ini jika API mengembalikan nama template
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error('Error fetching template name:', error)
      }
    }
    fetchTemplateName()
  }, [])

  const onSubmit = (data: FormData) => {
    setIsLoading(true)
    const { emailOrnisn, password } = data
    auth.login({ emailOrnisn, password, rememberMe }, () => {
      setError('emailOrnisn', {
        type: 'manual',
        message: 'Email or Password is invalid'
      })
      setIsLoading(false)
    })
  }
  console.log(`${urlImage}${templateName.logo}`)

  return (
    <Box className='content-center'>
      <AuthIllustrationV1Wrapper>
        <Card>
          <CardContent sx={{ p: theme => `${theme.spacing(10.5, 8, 8)} !important` }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box
                component='img'
                src={`${urlImage}${templateName.logo}`}
                alt='Logo'
                sx={{
                  width: 100,
                  height: 100
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant='h4'
                sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {`Welcome to ${templateName.aplikasi_name}! 👋🏻`}
              </Typography>
            </Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 4 }}>
                <Controller
                  name='emailOrnisn'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <CustomTextField
                      fullWidth
                      autoFocus
                      label='Email/Nisn'
                      value={value}
                      onBlur={onBlur}
                      onChange={onChange}
                      placeholder='admin@vuexy.com'
                      error={Boolean(errors.emailOrnisn)}
                      {...(errors.emailOrnisn && { helperText: errors.emailOrnisn.message })}
                    />
                  )}
                />
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      onBlur={onBlur}
                      label='Password'
                      onChange={onChange}
                      id='auth-login-v2-password'
                      error={Boolean(errors.password)}
                      {...(errors.password && { helperText: errors.password.message })}
                      type={showPassword ? 'text' : 'password'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Icon fontSize='1.25rem' icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Box>
              <Box
                sx={{
                  mb: 1.75,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <FormControlLabel
                  label='Remember Me'
                  control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />}
                />
                <Typography component={LinkStyled} href='/forgot-password'>
                  Lupa Password?
                </Typography>
              </Box>
              <Button
                fullWidth
                type='submit'
                variant='contained'
                sx={{ mb: 4 }}
                disabled={isLoading} // Disable button when loading
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} /> {/* Adjust margin to space the text and spinner */}
                    Loading...
                  </Box>
                ) : (
                  'Login'
                )}
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ color: 'text.secondary', mr: 2 }}>Registrasi Siswa Baru?</Typography>
                <Typography href='/ppdb' component={LinkStyled}>
                  Register
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>
      </AuthIllustrationV1Wrapper>
    </Box>
  )
}

LoginV1.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

LoginV1.guestGuard = true

export default LoginV1
