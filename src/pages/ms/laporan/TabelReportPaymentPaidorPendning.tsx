import { useState, useEffect, useCallback } from 'react'
import { Card, Grid, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, CardContent, Typography } from '@mui/material'
import { DataGrid, GridCloseIcon, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { ListPaymentReportAdminPaidorPending } from 'src/store/apps/laporan/paidorpending'
import { RootState, AppDispatch } from 'src/store'
import TableHeader from 'src/pages/ms/laporan/TableHeader'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import { UsersType } from 'src/types/apps/userTypes'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Box } from '@mui/system'
import CustomAvatar from 'src/@core/components/mui/avatar'


const statusObj: any = {
  Pending: { title: 'Belum Bayar', color: 'error' },
  Verified: { title: 'Proses Pembayaran', color: 'warning' },
  Paid: { title: 'Lunas', color: 'success' }
}
const typeObj: any = {
  BULANAN: { title: 'BULANAN', color: 'info' },
  BEBAS: { title: 'BEBAS', color: 'warning' }
}

interface CellType {
  row: UsersType
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

const RowOptions = ({ data }: { uid: any; data: any }) => {
  const [openPdfPreview, setOpenPdfPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false)

  const formattedUpdatedAt = new Date(data.date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const createPdf = async () => {
    setLoadingPdf(true)
    const doc = new jsPDF()
    const logoImageUrl = '/images/logo.png'

    const img = new Image()
    img.src = logoImageUrl

    img.onload = () => {
      // Add the logo
      doc.addImage(img, 'PNG', 10, 10, 20, 20)

      // Add school name and address
      doc.setFontSize(14)
      doc.setFont('verdana', 'bold')
      const schoolNameWidth = doc.getTextWidth(data.school_name)
      const xSchoolNamePosition = (doc.internal.pageSize.getWidth() - schoolNameWidth) / 2

      doc.text(data.school_name, xSchoolNamePosition, 20)
      doc.setFontSize(10)
      doc.setFont('verdana', 'normal')

      const addressWidth = doc.getTextWidth(data.school_address)
      const xAddressPosition = (doc.internal.pageSize.getWidth() - addressWidth) / 2

      doc.text(data.school_address, xAddressPosition, 26)

      // Draw a horizontal line
      doc.line(10, 32, 200, 32)

      // Student Information
      const studentInfoY = 40 // Base Y position for student info
      const lineSpacing = 5 // Adjust line spacing for vertical alignment

      const infoLines = [{ label: 'Tanggal', value: formattedUpdatedAt }]

      // Set positions for left and right columns with centering adjustment
      const leftColumnX = 10
      const rightColumnX = 105
      const labelOffset = 25 // Offset for value alignment with label

      infoLines.forEach((info, index) => {
        const yPosition = studentInfoY + index * lineSpacing // Vertical alignment adjustment

        if (index % 2 === 0) {
          doc.text(info.label, leftColumnX, yPosition)
          doc.text(`: ${info.value}`, leftColumnX + labelOffset, yPosition)
        } else {
          doc.text(info.label, rightColumnX, yPosition)
          doc.text(`: ${info.value}`, rightColumnX + labelOffset, yPosition)
        }
      })

      // Draw another horizontal line below the student information
      doc.line(10, studentInfoY + infoLines.length * lineSpacing, 200, studentInfoY + infoLines.length * lineSpacing)

      // Payment details header
      doc.text('Dengan rincian pembayaran sebagai berikut:', 10, studentInfoY + infoLines.length * lineSpacing + 5)

      const tableBody = [
        [
          data.id,
          data.sp_name + ' ' + data.years,
          data.type,
          data.month,
          data.status == 'Paid' ? 'Lunas' : 'Belum Lunas',
          formattedUpdatedAt,
          `Rp. ${data.total_payment.toLocaleString()}`
        ]
      ]

      // Set up the table
      doc.autoTable({
        startY: studentInfoY + infoLines.length * lineSpacing + 10,
        margin: { left: 10 },
        head: [['ID', 'Pembayaran', 'Type', 'Bulan', 'Status', 'Dibuat', 'Total Tagihan']],
        body: tableBody,
        theme: 'grid',
        headStyles: {
          fillColor: [50, 50, 50],
          textColor: [255, 255, 255],
          fontSize: 10,
          font: 'verdana',
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          font: 'verdana'
        },
        alternateRowStyles: {
          fillColor: [230, 230, 230]
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 40 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 50 },
          6: { cellWidth: 25 }
        }
      })

      // Create a Blob URL for the PDF
      const pdfOutput = doc.output('blob')
      const blobUrl = URL.createObjectURL(pdfOutput)
      setPdfUrl(blobUrl)
      setOpenPdfPreview(true)
    }

    img.onerror = () => {
      console.error('Failed to load image:', logoImageUrl)
    }
  }

  return (
    <>
      <IconButton size='small' color='error' onClick={createPdf} disabled={loadingPdf}>
        {loadingPdf ? (
          <CircularProgress size={24} color='error' /> // Show loading spinner when loading
        ) : (
          <Icon icon='tabler:file-type-pdf' />
        )}
      </IconButton>

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
          {pdfUrl && <iframe src={pdfUrl} width='100%' height='800px' title='PDF Preview' style={{ border: 'none' }} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', minWidth: 80 },
  { field: 'unit_name', headerName: 'Unit', flex: 0.175, minWidth: 180 },
  { field: 'full_name', headerName: 'Nama Siswa', flex: 0.175, minWidth: 140 },
  { field: 'sp_name', headerName: 'Pembayaran', flex: 0.175, minWidth: 140 },
  { field: 'month', headerName: 'Bulan', flex: 0.175, minWidth: 140 },
  {
    field: 'total_payment',
    headerName: 'Jumlah',
    flex: 0.175,
    minWidth: 140,
    renderCell: params => {
      const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(params.value)

      return <span>{formattedAmount}</span> // Render the formatted amount
    }
  },
  {
    field: 'type',
    headerName: 'Tipe Pembayaran',
    flex: 0.175,
    minWidth: 120,
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
  { field: 'years', headerName: 'Tahun', flex: 0.175, minWidth: 100 },
  { field: 'metode_pembayaran', headerName: 'Metode Pembayaran', flex: 0.175, minWidth: 100 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.175,
    minWidth: 160,
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
    field: 'date',
    headerName: 'Tanggal Bayar',
    flex: 0.175,
    minWidth: 150,
    valueFormatter: params => {
      if (!params.value) return ''
      const date = new Date(params.value)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()

      return `${day}/${month}/${year}`
    }
  },
  {
    flex: 0,
    minWidth: 200,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: ({ row }: CellType) => <RowOptions uid={row.id} data={row} />
  }
]

interface TabelReportPaymentPaidorPendingProps {
  school_id: any
  class_id: any
  status: any
  years: any
  month: any
}

const TabelReportPaymentPaidorPending = ({
  school_id,
  class_id,
  status,
  years,
  month
}: TabelReportPaymentPaidorPendingProps) => {
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.ListPaymentReportAdminPaidorPending)
  const [openPdfPreview, setOpenPdfPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false)
  console.log(school_id, class_id, status, years, month)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await dispatch(ListPaymentReportAdminPaidorPending({ school_id, class_id, q: value, status, years, month }))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dispatch, school_id, class_id, value, status, years, month])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  const createPdf = async () => {
    setLoadingPdf(true)
    const doc = new jsPDF()

    // Check if store.data has any items
    if (store.data && store.data.length > 0) {
      const pdfData: any = store.data[0] // Assuming you want to use the first item for the PDF

      const logoImageUrl = '/images/logo.png'

      const img = new Image()
      img.src = logoImageUrl

      img.onload = () => {
        // Add the logo
        doc.addImage(img, 'PNG', 10, 10, 20, 20)

        // Add school name and address
        doc.setFontSize(14)
        doc.setFont('verdana', 'arial', 'sans-serif')
        const schoolNameWidth = doc.getTextWidth(pdfData.school_name)
        const xSchoolNamePosition = (doc.internal.pageSize.getWidth() - schoolNameWidth) / 2

        doc.text(pdfData.school_name, xSchoolNamePosition, 20)
        doc.setFontSize(10)
        doc.setFont('verdana', 'arial', 'sans-serif')

        const addressWidth = doc.getTextWidth(pdfData.school_address)
        const xAddressPosition = (doc.internal.pageSize.getWidth() - addressWidth) / 2

        doc.text(pdfData.school_address, xAddressPosition, 26)

        // Draw a horizontal line
        doc.line(10, 32, 200, 32)

        // Student Information
        const studentInfoY = 40 // Base Y position for student info
        const lineSpacing = 3 // Adjust this value to reduce spacing

        const infoLines = [{ label: 'Dari Tanggal', value: class_id }]

        // Set positions for left and right columns
        const leftColumnX = 10 // X position for the left column
        const rightColumnX = 100 // X position for the right column
        const labelOffset = 30 // Offset for the label and value

        infoLines.forEach((info, index) => {
          const yPosition = studentInfoY + Math.floor(index / 2) * lineSpacing // Increment y for each pair

          if (index % 2 === 0) {
            // Even index: Left column for the first two entries
            doc.text(info.label, leftColumnX, yPosition)
            doc.text(`: ${info.value}`, leftColumnX + labelOffset, yPosition) // Adjust padding for alignment
          } else {
            // Odd index: Right column for the last two entries
            doc.text(info.label, rightColumnX, yPosition)
            doc.text(`: ${info.value}`, rightColumnX + labelOffset, yPosition) // Adjust padding for alignment
          }
        })

        // Draw another horizontal line below the student information
        doc.line(10, studentInfoY + 2 * lineSpacing, 200, studentInfoY + 2 * lineSpacing)

        // Payment details header
        doc.text('Dengan rincian pembayaran sebagai berikut:', 10, studentInfoY + infoLines.length * 4)

        // Initialize tableBody array
        const tableBody: any = []

        let totalPayment = 0 // Initialize total payment

        // Populate tableBody using forEach
        store.data.forEach((item: any) => {
          const formattedUpdatedAt = new Date(item.date).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })

          tableBody.push([
            item.id,
            item.sp_name + ' ' + item.years,
            item.type,
            item.month,
            item.status === 'Paid' ? 'Lunas' : item.status === 'Verified' ? 'Verifikasi Pembayaran' : 'Belum Lunas',
            formattedUpdatedAt, // Assuming you have a created_at field
            `Rp. ${item.total_payment.toLocaleString()}`
          ])

          // Add to total payment
          totalPayment += item.total_payment
        })

        // Add the total row
        tableBody.push([
          { content: 'Total', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
          `Rp. ${totalPayment.toLocaleString()}` // Display the total payment sum
        ])

        // Set up the table
        doc.autoTable({
          startY: studentInfoY + infoLines.length * 3 + 4,
          head: [['ID', 'Pembayaran', 'Type', 'Bulan', 'Status', 'Tanggal', 'Total Tagihan']],
          margin: { left: 10 },
          body: tableBody,
          theme: 'grid',
          headStyles: {
            fillColor: [50, 50, 50],
            textColor: [255, 255, 255],
            fontSize: 10,
            font: 'verdana',
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 8,
            font: 'verdana'
          },
          alternateRowStyles: {
            fillColor: [230, 230, 230] // Change this to your desired secondary color
          },
          columnStyles: {
            0: { cellWidth: 15 }, // ID column width
            1: { cellWidth: 40 }, // Pembayaran column width
            2: { cellWidth: 20 }, // Pembayaran column width
            3: { cellWidth: 20 }, // Status column width
            4: { cellWidth: 20 }, // Dibuat column width
            5: { cellWidth: 50 }, // Total Tagihan column width
            6: { cellWidth: 25 } // Total Tagihan column width
          }
        })

        // Create a Blob URL for the PDF
        const pdfOutput = doc.output('blob')
        const blobUrl = URL.createObjectURL(pdfOutput)
        setPdfUrl(blobUrl) // Set the URL for the dialog
        setOpenPdfPreview(true) // Open the dialog
      }

      img.onerror = () => {
        console.error('Failed to load image:', logoImageUrl)
      }
    } else {
      toast.error('Tidak ada data untuk membuat PDF.')
    }
  }

