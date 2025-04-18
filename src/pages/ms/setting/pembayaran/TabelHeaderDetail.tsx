// ** MUI Imports
import Box from '@mui/material/Box'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

interface TableHeaderProps {
  value: string
  handleFilter: (val: string) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const { handleFilter, value } = props

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
      {/* <Button color='secondary' variant='tonal' startIcon={<Icon icon='tabler:upload' />}>
        Export
      </Button> */}
      <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <CustomTextField value={value} sx={{ mr: 4 }} placeholder='Cari' onChange={e => handleFilter(e.target.value)} />
      </Box>
    </Box>
  )
}

export default TableHeader
