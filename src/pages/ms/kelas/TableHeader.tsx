// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import Link from 'next/link'

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
      <Button color='secondary' variant='tonal' startIcon={<Icon icon='tabler:upload' />}>
        Export
      </Button>
      <Box sx={{ rowGap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <CustomTextField
          value={value}
          sx={{ mr: 4 }}
          placeholder='Search Name'
          onChange={e => handleFilter(e.target.value)}
        />
        <Link href='/ms/kelas/KelasAddView' passHref>
          <Button variant='contained' sx={{ '& svg': { mr: 2 } }}>
            <Icon fontSize='1.125rem' icon='tabler:plus' />
            Tambah
          </Button>
        </Link>
      </Box>
    </Box>
  )
}

export default TableHeader