  return (
    <>
      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={6} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ gap: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography sx={{ mb: 1, color: 'text.secondary' }}>Total Semua</Typography>
                  <Box sx={{ mb: 1, columnGap: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant='h4'>
                      {'Rp ' +
                        store.data
                          .filter((item: any) => item.status === 'Paid')
                          .reduce((sum: number, item: any) => sum + (parseFloat(item.total_payment) || 0), 0)
                          .toLocaleString('id-ID', { maximumFractionDigits: 0 })}

                    </Typography>
                  </Box>
                  <Typography variant='h6' sx={{ color: 'text.secondary' }}>
                    Total Pembayaran
                  </Typography>
                </Box>
                <CustomAvatar skin='light' variant='rounded' color='primary' sx={{ width: 48, height: 48 }}>
                  <Icon icon='mdi:cash' fontSize='1.5rem' />
                </CustomAvatar>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ gap: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography sx={{ mb: 1, color: 'text.secondary' }}>Pembayaran Online</Typography>
                  <Box sx={{ mb: 1, columnGap: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant='h4'>
                      {'Rp ' +
                        store.data
                          .filter((item: any) => item.metode_pembayaran === 'Online' && item.status === 'Paid')
                          .reduce((sum: number, item: any) => sum + (parseFloat(item.total_payment) || 0), 0)
                          .toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </Typography>
                  </Box>
                  <Typography variant='h6' sx={{ color: 'text.secondary' }}>
                    Total Transaksi Online
                  </Typography>
                </Box>
                <CustomAvatar skin='light' variant='rounded' color='success' sx={{ width: 48, height: 48 }}>
                  <Icon icon='mdi:credit-card-outline' fontSize='1.5rem' />
                </CustomAvatar>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ gap: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography sx={{ mb: 1, color: 'text.secondary' }}>Pembayaran Manual</Typography>
                  <Box sx={{ mb: 1, columnGap: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant='h4'>
                      {'Rp ' +
                        store.data
                          .filter((item: any) => item.metode_pembayaran === 'Manual' && item.status === 'Paid')
                          .reduce((sum: number, item: any) => sum + (parseFloat(item.total_payment) || 0), 0)
                          .toLocaleString('id-ID', { maximumFractionDigits: 0 })}

                    </Typography>
                  </Box>
                  <Typography variant='h6' sx={{ color: 'text.secondary' }}>
                    Total Transaksi Manual
                  </Typography>
                </Box>
                <CustomAvatar skin='light' variant='rounded' color='warning' sx={{ width: 48, height: 48 }}>
                  <Icon icon='mdi:hand-coin-outline' fontSize='1.5rem' />
                </CustomAvatar>
              </CardContent>
            </Card>
          </Grid>
        </Grid>



      </Card>

      <Card>
        <Grid item xl={12}>
          <TableHeader value={value} handleFilter={handleFilter} cetakPdfAll={createPdf} loadingPdf={loadingPdf} />
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
            {pdfUrl && <iframe src={pdfUrl} width='100%' height='800px' title='PDF Preview' style={{ border: 'none' }} />}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  )
}

export default TabelReportPaymentPaidorPending
