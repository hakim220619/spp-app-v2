// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { Theme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiStep, { StepProps } from '@mui/material/Step'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import StepperCustomDot from './StepperCustomDot'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Styled Component
import StepperWrapper from 'src/@core/styles/mui/stepper'
import DetailSiswa from './detailSiswa'
import LengkapiDataSiswaBaru from './FormDetailSiswa'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosConfig from 'src/configs/axiosConfig'

interface State {
  password: string
  password2: string
  showPassword: boolean
  showPassword2: boolean
}

const steps = [
  {
    icon: 'tabler:user',
    title: 'Details Siswa',
    subtitle: 'Periksa Apakah sudah sesuai?'
  },
  {
    icon: 'tabler:user-check',
    title: 'Lengkapi Data Diri',
    subtitle: 'Lengkapi semua form yang ada'
  },
  {
    icon: 'tabler:check',
    title: 'Review & Submit',
    subtitle: 'Berikan Comment dan Reviuw untuk admin'
  }
]

const Step = styled(MuiStep)<StepProps>(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  '&:first-of-type': {
    paddingLeft: 0
  },
  '&:last-of-type': {
    paddingRight: 0
  },
  '& .MuiStepLabel-iconContainer': {
    display: 'none'
  },
  '& .step-subtitle': {
    color: `${theme.palette.text.disabled} !important`
  },
  '& + svg': {
    color: theme.palette.text.disabled
  },
  '&.Mui-completed .step-title': {
    color: theme.palette.text.disabled
  },
  '&.Mui-completed + svg': {
    color: theme.palette.primary.main
  },
  [theme.breakpoints.down('md')]: {
    padding: 0,
    ':not(:last-of-type)': {
      marginBottom: theme.spacing(6)
    }
  }
}))

interface Props {
  token: any
  dataAll: any
}

const StepperCustomHorizontal: React.FC<Props> = ({ token, dataAll }) => {
  const [review, setReview] = useState('')

  const handleChangeReview = (event: any) => {
    setReview(event.target.value)
  }

  const [activeStep, setActiveStep] = useState<number>(0)
  const [state, setState] = useState<State>({
    password: '',
    password2: '',
    showPassword: false,
    showPassword2: false
  })

  const { settings } = useSettings()
  const smallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const { direction } = settings

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
    if (activeStep === steps.length - 1) {
      savePpdbSiswaBaruBerkas()
      toast.success('Form Submitted')
    }
  }

  const savePpdbSiswaBaruBerkas = async () => {
    const response = await axiosConfig.post('/reviewAndMasukanBySiswa', { id: dataAll.id, review: review })
    console.log('Data PPDB siswa baru berhasil disimpan!', response)
  }

  const handleReset = () => {
    setActiveStep(0)
    setState({ ...state, password: '', password2: '' })
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <DetailSiswa data={dataAll} icon={<Icon icon='tabler:user' />} />
      case 1:
        return dataAll.status !== 'Accepted' ? <LengkapiDataSiswaBaru token={token} dataAll={dataAll} /> : null
      case 2:
        return (
          <Grid container spacing={2} sx={{ margin: '20px' }}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Typography variant='body1' gutterBottom>
                  Terima kasih telah memberikan saran dan kritik!
                </Typography>
                {dataAll.review === null ? (
                  <CustomTextField
                    name='address'
                    placeholder='Berikan saran dan kritik'
                    rows={5}
                    value={review}
                    onChange={handleChangeReview}
                    fullWidth
                    multiline
                  />
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        )
      default:
        return 'Unknown Step'
    }
  }

  const renderContent = () => {
    if (activeStep === steps.length) {
      return (
        <>
          <Typography>All steps are completed!</Typography>
          {dataAll.review === null ? (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant='contained' onClick={handleReset}>
                Reset
              </Button>
            </Box>
          ) : null}
        </>
      )
    } else {
      return (
        <form onSubmit={e => e.preventDefault()}>
          <Grid container spacing={5}>
            {getStepContent(activeStep)}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant='tonal' color='secondary' disabled={activeStep === 0} onClick={handleBack}>
                Kembali
              </Button>
              <Button
                variant='contained'
                onClick={handleNext}
                disabled={activeStep === 1 && dataAll.status !== 'Accepted'}
              >
                {activeStep === steps.length ? 'Simpan' : 'Lanjutkan'}
              </Button>
            </Grid>
          </Grid>
        </form>
      )
    }
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <StepperWrapper>
            <Stepper
              activeStep={activeStep}
              connector={
                !smallScreen ? (
                  <Icon icon={direction === 'ltr' ? 'tabler:chevron-right' : 'tabler:chevron-left'} />
                ) : null
              }
            >
              {steps.map((step, index) => {
                const RenderAvatar = activeStep >= index ? CustomAvatar : Avatar

                return (
                  <Step key={index}>
                    <StepLabel StepIconComponent={StepperCustomDot}>
                      <div className='step-label'>
                        <RenderAvatar
                          variant='rounded'
                          {...(activeStep >= index && { skin: 'light' })}
                          {...(activeStep === index && { skin: 'filled' })}
                          {...(activeStep >= index && { color: 'primary' })}
                        >
                          <Icon icon={step.icon} />
                        </RenderAvatar>
                        <div>
                          <Typography className='step-title'>{step.title}</Typography>
                          <Typography className='step-subtitle'>{step.subtitle}</Typography>
                        </div>
                      </div>
                    </StepLabel>
                  </Step>
                )
              })}
            </Stepper>
          </StepperWrapper>
        </Box>
      </CardContent>
      <Divider />
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}

export default StepperCustomHorizontal
