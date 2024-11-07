// ** MUI Imports
import { Button, CircularProgress } from '@mui/material'
import Box from '@mui/material/Box'
import CustomTextField from 'src/@core/components/mui/text-field'
import Icon from 'src/@core/components/icon'

interface TableHeaderProps {
  value: string
  handleFilter: (val: string) => void
  cetakPdfAll: () => Promise<void> // Pastikan cetakPdfAll adalah fungsi async
  loadingPdf: boolean
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { handleFilter, cetakPdfAll, value, loadingPdf } = props

  // ** Handle the PDF Generation with loading state from props

  return (
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
      <p></p>
      <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant='contained'
          color='error'
          onClick={cetakPdfAll} // Update function to handle loading state
          disabled={loadingPdf} // Disable button while loading
          style={{ display: 'flex', alignItems: 'center' }} // Align items in the center
        >
          {loadingPdf ? (
            <>
              <CircularProgress size={20} color='error' style={{ marginRight: '10px' }} />
              Loading...
            </>
          ) : (
            <>
              <Icon icon='tabler:file-type-pdf' style={{ marginRight: '10px' }} />
              Cetak Semua Data
            </>
          )}
        </Button>
        <Box m={1} display='inline' />

        <CustomTextField
          value={value}
          sx={{ mr: 4 }}
          placeholder='Search Name'
          onChange={e => handleFilter(e.target.value)}
        />
      </Box>
    </Box>
  )
}

export default TableHeader
