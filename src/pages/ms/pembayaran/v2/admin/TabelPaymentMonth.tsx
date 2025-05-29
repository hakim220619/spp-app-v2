import { useState, useEffect, useCallback } from 'react'
import { Grid, CircularProgress, Button, Card, CardContent, Typography, InputLabel, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material'
import { DataGrid, GridCloseIcon, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { ListPaymentDashboardByMonthAdminv2 } from 'src/store/apps/pembayaran/v2/admin/index'
import { RootState, AppDispatch } from 'src/store'
import TableHeader from 'src/pages/ms/pembayaran/v2/admin/TabelHeaderDetail'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Box } from '@mui/system'
import axiosConfig from 'src/configs/axiosConfig'

const statusObj: any = {
  Pending: { title: 'Proses Pembayaran', color: 'error' },
  Verified: { title: 'Belum Lunas', color: 'warning' },
  Paid: { title: 'Lunas', color: 'success' }
}
const typeObj: any = {
  BULANAN: { title: 'BULANAN', color: 'success' },
  BEBAS: { title: 'BEBAS', color: 'warning' }
}


const RowOptions = ({ uid, type, dataAll, setOpen, disabled }: { uid: any; type: any; dataAll: any; setOpen: () => void; disabled: boolean }) => {
  return (
    <>
      {type === 'BULANAN' ? (
        <Button variant="contained" sx={{ '& svg': { mr: 2 } }} onClick={setOpen} disabled={disabled}>
          <Icon fontSize="1.125rem" icon="" />
          BAYAR
        </Button>
      ) : type === 'BEBAS' ? (
        <Link
          href={`/ms/pembayaran/v2/admin/bebas/${uid}?school_id=${dataAll.school_id}&user_id=${dataAll.user_id}`}
          passHref
        >
          <Button variant="contained" sx={{ '& svg': { mr: 2 } }}>
            <Icon fontSize="1.125rem" icon="" />
            BAYAR
          </Button>
        </Link>
      ) : null}
    </>
  );
};



interface TabelPaymentMonthProps {
  school_id: string
  unit_id: string
  uid: string
}

const TabelPaymentMonth = ({ school_id, unit_id, uid }: TabelPaymentMonthProps) => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.ListPaymentDashboardByMonthAdminV2)
  const [rowSelectionModel, setRowSelectionModel] = useState<number[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [jumlah, setJumlah] = useState<string>('')
  const [spName, setSpName] = useState<any>('')

  const [open, setOpen] = useState(false)
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<any[]>([]) // New state for payment details
  const [isLoading, setIsLoading] = useState(false) // State for overlay loading
  const [openPdfPreview, setOpenPdfPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false)
  const [disabled, setDisabled] = useState<boolean>(true);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await dispatch(ListPaymentDashboardByMonthAdminv2({ school_id, unit_id, user_id: uid, q: value }))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dispatch, school_id, unit_id, uid, value])
  useEffect(() => {
    if (store.data && store.data.length > 0) {
      const firstItem = store.data[0]
      setSpName(firstItem)
    }
  }, [store.data])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  const onsubmit = async () => {
    setIsLoading(true)
    if (spName && jumlah) {
      try {
        const filteredRows = selectedRows.filter(row => row.status !== 'Verified' && row.status !== 'Paid')
        const token = localStorage.getItem('token')
        const response = await axiosConfig.post(
          '/create-payment-pending-byAdmin',
          {
            dataUsers: spName,
            dataPayment: filteredRows,
            admin_id: getDataLocal.id,
            total_affiliate: spName.affiliate * filteredRows.length
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` // Add the token here
            }
          }
        )

        if (response.status == 200) {
          dispatch(
            ListPaymentDashboardByMonthAdminv2({ school_id, unit_id, user_id: uid, q: value })
          ).finally(() => {
            setLoading(false)
            handleClose(false)
            setJumlah('0')
            setIsLoading(false)
            setRowSelectionModel([])
          })
        }
        toast.success('Pembayaran Berhasil!')
      } catch (error) {
        setIsLoading(false)
        toast.error('Terjadi kesalahan saat memproses pembayaran.')
        console.error(error) // Log the error for debugging
      }
    } else {
      setIsLoading(false)
      toast.error('Data tidak lengkap. Pastikan semua informasi sudah diisi.')
    }
  }


  const handleClose = (confirm: any) => {
    setOpen(false)
    if (confirm) {
      onsubmit() // Call the payment submission function here
    }
  }


  const handleOpenModal = () => {
    const filteredRows = selectedRows.filter(row => row.status !== 'Verified' && row.status !== 'Paid')
    setSelectedPaymentDetails(filteredRows)
    setOpen(true)
  };

  const handleCloseModal = () => {
    setOpen(false);
  };


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
    // { field: 'month_name', headerName: 'Periode Bulan', flex: 0.175, minWidth: 180 },
    {
      field: 'month_name',
      headerName: 'Periode Bulan',
      flex: 0.175,
      minWidth: 150,
      renderCell: (params: any) => {
        const { row } = params

        return row.month_name + ' ' + row.years
      }
    },
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
      field: 'asd',
      headerName: 'Jml. Potongan',
      flex: 0.175,
      minWidth: 140,
    },
    {
      field: 'amount',
      headerName: 'Jml. Tagihan',
      flex: 0.175,
      minWidth: 140,
      valueGetter: params => {
        const { row } = params
        return row.amount;
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
      field: '',
      headerName: 'Jml. Dibayar',
      flex: 0.175,
      minWidth: 140,
      valueGetter: params => {
        const { row } = params
        return row.type == 'BEBAS' ? row.sum_detail_payment_tunggakan : ''
      },
      valueFormatter: ({ value }) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        }).format(value)
      },
      renderCell: params => {
        const { value } = params
        return (
          <span style={{ cursor: 'pointer', color: 'green' }}>
            {value ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value) : ''}
          </span>
        )
      }
    },

    {
      field: 'qqw',
      headerName: 'Jml. Tunggakan',
      flex: 0.175,
      minWidth: 170,

      valueGetter: params => {
        const { row } = params

        return row.type == 'BEBAS' ? row.sum_detail_payment_lunas : row.amount
      },
      valueFormatter: ({ value }) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        }).format(value)
      },
      renderCell: params => {
        const { value } = params
        return (
          <span style={{ cursor: 'pointer', color: 'red' }}>
            {value ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value) : ''}
          </span>
        )
      }

    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.175,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        const status = statusObj[params.row.status]

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
      renderCell: ({ row }: any) => <RowOptions uid={row.uid} type={row.type} dataAll={row} setOpen={handleOpenModal} disabled={disabled} />
    }
  ]

  return (
    <>
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
            checkboxSelection
            rowSelectionModel={rowSelectionModel}
            isRowSelectable={params => params.row.status === 'Pending' && params.row.type === 'BULANAN'}
            onRowSelectionModelChange={newSelectionModel => {
              setRowSelectionModel(newSelectionModel as any);

              const filteredData = newSelectionModel.map(id => {
                const selectedRow: any = store.data.find((row: any) => row.id === id);
                return {
                  id: selectedRow.id,
                  total_payment: selectedRow.amount,
                  month: selectedRow.month_name,
                  years: selectedRow.years,
                  status: selectedRow.status
                };
              });

              setSelectedRows(filteredData);

              const totalAmount = filteredData
                .filter(row => row.status !== 'Verified' && row.status !== 'Paid')
                .reduce((sum, row) => sum + row.total_payment, 0);

              const formattedTotalAmount = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
              }).format(totalAmount);

              setJumlah(formattedTotalAmount);
              setDisabled(newSelectionModel.length === 0);
            }}
            onRowClick={(params) => {
              if (params.row.status === 'Pending' && params.row.type === 'BULANAN') {
                const newSelection = [...rowSelectionModel];
                const rowId = params.row.id;

                // Add the clicked row's ID to the selection model if it's not already selected
                if (!newSelection.includes(rowId)) {
                  newSelection.push(rowId);
                } else {
                  // Optionally, deselect the row if it's already selected
                  newSelection.splice(newSelection.indexOf(rowId), 1);
                }

                // Update the selection model
                setRowSelectionModel(newSelection);

                // Update the selected rows and total payment just like in `onRowSelectionModelChange`
                const filteredData = newSelection.map(id => {
                  const selectedRow: any = store.data.find((row: any) => row.id === id);
                  return {
                    id: selectedRow.id,
                    total_payment: selectedRow.amount,
                    month: selectedRow.month_name,
                    years: selectedRow.years,
                    status: selectedRow.status
                  };
                });

                setSelectedRows(filteredData);

                const totalAmount = filteredData
                  .filter(row => row.status !== 'Verified' && row.status !== 'Paid')
                  .reduce((sum, row) => sum + row.total_payment, 0);

                const formattedTotalAmount = new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0
                }).format(totalAmount);

                setJumlah(formattedTotalAmount);
                setDisabled(newSelection.length === 0);

              }
            }}
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
      <Grid item xs={12} md={3}>
        {' '}
        {/* Full width on mobile, 3/12 on medium screens and up */}
        {/* Dialog Konfirmasi Pembayaran */}
        <Dialog open={open} onClose={() => handleClose(false)} maxWidth='sm' fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='h6' sx={{ ml: 1 }}>
                Konfirmasi Pembayaran
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>Apakah Anda yakin ingin melanjutkan pembayaran ini?</DialogContentText>
            <Box mt={2}>
              {selectedPaymentDetails
                .filter(payment => payment.status === 'Pending')
                .map(payment => (
                  <Typography
                    key={payment.id}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '4px',
                      backgroundColor: theme => (theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9'),
                      color: theme => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
                      boxShadow: 1,
                      transition: 'background-color 0.3s, color 0.3s',
                      '&:hover': {
                        backgroundColor: theme => (theme.palette.mode === 'dark' ? '#616161' : '#e0e0e0')
                      }
                    }}
                  >
                    <span>
                      <strong>Bulan:</strong> {payment.month}
                    </span>
                    <span>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0
                      }).format(payment.total_payment)}
                    </span>
                  </Typography>
                ))}

              <Typography
                sx={{
                  mt: 2,
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: theme => (theme.palette.mode === 'dark' ? '#424242' : '#f9f9f9'),
                  color: theme => (theme.palette.mode === 'dark' ? '#fff' : '#000'),
                  boxShadow: 1
                }}
              >
                <span>
                  <strong>Total Pembayaran:</strong>
                </span>
                <span>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(
                    selectedPaymentDetails
                      .filter(payment => payment.status === 'Pending')
                      .reduce((total, payment) => total + payment.total_payment, 0)
                  )}
                </span>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleClose(false)} variant='contained' color='error'>
              Batal
            </Button>
            <Button
              onClick={() => {
                setIsLoading(true)
                onsubmit()
              }}
              variant='contained'
              color='primary'
              disabled={isLoading}
            >
              {isLoading ? (
                <Box display='flex' alignItems='center'>
                  <CircularProgress size={24} sx={{ marginRight: 1 }} />
                  <Typography variant='body2'>Loading...</Typography>
                </Box>
              ) : (
                'Ya, Lanjutkan'
              )}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openPdfPreview}
          onClose={() => {
            setOpenPdfPreview(false)
            setPdfUrl(null) // Clear the URL when closing
            setLoadingPdf(false)
          }}
          maxWidth='lg'
          fullWidth
          PaperProps={{
            style: {
              minHeight: '600px',
              backgroundColor: 'transparent', // Semi-transparent white

              boxShadow: 'none',

              position: 'relative' // Ini perlu ditambahkan untuk posisikan ikon close
            }
          }}
        >
          <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton
              onClick={() => {
                setOpenPdfPreview(false)
                setPdfUrl(null) // Clear the URL when closing
                setLoadingPdf(false)
              }}
              sx={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                zIndex: 1
              }}
            >
              <GridCloseIcon sx={{ color: 'white' }} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {pdfUrl && (
              <iframe src={pdfUrl} width='100%' height='800px' title='PDF Preview' style={{ border: 'none' }} />
            )}
          </DialogContent>
        </Dialog>
      </Grid>
    </>
  )
}

export default TabelPaymentMonth
