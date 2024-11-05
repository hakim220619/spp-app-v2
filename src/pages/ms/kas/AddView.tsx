import React from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import { Box } from '@mui/system'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Imports
import axiosConfig from '../../../configs/axiosConfig'
import { useRouter } from 'next/navigation'

interface TransactionForm {
  description: string
  transaction_type: 'DEBIT' | 'KREDIT'
  amount: string // Keep as string for formatted input
}

const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  transaction_type: yup
    .string()
    .oneOf(['DEBIT', 'KREDIT'], 'Invalid transaction type')
    .required('Transaction Type is required'),
  amount: yup.string().required('Amount is required') // Validation for string input
})

const TransactionFormComponent = () => {
  const router = useRouter()

  const defaultValues: TransactionForm = {
    description: '',
    transaction_type: 'DEBIT',
    amount: ''
  }
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TransactionForm>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = (data: TransactionForm) => {
    const storedToken = window.localStorage.getItem('token')
    const formData = {
      user_id: getDataLocal.id,
      school_id: getDataLocal.school_id,
      description: data.description,
      transaction_type: data.transaction_type,
      amount: parseFloat(data.amount.replace(/\./g, '').replace(',', '.')) // Convert back to a number for submission
    }

    axiosConfig
      .post('/create-kas', formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Kas!')
        router.push('/ms/kas')
      })
      .catch(() => {
        toast.error('Failed to add transaction')
      })
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '') // Remove non-numeric characters
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseInt(numericValue || '0', 10)) // Format as currency
  }

  return (
    <Card>
      <CardHeader title='Tambah Transaksi' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Controller
                name='description'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    rows={4}
                    multiline
                    label='Deskripsi'
                    onChange={onChange}
                    placeholder='Enter transaction description'
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='transaction_type'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Tipe Kas'
                    onChange={onChange}
                    error={Boolean(errors.transaction_type)}
                    helperText={errors.transaction_type?.message}
                  >
                    <MenuItem value='DEBIT'>MASUK</MenuItem>
                    <MenuItem value='KREDIT'>KELUAR</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='amount'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    type='text' // Keep as text for formatting
                    value={formatCurrency(value)} // Format value as Rupiah
                    label='Jumlah'
                    onChange={e => {
                      const inputValue = e.target.value.replace(/\D/g, '') // Remove formatting
                      onChange(inputValue) // Update the value in the form
                    }}
                    placeholder='Enter amount'
                    error={Boolean(errors.amount)}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Simpan
              </Button>
              <Box m={1} display='inline' />
              <Button type='button' variant='contained' color='secondary' onClick={() => router.push('/ms/kas')}>
                Kembali
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default TransactionFormComponent
