import React, { useEffect, useState } from 'react'

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
import axiosConfig from '../../../../configs/axiosConfig'

import { useRouter } from 'next/navigation'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

interface ClassForm {
  name: string
  icon: string
  address: string
  order_list: number
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  order_list: yup.number().required('Order List is required')
});


const ClassFormComponent = () => {
  const router = useRouter()
  const [menus, setMenus] = useState([]) // State for unit options
  const [parent_id, setParentId] = useState<string>('')

  const defaultValues: ClassForm = {
    name: '',
    icon: '',
    address: '',
    order_list: 0,
  }

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ClassForm>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axiosConfig.get('/list-menu', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
          }
        })

        const userData = JSON.parse(localStorage.getItem('userData') as any)
        const schoolId = userData ? userData.school_id : null // Retrieve school_id from userData

        if (schoolId) {
          const filteredMenus = response.data.data
            .filter((unit: any) => unit.school_id === schoolId)  // Filter based on schoolId
            .sort((a: any, b: any) => a.parent_id - b.parent_id);  // Sort by parent_id in ascending order

          setMenus(filteredMenus); // Set the filtered and sorted menus
        } else {
          console.warn('No school_id found in userData');
          setMenus([]); // Handle accordingly if no school_id is found
        }

      } catch (error) {
        console.error('Failed to fetch menus:', error)
        toast.error('Failed to load menus')
      }
    }

    fetchMenu()
  }, [])

  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const schoolId = getDataLocal?.school_id

  const onSubmit = (data: ClassForm) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('icon', data.icon)
    formData.append('parent_id', parent_id)
    formData.append('order_list', data.order_list as any)
    formData.append('address', data.address)

    const storedToken = window.localStorage.getItem('token')
    axiosConfig
      .post('/create-menu', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then(response => {
        console.log(response)
        toast.success('Successfully Added Menu!')
        router.push('/ms/setting/menu')
      })
      .catch(() => {
        toast.error('Failed to add Menu')
      })
  }

  return (
    <Card>
      <CardHeader title='Tambah Menu' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={12} md={6}>
              <Controller
                name='name'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Menu'
                    onChange={onChange}
                    placeholder='e.g. Menu A'
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>

              <CustomAutocomplete
                fullWidth
                value={menus.find((menu: any) => menu.id === parent_id) || null}
                options={menus}
                onChange={(event, newValue: any) => {
                  setParentId(newValue ? newValue.id : ''); // Update with unique id
                }}
                id="autocomplete-menu"
                getOptionLabel={(option) => option.name || ''}
                renderInput={(params) => <CustomTextField {...params} label="Menu" variant="outlined" />}
                renderOption={(props, option) => (
                  <li {...props} key={option.id} style={{ fontWeight: option.parent_id === null ? 'bold' : 'normal' }}>
                    {option.name}
                  </li>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              <Controller
                name='icon'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Icon'
                    onChange={onChange}
                    placeholder='Enter class Icon'
                    error={Boolean(errors.icon)}
                    helperText={errors.icon?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Controller
                name='order_list'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Order List'
                    onChange={onChange}
                    placeholder='Enter class Order'
                    error={Boolean(errors.order_list)}
                    helperText={errors.order_list?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Controller
                name='address'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Address/Url'
                    onChange={onChange}
                    placeholder='Enter class address'
                    error={Boolean(errors.address)}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Box m={1} display='inline' />
              <Button type='button' variant='contained' color='secondary' onClick={() => router.push('/ms/setting/menu')}>
                Back
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ClassFormComponent
