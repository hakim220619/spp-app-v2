import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Backdrop from '@mui/material/Backdrop'
import toast from 'react-hot-toast'

// Axios Import
import axiosConfig from '../../../../configs/axiosConfig'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'
import urlImage from 'src/configs/url_image'
import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel
} from '@mui/material'

const FormValidationSchema = () => {
  const { handleSubmit } = useForm()
  const storedToken = window.localStorage.getItem('token')

  // Initial states for form fields
  const [formData, setFormData] = useState<any>({
    uid: '',
    school_name: '',
    owner: '',
    phone: '',
    title: '',
    aplikasi_name: '',
    logo: null as File | null, // Logo now accepts a File or null
    copy_right: '',
    versi: '',
    token_whatsapp: '',
    urlCreateTransaksiMidtrans: '',
    urlCekTransaksiMidtrans: '',
    claientKey: '',
    serverKey: '',
    address: ''
  })
  const [LogoApk, setLogoApk] = useState<File | null>(null)

  const [isLoading, setIsLoading] = useState(false) // State for loading overlay
  const [isSubmitting, setIsSubmitting] = useState(false) // State for disabling the button

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  useEffect(() => {
    if (storedToken) {
      axiosConfig
        .post(
          '/detailSettingAplikasi',
          { school_id: schoolId },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const data = response.data

          // Populate form data
          setFormData({
            uid: data.id || '',
            school_name: data.school_name || '',
            owner: data.owner || '',
            phone: data.phone || '',
            title: data.title || '',
            aplikasi_name: data.aplikasi_name || '',
            logo: data.logo || '',
            copy_right: data.copy_right || '',
            versi: data.versi || '',
            token_whatsapp: data.token_whatsapp || '',
            urlCreateTransaksiMidtrans: data.urlCreateTransaksiMidtrans || '',
            urlCekTransaksiMidtrans: data.urlCekTransaksiMidtrans || '',
            claientKey: data.claientKey || '',
            serverKey: data.serverKey || '',
            address: data.address || ''
          })
          setLogoApk(data.logo)
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }
  }, [schoolId, storedToken])

  const onSubmit = () => {
    // Create a new FormData instance
    const formDataToSend = new FormData()

    // Append the school_id to FormData
    formDataToSend.append('school_id', schoolId)
    formDataToSend.append('is_production', isProduction.toString())
    formDataToSend.append('is_whatsapp', isWhatsapp.toString())

    // Append all fields from formData
    for (const key in formData) {
      if (key !== 'logo') {
        // Skip 'logo' key
        formDataToSend.append(key, formData[key])
      }
    }

    // // Append fields from the data object
    // for (const key in data) {
    //   formDataToSend.append(key, data[key])
    // }

    // Append the logo file if it exists
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo) // Assuming 'data.logo' is the File object
    }

    if (storedToken) {
      setIsLoading(true) // Show loading overlay
      setIsSubmitting(true) // Disable the submit button
      axiosConfig
        .post(
          '/update-aplikasi',
          formDataToSend, // Send FormData directly
          {
            headers: {
              // Note: Do not set Content-Type when sending FormData; Axios sets it automatically
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(() => {
          toast.success('Successfully Updated!')
        })
        .catch(() => {
          toast.error("Failed. This didn't work.")
        })
        .finally(() => {
          setIsLoading(false) // Hide loading overlay
          setIsSubmitting(false) // Re-enable the submit button
        })
    }
  }

  const renderUploadedFile = (file: File | null) => {
    const existingFilePath = ''

    return (
      <div>
        {file ? (
          <>
            <p>{file.name}</p>
            {file.type && file.type.startsWith('image/') && (
              <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100px', marginTop: '10px' }} />
            )}
          </>
        ) : (
          existingFilePath && (
            <img
              src={`${urlImage}/${existingFilePath}`} // Ensure proper slash between URL and file path
              alt='Existing file'
              style={{ width: '100px', marginTop: '10px' }}
            />
          )
        )}
      </div>
    )
  }
  const [isProduction, setIsProduction] = useState<boolean>(true)
  const [isWhatsapp, setIsWhatsapp] = useState<boolean>(true)

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const handleClickOpen = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setOpenDialog(true)
  }
  const handleClose = () => {
    setOpenDialog(false)
    setSelectedImage(null)
  }
  const handleChange = (event: any) => {
    const target = event.target
    if (target.name === 'isProductionTrue') {
      setIsProduction(true)
    } else if (target.name === 'isProductionFalse') {
      setIsProduction(false)
    }
  }
  const handleChangeWhatsapp = (event: any) => {
    const target = event.target
    if (target.name === 'isWhatsappTrue') {
      setIsWhatsapp(true)
    } else if (target.name === 'isWhatsappFalse') {
      setIsWhatsapp(false)
    }
  }

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Card>
        <CardHeader title='Aplikasi' />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={5}>
              {/* Logo Field */}
              <Grid item xs={12} sm={12}>
                <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                  {LogoApk && (
                    <>
                      {renderUploadedFile(LogoApk as any)}
                      <img
                        src={`${urlImage}${LogoApk}`}
                        style={{ width: '100px', marginTop: '10px', cursor: 'pointer' }}
                        onClick={() => handleClickOpen(`${urlImage}${LogoApk}`)}
                        alt='Kartu Keluarga'
                      />
                    </>
                  )}
                  <Box m={2} display='inline'></Box>

                  <label htmlFor='logo-upload'>
                    <Button variant='outlined' component='span'>
                      Upload Logo
                    </Button>
                  </label>

                  {/* Hidden Input for File Upload */}
                  <input
                    name='logo'
                    accept='image/*'
                    id='logo-upload'
                    type='file'
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFormData({ ...formData, logo: file }) // Store the file in state
                      }
                    }}
                  />

                  {/* Logo Preview below the button */}
                </Box>
              </Grid>
            </Grid>

            <Box m={1} display='inline'></Box>
            <Grid container spacing={5}>
              {/* School ID Field */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Nama Sekolah'
                  value={formData.school_name}
                  onChange={e => setFormData({ ...formData, school_name: e.target.value })}
                  placeholder='School ID'
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Grid>

              {/* Owner Field */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Pemilik'
                  value={formData.owner}
                  onChange={e => setFormData({ ...formData, owner: e.target.value })}
                  placeholder='Owner'
                />
              </Grid>

              {/* Phone Field */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='No. Wa'
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder='Phone'
                />
              </Grid>

              {/* Title Field */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Title'
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder='Title'
                />
              </Grid>

              {/* Aplikasi Name Field */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Nama Aplikasi'
                  value={formData.aplikasi_name}
                  onChange={e => setFormData({ ...formData, aplikasi_name: e.target.value })}
                  placeholder='Nama Aplikasi'
                />
              </Grid>

              {/* Copyright Field */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Copyright'
                  value={formData.copy_right}
                  onChange={e => setFormData({ ...formData, copy_right: e.target.value })}
                  placeholder='Copyright Text'
                />
              </Grid>

              {/* Versi Field */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Versi'
                  value={formData.versi}
                  onChange={e => setFormData({ ...formData, versi: e.target.value })}
                  placeholder='Version'
                />
              </Grid>

              {/* Token WhatsApp Field */}
              <Grid item xs={12} sm={2} md={2} lg={2}>
                <Grid container spacing={2}>
                  <Grid item xs={20}>
                    <FormControl component='fieldset'>
                      <FormLabel component='legend'>Whatsapp Aktif?</FormLabel>
                      <FormGroup row>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name='isWhatsappTrue'
                              checked={isWhatsapp === true}
                              onChange={handleChangeWhatsapp}
                              value={true}
                            />
                          }
                          label='Ya'
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              name='isWhatsappFalse'
                              checked={isWhatsapp === false}
                              onChange={handleChangeWhatsapp}
                              value={false}
                            />
                          }
                          label='Tidak'
                        />
                      </FormGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              {isWhatsapp && (
                <Grid item xs={12} sm={10}>
                  <CustomTextField
                    fullWidth
                    label='Token WhatsApp'
                    value={formData.token_whatsapp}
                    onChange={e => setFormData({ ...formData, token_whatsapp: e.target.value })}
                    placeholder='WhatsApp Token'
                    disabled={false}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={4} lg={12}>
                <Grid container spacing={2}>
                  <Grid item xs={10}>
                    <FormControl component='fieldset'>
                      <FormLabel component='legend'>Mode Pembayaran</FormLabel>
                      <FormGroup row>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name='isProductionTrue'
                              checked={isProduction === true}
                              onChange={handleChange}
                              value={true}
                            />
                          }
                          label='Langsung'
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              name='isProductionFalse'
                              checked={isProduction === false}
                              onChange={handleChange}
                              value={false}
                            />
                          }
                          label='Uji COba'
                        />
                      </FormGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              {/* URL Create Transaksi Midtrans */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='URL Create Transaksi Midtrans'
                  value={formData.urlCreateTransaksiMidtrans}
                  onChange={e => setFormData({ ...formData, urlCreateTransaksiMidtrans: e.target.value })}
                  placeholder='URL Create Transaksi'
                />
              </Grid>

              {/* URL Cek Transaksi Midtrans */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='URL Cek Transaksi Midtrans'
                  value={formData.urlCekTransaksiMidtrans}
                  onChange={e => setFormData({ ...formData, urlCekTransaksiMidtrans: e.target.value })}
                  placeholder='URL Cek Transaksi'
                />
              </Grid>

              {/* Client Key */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Client Key'
                  value={formData.claientKey}
                  onChange={e => setFormData({ ...formData, claientKey: e.target.value })}
                  placeholder='Client Key'
                />
              </Grid>

              {/* Server Key */}
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label='Server Key'
                  value={formData.serverKey}
                  onChange={e => setFormData({ ...formData, serverKey: e.target.value })}
                  placeholder='Server Key'
                />
              </Grid>

              {/* Address Field */}
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Alamat'
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder='Alamat'
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button type='submit' variant='contained' disabled={isSubmitting}>
                  Save
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
        <Dialog open={openDialog} onClose={handleClose}>
          <DialogTitle>Image Preview</DialogTitle>
          <DialogContent>
            {selectedImage && <img src={selectedImage} style={{ width: '100%' }} alt='Preview' />}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  )
}

export default FormValidationSchema
