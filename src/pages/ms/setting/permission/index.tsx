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
import { fetchDataMenuPermission, deleteMenuPermission } from 'src/store/apps/menu/permission/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/setting/permission/TableHeader'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

interface CellType {
  row: UsersType
}

const statusObj: any = {
  ON: { title: 'ON', color: 'primary' },
  OFF: { title: 'OFF', color: 'error' },
  null: { title: 'OFF', color: 'error' }
}

const RowOptions = ({ uid }: { uid: any }) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [open, setOpen] = useState(false)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value] = useState<string>('')
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const handleRowEditedClick = () => router.push('/ms/setting/permission/' + uid)

  const handleDelete = async () => {
    try {
      await dispatch(deleteMenuPermission(uid)).unwrap()
      await dispatch(fetchDataMenuPermission({ school_id, q: value, role_id: '' }))
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

  { field: 'school_name', headerName: 'school', flex: 0.175, minWidth: 140 },
  { field: 'menu_name', headerName: 'menu', flex: 0.175, minWidth: 140 },
  { field: 'role_name', headerName: 'Role', flex: 0.25, minWidth: 180 },
  {
    field: 'created',
    headerName: 'create',
    flex: 0.25,
    minWidth: 180,
    renderCell: ({ value }) => renderStatusIcon(value),
    align: 'center', // Centering the cell content
    headerAlign: 'center' // Centering the header text
  },
  {
    field: 'read',
    headerName: 'read',
    flex: 0.25,
    minWidth: 180,
    renderCell: ({ value }) => renderStatusIcon(value),
    align: 'center', // Centering the cell content
    headerAlign: 'center' // Centering the header text
  },
  {
    field: 'updated',
    headerName: 'update',
    flex: 0.25,
    minWidth: 180,
    renderCell: ({ value }) => renderStatusIcon(value),
    align: 'center', // Centering the cell content
    headerAlign: 'center' // Centering the header text
  },
  {
    field: 'deleted',
    headerName: 'delete',
    flex: 0.25,
    minWidth: 180,
    renderCell: ({ value }) => renderStatusIcon(value),
    align: 'center', // Centering the cell content
    headerAlign: 'center' // Centering the header text
  },

  {
    field: 'status',
    headerName: 'Status',
    flex: 0.175,
    minWidth: 80,
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
    flex: 0,
    minWidth: 200,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: CellType) => <RowOptions uid={row.id} />
  }
]
const renderStatusIcon = (value: number) => {
  if (value === 1) {
    return <Icon icon="tabler:check" style={{ color: 'green', fontSize: 20 }} />;
  }
  return <Icon icon="tabler:x" style={{ color: 'red', fontSize: 20 }} />;
};
const UserList = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 })
  const [loading, setLoading] = useState<boolean>(true)
  const [role_id] = useState<any>('')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.MenuPermission)
  // console.log(store);

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataMenuPermission({ school_id, role_id, q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, role_id, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Menu Permission' />
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
