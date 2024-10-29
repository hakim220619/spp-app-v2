import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'
import Link from 'next/link'
import { useState } from 'react'
import axiosConfig from 'src/configs/axiosConfig'
import { CircularProgress } from '@mui/material'

interface TableHeaderProps {
  value: string
  handleFilter: (val: string) => void
  createPdf: () => void
  loading: boolean
}

const TableHeader = ({ handleFilter, value, createPdf, loading }: TableHeaderProps) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const schoolId = userData?.school_id

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setFile(files[0])
      setMessage(null) // Reset pesan error/sukses saat file berubah
    }
  }

  const handleUpload = async () => {
    if (!file || !schoolId) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('school_id', schoolId)

    try {
      const token = localStorage.getItem('token')
      await axiosConfig.post('/upload-siswa', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      setMessage({ type: 'success', text: 'File berhasil diupload' })
      setFile(null)
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error uploading file:', error)
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengupload file. Coba lagi.' })
    } finally {
      setOpenDialog(false)
    }
  }

  return (
    <>
      <Box
        sx={{
          py: 4,
          px: 6,
          rowGap: 2,
          columnGap: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant='outlined'
            color='error'
            onClick={createPdf}
            disabled={loading}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color='error' sx={{ mr: 2 }} />
                Loading...
              </>
            ) : (
              <>
                <Icon icon='tabler:file-type-pdf' />
                PDF
              </>
            )}
          </Button>
          <Box m={1} display='inline'></Box>
          <Button
            color='secondary'
            variant='outlined'
            startIcon={<Icon icon='tabler:upload' />}
            onClick={() => setOpenDialog(true)}
          >
            Upload
          </Button>
        </Box>
        <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <CustomTextField
            value={value}
            sx={{ mr: 4 }}
            placeholder='Cari Nama'
            onChange={e => handleFilter(e.target.value)}
          />
          <Link href='/ms/siswa/SiswaAddView' passHref>
            <Button variant='contained' sx={{ '& svg': { mr: 1 } }}>
              <Icon fontSize='1.125rem' icon='tabler:plus' />
              Tambah
            </Button>
          </Link>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <input type='file' accept='.xlsx, .xls' onChange={handleFileChange} />
          {message && (
            <Typography color={message.type === 'error' ? 'error' : 'success'} sx={{ mt: 2 }}>
              {message.text}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpload} color='primary' disabled={!file}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TableHeader
