import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import toast from 'react-hot-toast'

// Axios Import
import axiosConfig from '../../../configs/axiosConfig'
import { useRouter } from 'next/router'
import Link from 'next/link'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'

const FormValidationSchema = () => {
  const { handleSubmit } = useForm()
  const router = useRouter()
  const { uid } = router.query
  const storedToken = window.localStorage.getItem('token')
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [transactionType, setTransactionType] = useState<string>('')
  const [amount, setAmount] = useState<any>('') // Updated to number or string
  const [description, setDescription] = useState<string>('')

  // Fetch class details
  useEffect(() => {
    if (storedToken) {
      axiosConfig
        .post(
          '/detailKas',
          { uid },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { type, amount, deskripsi } = response.data
          setTransactionType(type)
          setAmount(amount)
          setDescription(deskripsi)
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }
  }, [uid, storedToken])

  const onSubmit = () => {
    const formData = {
      id: uid,
      user_id: getDataLocal.id,
      transactionType,
      amount: amount, // Convert amount to number without dots
      description
    }

    if (storedToken) {
      axiosConfig
        .post(
          '/update-kas',
          { data: formData },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(() => {
          toast.success('Transaction Successfully Submitted!')
          router.push('/ms/kas') // Redirect to your transactions page
        })
        .catch(() => {
          toast.error('Failed to submit transaction. Please try again.')
        })
    }
  }

  // Format amount as Rupiah for display
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(amount) || 0)

  return (
    <Card>
      <CardHeader title='Transaction Form' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Description Field */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                label='Description'
                placeholder='Enter transaction description'
              />
            </Grid>
            {/* Transaction Type Selection Field */}
            <Grid item xs={6}>
              <CustomTextField
                select
                fullWidth
                label='Transaction Type'
                value={transactionType}
                onChange={e => setTransactionType(e.target.value)}
              >
                <MenuItem value='DEBIT'>MASUK</MenuItem>
                <MenuItem value='KREDIT'>KELUAR</MenuItem>
              </CustomTextField>
            </Grid>

            {/* Amount Field */}
            <Grid item xs={6}>
              <CustomTextField
                fullWidth
                type='text' // Change to text for formatting
                value={formattedAmount} // Use formatted amount for display
                onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} // Set only numeric values
                label='Amount'
                placeholder='Enter Amount'
                inputProps={{ min: 0 }} // Ensure non-negative amounts
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Simpan
              </Button>
              <Box m={1} display='inline'></Box>
              <Link href='/ms/kas' passHref>
                <Button type='button' variant='contained' color='secondary'>
                  Kembali
                </Button>
              </Link>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationSchema
