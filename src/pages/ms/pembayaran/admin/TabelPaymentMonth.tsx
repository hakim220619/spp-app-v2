import { useState, useEffect, useCallback } from 'react'
import { Card, Grid, CircularProgress, Button } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { ListPaymentDashboardByMonthAdmin } from 'src/store/apps/pembayaran/admin/listPayment/index'
import { RootState, AppDispatch } from 'src/store'
import TableHeader from 'src/pages/ms/setting/pembayaran/TabelHeaderDetail'
import toast from 'react-hot-toast'
import Link from 'next/link'

const statusObj: any = {
  Pending: { title: 'Proses Pembayaran', color: 'error' },
  Verified: { title: 'Belum Lunas', color: 'warning' },
  Paid: { title: 'Lunas', color: 'success' }
}
const typeObj: any = {
  BULANAN: { title: 'BULANAN', color: 'success' },
  BEBAS: { title: 'BEBAS', color: 'warning' }
}

const RowOptions = ({ uid, type, dataAll }: { uid: any; type: any; dataAll: any }) => {
  return (
    <>
      {type === 'BULANAN' ? (
        <Link
          href={`/ms/pembayaran/admin/bulanan/${uid}?school_id=${dataAll.school_id}&user_id=${dataAll.user_id}`}
          passHref
        >
          <Button variant='contained' sx={{ '& svg': { mr: 2 } }}>
            <Icon fontSize='1.125rem' icon='' />
            BAYAR
          </Button>
        </Link>
      ) : type === 'BEBAS' ? (
        <Link
          href={`/ms/pembayaran/admin/bebas/${uid}?school_id=${dataAll.school_id}&user_id=${dataAll.user_id}`}
          passHref
        >
          <Button variant='contained' sx={{ '& svg': { mr: 2 } }}>
            <Icon fontSize='1.125rem' icon='' />
            BAYAR
          </Button>
        </Link>
      ) : null}
    </>
  )
}

const columns: GridColDef[] = [
  {
    field: 'no',
    headerName: 'No',
    width: 70,
    valueGetter: params => {
      const allRows = params.api.getAllRowIds() // Mengambil semua ID baris
      return allRows.indexOf(params.id) + 1 // Mendapatkan posisi berdasarkan indeks ID
    }
  },
  { field: 'class_name', headerName: 'Kelas', flex: 0.175, minWidth: 180 },
  { field: 'sp_name', headerName: 'Nama Pembayaran', flex: 0.175, minWidth: 160 },
  {
    field: 'type',
    headerName: 'Tipe Pembayaran',
    flex: 0.175,
    minWidth: 150,
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
    field: 'pending',
    headerName: 'Tunggakan',
    flex: 0.175,
    minWidth: 140,
    valueGetter: params => {
      const { row } = params
      if (row.type == 'BULANAN') {
        return row.pending - (row.detail_verified + row.detail_paid)
      } else {
        return row.amount - (row.detail_verified + row.detail_paid)
      }
    },
    valueFormatter: ({ value }) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value)
    }
  },
  {
    field: 'verified',
    headerName: 'Proses Pembayaran',
    flex: 0.175,
    minWidth: 190,
    valueGetter: params => {
      return params.row.type === 'BULANAN' ? params.row.verified : params.row.detail_verified
    },
    valueFormatter: ({ value }) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value)
    }
  },
  {
    field: 'paid',
    headerName: 'Sudah Dibayar',
    flex: 0.175,
    minWidth: 140,
    valueGetter: params => {
      return params.row.type === 'BULANAN' ? params.row.paid : params.row.detail_paid
    },
    valueFormatter: ({ value }) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value)
    }
  },
  { field: 'years', headerName: 'Tahun', flex: 0.175, minWidth: 120 },
  {
    field: 'status_lunas',
    headerName: 'Status',
    flex: 0.175,
    minWidth: 180,
    renderCell: (params: GridRenderCellParams) => {
      const statusKey = params.row.type === 'BULANAN' ? 'status_lunas' : 'status_lunas_detail'
      const status = statusObj[params.row[statusKey]]

      return (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={status?.color}
          label={status?.title}
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
    renderCell: ({ row }: any) => <RowOptions uid={row.uid} type={row.type} dataAll={row} />
  }
]

interface TabelPaymentMonthProps {
  school_id: string
  unit_id: string
  uid: string
}

const TabelPaymentMonth = ({ school_id, unit_id, uid }: TabelPaymentMonthProps) => {
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.ListPaymentDashboardByMonthAdmin)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await dispatch(ListPaymentDashboardByMonthAdmin({ school_id, unit_id, user_id: uid, q: value }))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dispatch, school_id, unit_id, uid, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  return (
    <Card>
      <Grid item xl={12}>
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
      </Grid>
    </Card>
  )
}

export default TabelPaymentMonth
