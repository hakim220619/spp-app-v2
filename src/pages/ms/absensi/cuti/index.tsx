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
  DialogTitle,
  DialogContentText
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchDataCuti, deleteCuti } from 'src/store/apps/absensi/cuti/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/absensi/cuti/TableHeader'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import urlImage from 'src/configs/url_image'

interface CellType {
  row: UsersType
}

const statusObj: any = {
  Approved: { title: 'Approved', color: 'primary' },
  Pending: { title: 'Pending', color: 'warning' },
  Rejected: { title: 'Rejected', color: 'error' }
}

const RowOptions = ({ id }: { id: any }) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [open, setOpen] = useState(false)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value] = useState<string>('')
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const handleRowEditedClick = () => router.push('/ms/absensi/cuti/' + id)

  const handleDelete = async () => {
    try {
      await dispatch(deleteCuti(id)).unwrap()
      await dispatch(fetchDataCuti({ school_id, status: '', q: value }))
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
        <DialogTitle>{'Are you sure you want to delete this user?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>You won't be able to revert this action!</DialogContentText>
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
  { field: 'no', headerName: 'No', width: 70 },
  { field: 'full_name', headerName: 'Nama', flex: 0.175, minWidth: 240 },
  { field: 'cuti_name', headerName: 'Jenis Cuti', flex: 0.175, minWidth: 190 },
  { field: 'approved_by', headerName: 'Disetujui Oleh', flex: 0.175, minWidth: 240 },
  {
    field: 'start_date',
    headerName: 'Mulai Cuti',
    flex: 0.175,
    minWidth: 170,
    valueFormatter: params => {
      if (!params.value) return '' // Handle if the date is null or undefined
      const date = new Date(params.value)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-based
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    }
  },
  {
    field: 'end_date',
    headerName: 'Selesai Cuti',
    flex: 0.175,
    minWidth: 170,
    valueFormatter: params => {
      if (!params.value) return '' // Handle if the date is null or undefined
      const date = new Date(params.value)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-based
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    }
  },
  {
    field: 'date_requested',
    headerName: 'Diajukan',
    flex: 0.175,
    minWidth: 170,
    valueFormatter: params => {
      if (!params.value) return '' // Handle if the date is null or undefined
      const date = new Date(params.value)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-based
      const year = date.getFullYear()

      return `${day}/${month}/${year}`
    }
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.175,
    minWidth: 150,
    renderCell: (params: GridRenderCellParams) => {
      const status = statusObj[params.row.status]

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
  { field: 'notes', headerName: 'Deskripsi', flex: 0.175, minWidth: 440 },
  {
    field: 'image',
    headerName: 'Gambar',
    flex: 0.175,
    minWidth: 140,
    renderCell: params => {
      const [dialogOpen, setDialogOpen] = useState(false)
      const [selectedImage, setSelectedImage] = useState<string | null>(null)

      const handleImageClick = () => {
        setSelectedImage(`${urlImage}uploads/school/cuti/${params.row.school_id}/${params.value}`)
        setDialogOpen(true)
      }

      return (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              cursor: 'pointer' // Add cursor pointer for clickable image
            }}
            onClick={handleImageClick}
          >
            <img
              src={`${urlImage}uploads/school/cuti/${params.row.school_id}/${params.value}`}
              alt='image'
              style={{
                padding: 2,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>
          {/* Dialog to show full-size image */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Gambar Cuti</DialogTitle>
            <DialogContent>
              <img
                src={selectedImage || ''}
                alt='Enlarged'
                style={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '500px', // Optional max width
                  objectFit: 'contain'
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} color='primary'>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )
    }
  },
  {
    flex: 0,
    minWidth: 200,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: CellType) => <RowOptions id={row.id} />
  }
]

const ListData = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const [status] = useState<any>('')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.Cuti)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataCuti({ school_id, status, q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, status, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Data Jenis Cuti' />
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader value={value} handleFilter={handleFilter} />
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
    </Grid>
  )
}

export default ListData
