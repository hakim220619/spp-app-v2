import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import toast from 'react-hot-toast'
import axiosConfig from '../../../configs/axiosConfig'
import { useRouter } from 'next/router'
import Link from 'next/link'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

const FormValidationSchema = () => {
  const { handleSubmit } = useForm()
  const router = useRouter()
  const { uid } = router.query
  const storedToken = window.localStorage.getItem('token')

  const [status, setStatus] = useState<string>('ON')
  const [name, setClassName] = useState<string>('')
  const [address, setClassDesc] = useState<string>('')
  const [school_id, setSchoolId] = useState<string>('')
  const [order_list, setOrderList] = useState<string>('')
  const [icon, setIcon] = useState<string>('')
  const [parent_id, setParentId] = useState<string>('')
  const [parent_ids, setParentIds] = useState<any[]>([])

  useEffect(() => {
    if (storedToken) {
      axiosConfig
        .post(
          '/detailMenu',
          { uid },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(response => {
          const { name, address, status, school_id, icon, parent_id, order_list } = response.data
          setClassName(name)
          setClassDesc(address)
          setStatus(status)
          setSchoolId(school_id)
          setIcon(icon)
          setParentId(parent_id)
          setOrderList(order_list)
        })
        .catch(error => {
          console.error('Error fetching class details:', error)
        })
    }
  }, [uid, storedToken])

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axiosConfig.get('/list-menu', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
          }
        })

        const userData = JSON.parse(localStorage.getItem('userData') as any)
        const schoolId = userData ? userData.school_id : null

        if (schoolId) {
          const filteredMenu = response.data.data.filter((unit: any) => unit.school_id === schoolId).sort((a: any, b: any) => a.parent_id - b.parent_id);
          setParentIds(filteredMenu)
        } else {
          console.warn('No school_id found in userData')
          setParentIds([])
        }
      } catch (error) {
        console.error('Failed to fetch units:', error)
        toast.error('Failed to load units')
      }
    }

    fetchUnits()
  }, [])

  const onSubmit = () => {
    const formData = {
      id: uid,
      name,
      address,
      icon,
      order_list,
      parent_id
    }

    if (storedToken) {
      axiosConfig
        .post(
          '/update-menu',
          { data: formData },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          }
        )
        .then(() => {
          toast.success('Successfully Updated!')
          router.push('/ms/setting/menu')
        })
        .catch(() => {
          toast.error("Failed. This didn't work.")
        })
    }
  }

  return (
    <Card>
      <CardHeader title='Update Menu' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={12} md={6}>
              <CustomTextField
                fullWidth
                value={name}
                onChange={e => setClassName(e.target.value)}
                label='Menu'
                placeholder='Menu'
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <CustomAutocomplete
                fullWidth
                value={parent_ids.find((menu: any) => menu.id === parent_id) || null}
                options={parent_ids}
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
              <CustomTextField
                fullWidth
                value={icon}
                onChange={e => setIcon(e.target.value)}
                label='Icon'
                placeholder='ex md'
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <CustomTextField
                fullWidth
                value={order_list}
                onChange={e => setOrderList(e.target.value)}
                label='Order'
                placeholder='12345'
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
              <CustomTextField
                fullWidth
                value={address}
                onChange={e => setClassDesc(e.target.value)}
                label='Address'
                placeholder='address/url'
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Simpan
              </Button>
              <Box m={1} display='inline'></Box>
              <Link href='/ms/setting/menu' passHref>
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
