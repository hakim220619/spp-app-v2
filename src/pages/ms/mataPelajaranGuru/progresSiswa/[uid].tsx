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
    DialogTitle
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchDataProgresSiswa, deleteProgresSiswa } from 'src/store/apps/progresSiswa/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/mataPelajaranGuru/progresSiswa/header'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

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
            await dispatch(fetchDataProgresSiswa({ school_id, subjec: '', q: value }))
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
    const [school_id] = useState<number>(getDataLocal.school_id)
    const [value, setValue] = useState<string>('')
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
    const [loading, setLoading] = useState<boolean>(true)
    const [status] = useState<any>('')
    const [modalOpen, setModalOpen] = useState<boolean>(false) // State for controlling the modal visibility
    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.ProgresSiswa)

    useEffect(() => {
        setLoading(true)
        dispatch(fetchDataProgresSiswa({ school_id, subjec: '', q: value })).finally(() => {
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
                <DialogTitle>Filter Applied</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        The filter has been applied. Do you want to proceed with this filter?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={handleCloseModal} color='primary'>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

export default UserList
