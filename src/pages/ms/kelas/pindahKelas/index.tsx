import { useState, useEffect, useCallback } from 'react'
import { Card, Grid, Divider, CircularProgress, Button, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import CustomChip from 'src/@core/components/mui/chip'
import { fetchDataPindahKelas } from 'src/store/apps/kelas/pindahKelas/index'
import { RootState, AppDispatch } from 'src/store'
import TableHeader from 'src/pages/ms/kelas/pindahKelas/TableHeader'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import axiosConfig from 'src/configs/axiosConfig'
import Icon from 'src/@core/components/icon'
import { Box } from '@mui/system'

const statusObj: any = {
  ON: { title: 'ON', color: 'primary' },
  OFF: { title: 'OFF', color: 'error' }
}

const columns: GridColDef[] = [
  { field: 'full_name', headerName: 'Nama Lengkap', flex: 0.175, minWidth: 170 },
  { field: 'class_name', headerName: 'Kelas', flex: 0.175, minWidth: 140 },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.175,
    minWidth: 50,
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
  }
]

const UserList = () => {
  const data = localStorage.getItem('userData') as string
  const getDataLocal = JSON.parse(data)
  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 })
  const [loading, setLoading] = useState<boolean>(true)

  const [unitDari, setUnitDari] = useState('')
  const [unitKe, setUnitKe] = useState('')
  const [classDari, setClassDari] = useState('')
  const [classKe, setClassKe] = useState('')

  const [units, setUnits] = useState<any[]>([])
  const [filteredClassesDari, setFilteredClassesDari] = useState<any[]>([])
  const [filteredClassesKe, setFilteredClassesKe] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [selectedRowsKe, setSelectedRowsKe] = useState<any[]>([])
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.PindahKelas)
  const storedToken = window.localStorage.getItem('token')

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axiosConfig.get(`/getUnit`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        const filteredUnits = response.data.filter((unit: any) => unit.school_id === school_id)
        setUnits(filteredUnits)
      } catch (error) {
        console.error('Error fetching units:', error)
      }
    }

    const fetchClassesDari = async () => {
      try {
        const response = await axiosConfig.get(`/getClass/?schoolId=${school_id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        const filteredClass = response.data.filter((cla: any) => cla.unit_id === unitDari)
        setFilteredClassesDari(filteredClass)
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }

    const fetchClassesKe = async () => {
      try {
        const response = await axiosConfig.get(`/getClass/?schoolId=${school_id}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`
          }
        })
        const filteredClass = response.data.filter((cla: any) => cla.unit_id === unitKe)
        setFilteredClassesKe(filteredClass)
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }

    fetchUnits()
    if (unitDari) fetchClassesDari()
    if (unitKe) fetchClassesKe()
  }, [school_id, storedToken, unitDari, unitKe])

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataPindahKelas({ school_id, status: '', q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])

  const handlePindah = async () => {
    try {
      if (!selectedRows || selectedRows.length === 0) {
        alert('Pilih siswa yang akan dipindah.')
        return
      }

      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Delay 1 detik
      const payload = {
        unit_from: unitDari,
        class_from: classDari,
        unit_to: unitKe,
        class_to: classKe,
        students: selectedRows.map(id => ({
          id
        }))
      }

      const response = await axiosConfig.post('/pindah-kelas-siswa-by-kelas', payload, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${storedToken}`
        }
      })

      if (response.status === 200) {
        dispatch(fetchDataPindahKelas({ school_id, status: '', q: value }))
      } else {
        console.error('Pindah kelas gagal.')
      }
    } catch (error) {
      console.error('Error pindah kelas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKembali = async () => {
    try {
      if (!selectedRowsKe || selectedRowsKe.length === 0) {
        alert('Pilih siswa yang akan dipindah kembali.')
        return
      }

      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Delay 1 detik
      const payload = {
        unit_from: unitKe,
        class_from: classKe,
        unit_to: unitDari,
        class_to: classDari,
        students: selectedRowsKe.map(id => ({
          id
        }))
      }

      const response = await axiosConfig.post('/kembali-kelas-siswa-by-kelas', payload, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${storedToken}`
        }
      })

      if (response.status === 200) {
        dispatch(fetchDataPindahKelas({ school_id, status: '', q: value }))
      } else {
        console.error('Kembali kelas gagal.')
      }
    } catch (error) {
      console.error('Error kembali kelas:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Grid container spacing={6.5}>
        <Grid item xs={5}>
          <Card>
            <Typography variant='h4' component='div' sx={{ p: 2, textAlign: 'center' }}>
              Pindah Dari Kelas
            </Typography>
            <Divider />
            <Grid container spacing={2} sx={{ p: 3 }}>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  fullWidth
                  value={units.find(u => u.id === unitDari) || null}
                  options={units}
                  onChange={(event, newValue) => {
                    setUnitDari(newValue ? newValue.id : '')
                    setClassDari('')
                  }}
                  getOptionLabel={option => option.unit_name || ''}
                  renderInput={params => <CustomTextField {...params} label='Unit' />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  fullWidth
                  value={filteredClassesDari.find(c => c.id === classDari) || null}
                  options={filteredClassesDari}
                  onChange={(event, newValue) => setClassDari(newValue ? newValue.id : '')}
                  getOptionLabel={option => option.class_name || ''}
                  renderInput={params => <CustomTextField {...params} label='Kelas' />}
                />
              </Grid>
            </Grid>
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
                rows={store.data.filter((row: any) => row.class_id === classDari)}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={newSelection => {
                  setSelectedRows(newSelection)
                }}
                disableRowSelectionOnClick={false}
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

        <Grid item xs={2}>
          <Card sx={{ padding: 2 }}>
            <Button
              variant='contained'
              color='success'
              startIcon={<Icon icon='tabler:arrow-badge-right' />}
              endIcon={<Icon icon='tabler:arrow-badge-right' />}
              fullWidth
              sx={{ margin: 1 }}
              disabled={!unitDari || !classDari || !unitKe || !classKe}
              onClick={handlePindah}
            >
              Pindah
            </Button>

            <Button
              variant='contained'
              color='info'
              startIcon={<Icon icon='tabler:arrow-badge-left' />}
              endIcon={<Icon icon='tabler:arrow-badge-left' />}
              fullWidth
              sx={{ margin: 1 }}
              disabled={!unitDari || !classDari || !unitKe || !classKe}
              onClick={handleKembali}
            >
              Kembali
            </Button>
          </Card>
        </Grid>

        <Grid item xs={5}>
          <Card>
            <Typography variant='h4' component='div' sx={{ p: 2, textAlign: 'center' }}>
              Pindah Ke Kelas
            </Typography>
            <Divider />
            <Grid container spacing={2} sx={{ p: 3 }}>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  fullWidth
                  value={units.find(u => u.id === unitKe) || null}
                  options={units}
                  onChange={(event, newValue) => {
                    setUnitKe(newValue ? newValue.id : '')
                    setClassKe('')
                  }}
                  getOptionLabel={option => option.unit_name || ''}
                  renderInput={params => <CustomTextField {...params} label='Unit' />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomAutocomplete
                  fullWidth
                  value={filteredClassesKe.find(c => c.id === classKe) || null}
                  options={filteredClassesKe}
                  onChange={(event, newValue) => setClassKe(newValue ? newValue.id : '')}
                  getOptionLabel={option => option.class_name || ''}
                  renderInput={params => <CustomTextField {...params} label='Kelas' />}
                />
              </Grid>
            </Grid>
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
                rows={store.data.filter((row: any) => row.class_id === classKe)}
                columns={columns}
                checkboxSelection
                disableRowSelectionOnClick={false}
                onRowSelectionModelChange={newSelection => {
                  setSelectedRowsKe(newSelection)
                }}
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
    </>
  )
}

export default UserList
