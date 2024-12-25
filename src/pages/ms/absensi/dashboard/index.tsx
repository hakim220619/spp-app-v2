// ** Custom Component Imports
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

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
import { fetchDataAbsensiAktif, deleteAbsensiAktif } from 'src/store/apps/absensi/absensiAktif/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/absensi/dashboard/TableHeader'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import bowser from 'bowser'
import CardStatsHorizontalWithDetails from 'src/pages/ms/absensi/dashboard/cardVertical'

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

  const handleRowEditedClick = () => router.push('/ms/absensi/dashboard/' + uid)

  const handleDelete = async () => {
    try {
      await dispatch(deleteAbsensiAktif(uid)).unwrap()
      await dispatch(fetchDataAbsensiAktif({ school_id, status: '', q: value }))
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
  { field: 'unit_name', headerName: 'Nama Unit', flex: 0.175, minWidth: 140 },
  { field: 'activity_name', headerName: 'Kegiatan', flex: 0.175, minWidth: 140 },
  { field: 'subject_name', headerName: 'Mata Pelajaran', flex: 0.25, minWidth: 180 },
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
    field: 'token',
    headerName: 'Token',
    flex: 0.25,
    minWidth: 380,
    renderCell: (params: GridRenderCellParams) => {
      const token = params.row.token // Assuming token is a field in your row data

      const handleTokenClick = () => {
        const url = `/absensi/token/${token}`
        const browser = bowser.getParser(window.navigator.userAgent)
        const browserName = browser.getBrowserName()

        if (browserName === 'Chrome') {
          window.open(url, '_new', 'fullscreen=yes, width=screen.width, height=screen.height')
        } else if (browserName === 'Firefox') {
          window.open(
            url,
            '_new',
            'width=screen.width,height=screen.height,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
          )
        } else if (browserName === 'Edge') {
          window.open(url, '_new', 'fullscreen=yes, width=screen.width, height=screen.height')
        } else if (browserName === 'Safari') {
          window.open(url, '_new', 'width=screen.width,height=screen.height')
        } else {
          alert('Browser tidak didukung!')
        }
      }

      return (
        <Button onClick={handleTokenClick} color='error' variant='text'>
          {token}
        </Button>
      )
    }
  },
  { field: 'deskripsi', headerName: 'Deskripsi', flex: 0.25, minWidth: 180 },

  {
    flex: 0,
    minWidth: 200,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: CellType) => <RowOptions uid={row.id} />
  }
]

const dashboardAbsensi = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const [status] = useState<any>('')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.AbsensiAktif)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataAbsensiAktif({ school_id, status, q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, status, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <ApexChartWrapper>
          <Grid container spacing={6}>
            <Grid item xs={6} sm={4} lg={3}>
              <CardStatsHorizontalWithDetails
                title='Total Absensi Aktif'
                stats={store.data.filter((data: any) => data.status == 'ON').length}
                subtitle='Total'
                trendDiff=''
                trend='positive'
                icon='mdi:access-point'
                iconSize={24}
                avatarSize={38}
                avatarColor='primary'
                sx={{ bgcolor: 'background.paper', borderRadius: '8px', boxShadow: 3, margin: 2 }}
              />
            </Grid>
          </Grid>
        </ApexChartWrapper>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Data Absensi Aktif' />
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

export default dashboardAbsensi
