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
import { RootState, AppDispatch } from 'src/store'
import TableHeader from 'src/pages/ms/kas/TableHeader'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { deleteKas, fetchDataKas } from 'src/store/apps/kas'
import CardStatsHorizontalWithDetails from '../ppdb/cardCount'

interface CellType {
  row: any
}

const typeObj: any = {
  DEBIT: { title: 'MASUK', color: 'info' },
  KREDIT: { title: 'KELUAR', color: 'error' }
}

const RowOptions = ({ id }: { id: any }) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [open, setOpen] = useState(false)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value] = useState<string>('')
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const handleRowEditedClick = () => router.push('/ms/kas/' + id)

  const handleDelete = async () => {
    try {
      await dispatch(deleteKas(id)).unwrap()
      await dispatch(fetchDataKas({ school_id, type: '', q: value }))
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

function formatRupiah(angka: any) {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0, // Menghilangkan bagian desimal
    maximumFractionDigits: 0 // Menghilangkan bagian desimal
  })

  return formatter.format(angka)
}

const columns: GridColDef[] = [
  { field: 'no', headerName: 'No', width: 70 },
  { field: 'full_name', headerName: 'Nama Lengkap', flex: 0.175, minWidth: 180 },
  { field: 'deskripsi', headerName: 'Deskripsi', flex: 0.175, minWidth: 690 },
  {
    field: 'type',
    headerName: 'Type',
    flex: 0.175,
    minWidth: 130,
    renderCell: (params: GridRenderCellParams) => {
      const type = typeObj[params.row.type]

      return (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={type.color}
          label={type.title}
          sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
        />
      )
    }
  },
  {
    field: 'amount',
    headerName: 'Amount',
    flex: 0.25,
    minWidth: 130,
    valueFormatter: params => formatRupiah(params.value) // Menggunakan fungsi formatRupiah
  },
  {
    field: 'created_at',
    headerName: 'Dibuat',
    flex: 0.175,
    minWidth: 180,
    valueFormatter: params => {
      if (!params.value) return ''
      const date = new Date(params.value)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    }
  },
  {
    flex: 0,
    minWidth: 200,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: CellType) => (row.flag === 1 ? <RowOptions id={row.id} /> : null)
  }
]

const UserList = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 })
  const [loading, setLoading] = useState<boolean>(true)
  const [type] = useState<any>('')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.Kas)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataKas({ school_id, type, q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, type, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  // Calculate the total amount
  const totalAmountDebit = store.data
    .filter((item: any) => item.type === 'DEBIT') // Filter for DEBIT type
    .reduce((sum: number, item: any) => sum + item.amount, 0) // Sum the amounts
  const totalAmountKredit = store.data
    .filter((item: any) => item.type === 'KREDIT') // Filter for DEBIT type
    .reduce((sum: number, item: any) => sum + item.amount, 0) // Sum the amounts
  const statsData = [
    {
      title: 'Kas Masuk',
      stats: formatRupiah(totalAmountDebit), // Ganti dengan logika sesuai kebutuhan
      subtitle: 'Total',
      trendDiff: '',
      trend: 'positive',
      icon: 'mdi:dollar',
      avatarColor: 'info'
    },
    {
      title: 'Kas Keluar',
      stats: formatRupiah(totalAmountKredit),
      subtitle: 'Total',
      trendDiff: '',
      trend: 'negative',
      icon: 'mdi:dollar',
      avatarColor: 'error'
    }
  ]

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Grid container item xs={12}>
          {statsData.map((data, index) => (
            <Grid item xs={12} md={6} sm={6} key={index}>
              <CardStatsHorizontalWithDetails
                title={data.title}
                stats={data.stats}
                subtitle={data.subtitle}
                trendDiff={data.trendDiff}
                trend={data.trend}
                icon={data.icon}
                iconSize={24}
                avatarSize={38}
                avatarColor={data.avatarColor}
                sx={{ bgcolor: 'background.paper', borderRadius: '8px', boxShadow: 3, margin: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Data Kas' />
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
