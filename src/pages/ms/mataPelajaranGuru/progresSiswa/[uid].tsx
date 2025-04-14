import { useState, useEffect, useCallback } from 'react'
import {
    Card,
    Grid,
    Divider,
    IconButton,
    CardHeader,
    CircularProgress,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchDataProgresSiswa, deleteProgresSiswa } from 'src/store/apps/progresSiswa/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/kelas/TableHeader'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosConfig from 'src/configs/axiosConfig'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import { subject } from '@casl/ability'

interface CellType {
    row: UsersType
}

const statusObj: any = {
    ON: { title: 'ON', color: 'primary' },
    OFF: { title: 'OFF', color: 'error' }
}

const RowOptions = ({ uid }: { uid: any }) => {
    const data = localStorage.getItem('userData') as string
    const getDataLocal = JSON.parse(data)
    const [open, setOpen] = useState(false)
    const [school_id] = useState<number>(getDataLocal.school_id)
    const [value] = useState<string>('')
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()

    const handleRowEditedClick = () => router.push('/ms/kelas/' + uid)

    const handleDelete = async () => {
        try {
            await dispatch(deleteProgresSiswa(uid)).unwrap()
            await dispatch(fetchDataProgresSiswa({ school_id, status: '', q: value }))
            toast.success('Successfully deleted!')
            setOpen(false)
        } catch (error) {
            console.error('Failed to delete user:', error)
            toast.error('Failed to delete user. Please try again.')
        }
    }

    const handleClickOpenDelete = () => setOpen(true)
    const handleClose = () => setOpen(false)

    return (
        <>
            <IconButton size='small' color='success' onClick={handleRowEditedClick}>
                <Icon icon='tabler:edit' />
            </IconButton>
            <IconButton size='small' color='error' onClick={handleClickOpenDelete}>
                <Icon icon='tabler:trash' />
            </IconButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{'Apakah Anda yakin ingin menghapus data ini?'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>Anda tidak akan dapat mengurungkan tindakan ini!</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color='error'>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

const columns: GridColDef[] = [
    {
        field: 'no',
        headerName: 'No',
        width: 70,
        valueGetter: params => {
            const allRows = params.api.getAllRowIds()

            return allRows.indexOf(params.id) + 1 // Mendapatkan posisi berdasarkan indeks ID
        }
    },
    { field: 'full_name', headerName: 'Nama Siswa', flex: 0.175, minWidth: 140 },
    { field: 'class_desc', headerName: 'Deskripsi', flex: 0.25, minWidth: 180 },
    {
        field: 'class_status',
        headerName: 'Status',
        flex: 0.175,
        minWidth: 80,
        renderCell: (params: GridRenderCellParams) => {
            const status = statusObj[params.row.class_status]

            return (
                <CustomChip
                    rounded
                    size='small'
                    skin='light'
                    color={status.color}
                    label={status.title}
                    sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
                />
            )
        }
    },
    {
        flex: 0,
        minWidth: 200,
        sortable: false,
        field: 'actions',
        headerName: 'Actions',
        renderCell: ({ row }: CellType) => <RowOptions uid={row.id} />
    }
]
const UserList = () => {
    const data = localStorage.getItem('userData') as string
    const getDataLocal = JSON.parse(data)
    const storedToken = window.localStorage.getItem('token')

    const [school_id] = useState<number>(getDataLocal.school_id)
    const [value, setValue] = useState<string>('')
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
    const [loading, setLoading] = useState<boolean>(true)
    const [status] = useState<any>('')
    const [modalOpen, setModalOpen] = useState<boolean>(false)

    const [formData, setFormData] = useState({
        description: '',
        status: 'ON'
    })
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: formData,
    });
    const [users, setUsers] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([]);
    const router = useRouter()
    const { uid } = router.query
    const [subjectss_id] = useState<any>(router.query)

    const [user_ids, setUserIds] = useState<string[]>([]);

    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.ProgresSiswa)

    useEffect(() => {
        setLoading(true)
        dispatch(fetchDataProgresSiswa({ school_id, status, q: value })).finally(() => {
            setLoading(false)
        })
    }, [dispatch, school_id, status, value])

    const handleFilter = useCallback((val: string) => {
        setValue(val)
    }, [])

    const handleOpenModal = () => {
        setModalOpen(true)
    }

    const handleCloseModal = () => setModalOpen(false)

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!uid) return; // Make sure uid is ready before calling fetchSubjects
            try {
                const response = await axiosConfig.get(`/list-subjects/?schoolId=${school_id}`, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${storedToken}`,
                    },
                });

                const filteredSubjects = response.data.filter((subject: any) =>
                    subject.id == uid
                );

                if (filteredSubjects.length > 0) {
                    setSubjects(filteredSubjects[0].class_id); // Set the class_id from the fetched subject
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
            }
        };

        if (uid) {
            fetchSubjects(); // Call fetchSubjects only when uid is available
        }
    }, [school_id, storedToken, uid]); // Add uid as a dependency

    useEffect(() => {
        const fetchUsers = async () => {
            if (!subjects) return; // Make sure subjects state has been updated before calling fetchUsers
            try {
                const response = await axiosConfig.get(`/list-siswa/?schoolId=${school_id}`, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${storedToken}`
                    }
                });

                const filterUsersByClass = response.data.filter((data: any) => data.class_id == subjects);
                console.log(subjects);

                setUsers(filterUsersByClass);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        if (subjects) {
            fetchUsers();
        }
    }, [school_id, storedToken, subjects]);

    console.log(subjectss_id);

    // Handle form submission
    const handleFormSubmit = (data: any) => {
        const formData = new FormData()
        formData.append('user_id', user_ids.join(','));
        formData.append('subject_id', subjectss_id.uid);
        formData.append('description', data.description)
        formData.append('status', data.status)

        const storedToken = window.localStorage.getItem('token')
        axiosConfig
            .post('/create-progresSiswa', formData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${storedToken}`
                }
            })
            .then(response => {
                console.log(response)
                toast.success('Successfully Added Class!')
                // router.push('/ms/kelas')
            })
            .catch(() => {
                toast.error('Failed to add class')
            })
        handleCloseModal() // Close the modal after submission
    }


    return (
        <Grid container spacing={6.5}>
            <Grid item xs={12}></Grid>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Progres Siswa' />
                    <Divider sx={{ m: '0 !important' }} />
                    <TableHeader value={value} handleFilter={handleFilter} handleOpenModal={handleOpenModal} />
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                            <CircularProgress color='secondary' />
                        </div>
                    ) : (
                        <DataGrid
                            autoHeight
                            rowHeight={50}
                            rows={store.data}
                            columns={columns}
                            disableRowSelectionOnClick
                            pageSizeOptions={[20, 40, 60, 100]}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            sx={{
                                '& .MuiDataGrid-cell': {
                                    fontSize: '0.75rem'
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    fontSize: '0.75rem'
                                }
                            }}
                        />
                    )}
                </Card>
            </Grid>

            {/* Modal for Filter Confirmation */}
            <Dialog open={modalOpen} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit(handleFormSubmit)}>

                    <DialogTitle>Tambah Progres Siswa</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3}>
                            {/* User ID Selection using CustomTextField */}
                            <Grid item xs={12} sm={12} md={12}>
                                <CustomAutocomplete
                                    multiple  // Enable multiple selection
                                    fullWidth
                                    value={users.filter((data: any) => user_ids.includes(data.id)) || []}  // Handle multiple selected users (user_ids is an array)
                                    options={users}
                                    onChange={(event, newValue) => {
                                        // Safely update the user_ids with the selected users' ids
                                        setUserIds(newValue.map((user: any) => user.id));  // newValue is an array, so we update with an array of ids
                                    }}
                                    id="autocomplete-menu"
                                    getOptionLabel={(option) => option.full_name || ''}
                                    renderInput={(params) => <CustomTextField {...params} label="Users" variant="outlined" />}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.id}>
                                            {option.full_name}
                                        </li>
                                    )}
                                />
                            </Grid>


                            {/* Subject ID Selection using CustomTextField */}

                            <Grid item xs={12} sm={12} md={12}>
                                <Controller
                                    name="description"
                                    control={control}
                                    defaultValue={formData.description}
                                    rules={{ required: "Description is required" }}

                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            label="Description"
                                            fullWidth
                                            error={Boolean(errors.description)}

                                        />
                                    )}
                                />
                            </Grid>

                            {/* Status Selection with Controller and CustomTextField */}
                            <Grid item xs={12} sm={12} md={12}>
                                <Controller
                                    name="status"
                                    control={control}
                                    defaultValue={formData.status}
                                    rules={{ required: "Status is required" }}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            label="Status"
                                            fullWidth
                                            select
                                            error={Boolean(errors.status)}

                                        >
                                            <MenuItem value="ON">ON</MenuItem>
                                            <MenuItem value="OFF">OFF</MenuItem>
                                        </CustomTextField>
                                    )}
                                />
                            </Grid>
                            {/* Description TextField */}

                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal} color='primary'>
                            Cancel
                        </Button>
                        <Button type='submit' variant='contained'>
                            Simpan
                        </Button>
                    </DialogActions>
                </form>

            </Dialog>
        </Grid >
    )
}

export default UserList
