import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Card,
  Grid,
  Divider,
  IconButton,
  CardHeader,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchDataPaymentPayByMonth } from 'src/store/apps/pembayaran/bulanan/index'
import { RootState, AppDispatch } from 'src/store'
import { UsersType } from 'src/types/apps/userTypes'
import TableHeader from 'src/pages/ms/pembayaran/bulanan/TableHeader'
import axiosConfig from '../../../configs/axiosConfig'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface CellType {
  row: UsersType
}

const statusObj: any = {
  Pending: { title: 'Belum Bayar', color: 'error' },
  Paid: { title: 'Lunas', color: 'success' },
  Verified: { title: 'Proses Verifikasi', color: 'warning' }
}
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

const RowOptions = ({ data }: { uid: any; data: any }) => {
  const [openPdfPreview, setOpenPdfPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [openWhatsappDialog, setOpenWhatsappDialog] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [loading, setLoading] = useState(false) // Add loading state

  const openDialodSendWhatsapp = () => {
    const message = `Assalamu’alaikum Warahmatullahi Wabarakatuh
  
Pembayaran SPP Bulan ${data.month} ${data.years} sebesar Rp. ${data.total_payment.toLocaleString()} 
dari ANANDA ${data.full_name}  ${data.class_name} (${data.major_name}) belum diterima.
  
Silahkan lakukan pembayaran di kasir YPPH BANJARBARU secara tunai, atau bisa 
Melalui QRIS, VA(BRI,BCA BNI dll), Alfamart, indomaret, DANA, OVO, SOPEPAY, sebelum tgl 15 Tahun ajaran ${data.years}
(Abaikan pesan ini jika telah melakukan pembayaran)
  
Terima Kasih atas kerjasamanya. Semoga Allah SWT, senantiasa memberikan Kesehatan dan Kesuksesan.
  
Tim Keuangan YPPH Banjarbaru`

    setWhatsappMessage(message)
    setOpenWhatsappDialog(true)
  }
  const formattedUpdatedAt = new Date(data.updated_at).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  const createPdf = async () => {
    const doc = new jsPDF()

    // Change this line to reference the local image directly
    const logoImageUrl = '/images/logo.png'

    try {
      // Fetch the image
      const response = await fetch(logoImageUrl)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const blob = await response.blob()
      const imgUrl = URL.createObjectURL(blob) // Create a URL for the blob

      const img = new Image()
      img.src = imgUrl

      img.onload = () => {
        document.body.appendChild(img) // Optional: add the image to the DOM for visual confirmation
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
        const lineSpacing = 4 // Adjust this value to reduce spacing

        const infoLines = [
          { label: 'NIS', value: data.nisn },
          { label: 'Nama', value: data.full_name },
          { label: 'Kelas', value: data.class_name },
          { label: 'Jurusan', value: data.major_name }
        ]

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
        doc.text('Dengan rincian pembayaran sebagai berikut:', 10, studentInfoY + infoLines.length * 3)

        const tableBody = [
          [
            data.id,
            data.sp_name + ' ' + data.years,
            data.month,
            data.status == 'Paid' ? 'Lunas' : 'Belum Lunas',
            formattedUpdatedAt,
            `Rp. ${data.total_payment.toLocaleString()}`
          ]
        ]

        // Set up the table
        doc.autoTable({
          startY: studentInfoY + infoLines.length * 3 + 4,
          margin: { left: 10 },
          head: [['ID', 'Pembayaran', 'Bulan', 'Status', 'Dibuat', 'Total Tagihan']],
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
            0: { cellWidth: 20 }, // ID column width
            1: { cellWidth: 50 }, // Pembayaran column width
            2: { cellWidth: 20 }, // Status column width
            3: { cellWidth: 20 }, // Dibuat column width
            4: { cellWidth: 50 }, // Total Tagihan column width
            5: { cellWidth: 30 } // Total Tagihan column width
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
    } catch (error) {
      console.error('Error fetching image:', error)
    }
  }

  return (
    <>
      <IconButton size='small' color='error' onClick={createPdf}>
        <Icon icon='tabler:file-type-pdf' />
      </IconButton>
      <IconButton size='small' color='success' onClick={openDialodSendWhatsapp}>
        <Icon icon='prime:whatsapp' />
      </IconButton>

      <Dialog open={openPdfPreview} onClose={() => setOpenPdfPreview(false)} maxWidth='lg' fullWidth>
        <DialogTitle>
          Preview Payment Receipt
          <Button
            onClick={() => setOpenPdfPreview(false)}
            color='error'
            style={{ position: 'absolute', top: '8px', right: '8px' }}
          >
            Cancel
          </Button>
        </DialogTitle>
        <DialogContent>
          {pdfUrl && <iframe src={pdfUrl} width='100%' height='800px' title='PDF Preview' style={{ border: 'none' }} />}
        </DialogContent>
      </Dialog>

      <Dialog open={openWhatsappDialog} onClose={() => setOpenWhatsappDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Send via WhatsApp</DialogTitle>
        <DialogContent>
          <textarea value={whatsappMessage} rows={8} style={{ width: '100%', height: '200px', marginBottom: '10px' }} />
          <Button
            variant='contained'
            color='success'
            onClick={async () => {
              setLoading(true) // Mulai loading
              setOpenWhatsappDialog(false)

              try {
                const token = localStorage.getItem('token')

                if (!token) {
                  toast.error('Token tidak ditemukan. Silakan login ulang.')
                  setLoading(false) // Hentikan loading jika token tidak ada

                  return
                }

                await axiosConfig.post(
                  '/send-message',
                  {
                    message: whatsappMessage,
                    number: data.phone,
                    school_id: data.school_id
                  },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    }
                  }
                )
                setOpenWhatsappDialog(false)
                toast.success('Pesan berhasil dikirim via WhatsApp!')
              } catch (error) {
                console.error('Error sending message:', error)
                toast.error('Gagal mengirim pesan. Coba lagi nanti.')
                setOpenWhatsappDialog(false)
              } finally {
                setLoading(false) // Hentikan loading di akhir
                setOpenWhatsappDialog(false)
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Send to WhatsApp'}
          </Button>

          <Button onClick={() => setOpenWhatsappDialog(false)} color='secondary'>
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

const columns: GridColDef[] = [
  { field: 'month_number', headerName: 'No', width: 70 },
  { field: 'month', headerName: 'Bulan', flex: 0.175, minWidth: 140 },
  {
    field: 'total_payment',
    headerName: 'Jumlah',
    flex: 0.175,
    minWidth: 140,
    valueFormatter: ({ value }) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(value)
  },
  { field: 'years', headerName: 'Tahun', flex: 0.175, minWidth: 140 },
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
    renderCell: ({ row }: CellType) => <RowOptions uid={row.id} data={row} />
  }
]

interface TabelTunggakanByMonthsProps {
  id: string
  school_id: string
  user_id: string
}

const TabelTunggakanByMonths: React.FC<TabelTunggakanByMonthsProps> = props => {
  const { id, school_id, user_id } = props // Destructure props
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.PembayaranByMonth)
  const [openPdfPreview, setOpenPdfPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    dispatch(
      fetchDataPaymentPayByMonth({
        id_payment: id,
        school_id: school_id as any,
        user_id: user_id as any,
        q: value
      })
    ).finally(() => {
      setLoading(false)
    })
  }, [dispatch, value, id, school_id, user_id])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  const createPdfAll = async () => {
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
        doc.setFont('Verdana', 'bold')
        const schoolNameWidth = doc.getTextWidth(pdfData.school_name)
        const xSchoolNamePosition = (doc.internal.pageSize.getWidth() - schoolNameWidth) / 2

        doc.text(pdfData.school_name, xSchoolNamePosition, 20)
        doc.setFontSize(10)
        doc.setFont('Verdana', 'bold')

        const addressWidth = doc.getTextWidth(pdfData.school_address)
        const xAddressPosition = (doc.internal.pageSize.getWidth() - addressWidth) / 2

        doc.text(pdfData.school_address, xAddressPosition, 26)

        // Draw a horizontal line
        doc.line(10, 32, 200, 32)

        // Student Information
        const studentInfoY = 40 // Base Y position for student info
        const lineSpacing = 4 // Adjust this value to reduce spacing

        const infoLines = [
          { label: 'NIS', value: pdfData.nisn },
          { label: 'Nama', value: pdfData.full_name },
          { label: 'Kelas', value: pdfData.class_name },
          { label: 'Jurusan', value: pdfData.major_name }
        ]

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
        doc.text('Dengan rincian pembayaran sebagai berikut:', 10, studentInfoY + infoLines.length * 3)

        // Initialize tableBody array
        const tableBody: any = []

        let totalPayment = 0 // Initialize total payment

        // Populate tableBody using forEach
        filteredRows.forEach((item: any) => {
          const formattedUpdatedAt = new Date(item.updated_at).toLocaleString('id-ID', {
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
          { content: 'Total', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
          `Rp. ${totalPayment.toLocaleString()}` // Display the total payment sum
        ])

        // Set up the table
        doc.autoTable({
          startY: studentInfoY + infoLines.length * 3 + 4,
          head: [['ID', 'Pembayaran', 'Bulan', 'Status', 'Created', 'Total Tagihan']],
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
            0: { cellWidth: 20 }, // ID column width
            1: { cellWidth: 50 }, // Pembayaran column width
            2: { cellWidth: 20 }, // Status column width
            3: { cellWidth: 20 }, // Dibuat column width
            4: { cellWidth: 50 }, // Total Tagihan column width
            5: { cellWidth: 30 } // Total Tagihan column width
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
  const filteredRows = useMemo(() => {
    return store.data.filter((row: any) => row.status === 'Pending')
  }, [store.data])

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12} md={12}>
        {' '}
        {/* Full width on mobile, 9/12 on medium screens and up */}
        <Card>
          <CardHeader
            title='Data Tagihan'
            action={
              <Button
                variant='contained'
                color='error'
                onClick={() => {
                  createPdfAll()
                }}
                startIcon={<Icon icon='tabler:file-type-pdf' />} // Add the icon here
              >
                Cetak Semua Data
              </Button>
            }
          />
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
              rows={filteredRows}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[20, 40, 60, 100]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          )}
        </Card>
      </Grid>
      <Dialog
        open={openPdfPreview}
        onClose={() => {
          setOpenPdfPreview(false)
          setPdfUrl(null) // Clear the URL when closing
        }}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          style: {
            minHeight: '600px'
          }
        }}
      >
        <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Preview Payment Receipt
          <Button
            onClick={() => {
              setOpenPdfPreview(false)
              setPdfUrl(null) // Clear the URL when closing
            }}
            color='error'
            style={{ position: 'absolute', top: '8px', right: '8px' }} // Position the button in the top-right corner
          >
            Cancel
          </Button>
        </DialogTitle>
        <DialogContent>
          {pdfUrl && <iframe src={pdfUrl} width='100%' height='800px' title='PDF Preview' style={{ border: 'none' }} />}
        </DialogContent>
      </Dialog>
    </Grid>
  )
}

export default TabelTunggakanByMonths
