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
import { fetchDataAbsensi, deleteAbsensi } from 'src/store/apps/absensi/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/absensi/TableHeader'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

interface CellType {
  row: UsersType
}

const statusObj: any = {
  Present: { title: 'Hadir', color: 'success' },
  Absent: { title: 'Tidak Hadir', color: 'error' },
  Late: { title: 'Terlambat', color: 'warning' },
  Excused: { title: 'Diterima', color: 'info' }, // 'error' diganti dengan 'info' untuk status 'Excused' karena lebih tepat
  Sick: { title: 'Sakit', color: 'primary' }, // Menambahkan status 'Sakit'
  Permission: { title: 'Izin', color: 'secondary' }, // Menambahkan status 'Izin'
  Alpha: { title: 'Alpha', color: 'secondary' }, // Menambahkan status 'Alpha' dengan warna default
  Leave: { title: 'Cuti', color: 'success' }, // Menambahkan status 'Cuti'
  'Out of Office': { title: 'Tidak di Kantor', color: 'warning' }, // Menambahkan status 'Tidak di Kantor'
  Holiday: { title: 'Libur', color: 'info' }, // Menambahkan status 'Libur'
  'Early Leave': { title: 'Pulang Awal', color: 'primary' } // Menambahkan status 'Pulang Awal'
}
const typeObj: any = {
  MASUK: { title: 'MASUK', color: 'success' },
  KELUAR: { title: 'KELUAR', color: 'error' }
}

const RowOptions = ({ id }: { id: any }) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [open, setOpen] = useState(false)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value] = useState<string>('')
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const handleRowEditedClick = () => router.push('/ms/absensi/' + id)

  const handleDelete = async () => {
    try {
      await dispatch(deleteAbsensi(id)).unwrap()
      await dispatch(fetchDataAbsensi({ school_id, status: '', q: value }))
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
  { field: 'unit_name', headerName: 'Unit Name', flex: 0.175, minWidth: 240 },
  { field: 'full_name', headerName: 'Nama Lengkap', flex: 0.175, minWidth: 340 },
  { field: 'activity_name', headerName: 'Kegiatan', flex: 0.175, minWidth: 240 },
  { field: 'subject_name', headerName: 'Mata Pelajaran', flex: 0.175, minWidth: 240 },
  {
    field: 'created_at',
    headerName: 'Tanggal',
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
  {
    field: 'type',
    headerName: 'Type',
    flex: 0.175,
    minWidth: 130,
    renderCell: (params: GridRenderCellParams) => {
      const status = typeObj[params.row.type]

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
    renderCell: ({ row }: CellType) => <RowOptions id={row.id} />
  }
]

const UserList = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 })
  const [loading, setLoading] = useState<boolean>(true)
  const [status] = useState<any>('')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.Absensi)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataAbsensi({ school_id, status, q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, status, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Data Absensi ' />
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

export default UserList
