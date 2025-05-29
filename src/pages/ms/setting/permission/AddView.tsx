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
import { Checkbox, FormControlLabel } from '@mui/material'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

interface ClassForm {
  role_id: string
  menu_id: string
  status: 'ON' | 'OFF'
  school_id: string
}

const schema = yup.object().shape({
  role_id: yup.string().required('Name is required'),
  status: yup.string().oneOf(['ON', 'OFF'], 'Invalid status').required('Status is required'),
});


const ClassFormComponent = () => {
  const router = useRouter()
  const [menus, setMenus] = useState([])
  const [menu_id, setMenuId] = useState<string>('')

  const [schools, setSchools] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState({
    created: true,
    read: true,
    updated: true,
    deleted: true
  })
  const defaultValues: ClassForm = {
    role_id: '',
    menu_id: '',
    status: 'ON',
    school_id: ''
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
        const response = await axiosConfig.get('/list-menu-main', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
          }
        })

        const userData = JSON.parse(localStorage.getItem('userData') as any)
        const schoolId = userData ? userData.school_id : null // Retrieve school_id from userData

        if (schoolId) {
          const filteredMenus = response.data.data;

          // Sort the menus by parent_id in ascending order
          const sortedMenus = filteredMenus.sort((a: any, b: any) => a.parent_id - b.parent_id);

          // Filter out menus with duplicate names
          const uniqueMenus = sortedMenus.filter((menu: any, index: any, self: any) =>
            index === self.findIndex((m: any) => m.name === menu.name && m.address === menu.address)
          );


          setMenus(uniqueMenus); // Set the filtered and sorted unique menus
        } else {
          console.warn('No school_id found in userData');
          setMenus([]); // Or handle accordingly if no school_id is found
        }


      } catch (error) {
        console.error('Failed to fetch menus:', error)
        toast.error('Failed to load menus')
      }
    }

    fetchMenu()
  }, [])
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axiosConfig.get('/getSchool', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
          }
        })
        setSchools(response.data)
      } catch (error) {
        console.error('Failed to fetch schools:', error)
        toast.error('Failed to load schools')
      }
    }

    const fetchRoles = async () => {
      try {
        const response = await axiosConfig.get('/getRole', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
          }
        })
        setRoles(response.data)
      } catch (error) {
        console.error('Failed to fetch roles:', error)
        toast.error('Failed to load roles')
      }
    }

    fetchSchools()
    fetchRoles()
  }, [])
  const onSubmit = (data: ClassForm) => {
    const formData = new FormData()
    formData.append('role_id', data.role_id)
    formData.append('menu_id', menu_id)
    formData.append('school_id', data.school_id)
    formData.append('created', permissions.created ? '1' : '0')
    formData.append('updated', permissions.updated ? '1' : '0')
    formData.append('read', permissions.read ? '1' : '0')
    formData.append('deleted', permissions.deleted ? '1' : '0')

    const storedToken = window.localStorage.getItem('token')
    if (!storedToken) {
      toast.error('Authentication token is missing or expired.')
      return
    }

    axiosConfig
      .post('/create-menuPermission', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${storedToken}`
        }
      })
      .then((response: any) => {
        if (response) {
          toast.success('Successfully Added Menu!')
          router.push('/ms/setting/permission')
        } else {
          toast.error('Failed to add Menu: ' + response.message || 'Unknown error')
        }
      })
      .catch((error) => {
        console.error('Error:', error)
        // Check if the error response has a message and show it
        const errorMessage = error?.response?.data?.message || 'Failed to add Menu due to an error.'
        toast.error(errorMessage)
      })
  }


  const handlePermissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target
    setPermissions(prevState => ({
      ...prevState,
      [name]: checked
    }))
  }

  return (
    <Card>
      <CardHeader title='Tambah Menu Permission' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={12} md={3}>
              <Controller
                name='school_id' // New Controller for unit selection
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='School'
                    onChange={onChange}
                    error={Boolean(errors.school_id)}
                    helperText={errors.school_id?.message}
                  >
                    {
                      schools.map((schoolItem: any) => (
                        <MenuItem key={schoolItem.id} value={schoolItem.id}>
                          {schoolItem.school_name}
                        </MenuItem>
                      ))
                    }

                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Controller
                name='role_id' // New Controller for unit selection
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Role'
                    onChange={onChange}
                    error={Boolean(errors.role_id)}
                    helperText={errors.role_id?.message}
                  >
                    {roles.map((role: any) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.role_name} {role.id}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <CustomAutocomplete
                fullWidth
                value={menus.find((menu: any) => menu.id === menu_id) || null}
                options={menus}
                onChange={(event, newValue: any) => {
                  setMenuId(newValue ? newValue.id : ''); // Update with unique id
                }}
                id="autocomplete-menu"
                getOptionLabel={(option) => option.name || ''}
                renderInput={(params) => <CustomTextField {...params} label="Menu" variant="outlined" />}
                renderOption={(props, option) => (
                  <li {...props} key={option.id} style={{ fontWeight: option.parent_id === null ? 'bold' : 'normal' }}>
                    {option.name} - {option.address}
                  </li>
                )}
              />

            </Grid>


            <Grid item xs={12} sm={12} md={3}>
              <Controller
                name='status'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    select
                    fullWidth
                    value={value}
                    label='Status'
                    onChange={onChange}
                    error={Boolean(errors.status)}
                    helperText={errors.status?.message}
                  >
                    <MenuItem value='ON'>ON</MenuItem>
                    <MenuItem value='OFF'>OFF</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
              <Grid container spacing={3}>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissions.created}
                        onChange={handlePermissionChange}
                        name='create'
                      />
                    }
                    label='Create'
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissions.read}
                        onChange={handlePermissionChange}
                        name='read'
                      />
                    }
                    label='Read'
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissions.updated}
                        onChange={handlePermissionChange}
                        name='update'
                      />
                    }
                    label='Update'
                  />
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissions.deleted}
                        onChange={handlePermissionChange}
                        name='deleted'
                      />
                    }
                    label='Delete'
                  />
                </Grid>
              </Grid>
            </Grid>


            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
              <Box m={1} display='inline' />
              <Button type='button' variant='contained' color='secondary' onClick={() => router.push('/ms/kelas')}>
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
