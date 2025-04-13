import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import toast from 'react-hot-toast'
import axiosConfig from '../../../../configs/axiosConfig'
import { useRouter } from 'next/router'
import Link from 'next/link'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Box } from '@mui/system'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

const FormValidationSchema = () => {
    const { handleSubmit } = useForm()
    const router = useRouter()
    const { uid } = router.query
    const storedToken = window.localStorage.getItem('token')

    const [status, setStatus] = useState<string>('ON')
    const [role_id, setRoleId] = useState<string>('')
    const [menu_id, setMenuId] = useState<string>('')
    const [school_id, setSchoolId] = useState<string>('')
    const [order_list, setOrderList] = useState<string>('')
    const [menus, setMenus] = useState([])


    const [schools, setSchools] = useState([])
    const [roles, setRoles] = useState([])

    // State for checkbox values
    const [permissions, setPermissions] = useState({
        created: false,
        read: false,
        updated: false,
        deleted: false
    })

    useEffect(() => {
        if (storedToken) {
            axiosConfig
                .post(
                    '/detailMenuPermission',
                    { uid },
                    {
                        headers: {
                            Accept: 'application/json',
                            Authorization: `Bearer ${storedToken}`
                        }
                    }
                )
                .then(response => {
                    const { role_id, menu_id, status, school_id, created, read, updated, deleted } = response.data;
                    setRoleId(role_id);
                    setMenuId(menu_id);
                    setStatus(status);
                    setSchoolId(school_id);

                    // Set permissions based on the response data
                    setPermissions({
                        created: created,
                        read: read,
                        updated: updated,
                        deleted: deleted
                    });
                })
                .catch(error => {
                    console.error('Error fetching menu permission details:', error);
                });
        }
    }, [uid, storedToken]);


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
                    const filteredMenus = response.data.data;

                    // Sort the menus by parent_id in ascending order
                    const sortedMenus = filteredMenus.sort((a: any, b: any) => a.parent_id - b.parent_id);

                    setMenus(sortedMenus); // Set the filtered and sorted menus
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

    const handlePermissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target
        setPermissions(prevState => ({
            ...prevState,
            [name]: checked
        }))
    }

    const onSubmit = () => {
        const formData = {
            id: uid,
            school_id: school_id,
            menu_id,
            role_id,
            status,
            created: permissions.created ? 1 : 0,
            read: permissions.read ? 1 : 0,
            updated: permissions.updated ? 1 : 0,
            deleted: permissions.deleted ? 1 : 0
        }

        if (storedToken) {
            axiosConfig
                .post(
                    '/update-menuPermission',
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
                    router.push('/ms/setting/permission')
                })
                .catch(() => {
                    toast.error("Failed. This didn't work.")
                })
        }
    }

    const handleRoleChange = (event: any) => {
        setRoleId(event.target.value)
    }
    const handleMenuChange = (event: any) => {
        setMenuId(event.target.value)
    }

    const handleSchoolChange = (event: any) => {
        setSchoolId(event.target.value)
    }

    return (
        <Card>
            <CardHeader title='Update Menu Permission' />
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={5}>
                        <Grid item xs={12} sm={12} md={3}>
                            <CustomTextField select fullWidth label='Sekolah' value={school_id} onChange={handleSchoolChange}>
                                {schools.map((schoolItem: any) => (
                                    <MenuItem key={schoolItem.id} value={schoolItem.id}>
                                        {schoolItem.school_name}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
                        </Grid>

                        <Grid item xs={12} sm={12} md={3}>
                            <CustomTextField select fullWidth label='Role' value={role_id} onChange={handleRoleChange}>
                                {roles.map((role: any) => (
                                    <MenuItem key={role.id} value={role.id}>
                                        {role.role_name}
                                    </MenuItem>
                                ))}
                            </CustomTextField>
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
                                        {option.name} {option.address}
                                    </li>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} md={3}>
                            <CustomTextField select fullWidth label='Status' value={status} onChange={e => setStatus(e.target.value)}>
                                <MenuItem value='ON'>ON</MenuItem>
                                <MenuItem value='OFF'>OFF</MenuItem>
                            </CustomTextField>
                        </Grid>

                        {/* Checkbox group for Created, Read, Update, Delete */}
                        <Grid item xs={12} sm={12} md={12}>
                            <Grid container spacing={3}>
                                <Grid item xs={3}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={permissions.created}
                                                onChange={handlePermissionChange}
                                                name='created'
                                            />
                                        }
                                        label='Created'
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
                                                name='updated'
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
