import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, IconButton, CardHeader, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import axiosConfig from 'src/configs/axiosConfig';
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from 'src/store';
import { useSelector } from 'react-redux';
import { fetchDataRekapSiswa, deleteRekapSiswa } from 'src/store/apps/rekap_siswa/index'
import TableHeader from '../absensi/TableHeaderKegiatan';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomChip from 'src/@core/components/mui/chip'
import { UsersType } from 'src/types/apps/userTypes';
import toast from 'react-hot-toast'
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

  const handleRowEditedClick = () => router.push('/ms/jurusan/' + uid)

  const handleDelete = async () => {
    try {
      await dispatch(deleteRekapSiswa(uid)).unwrap()
      await dispatch(fetchDataRekapSiswa({ school_id, q: value }))
      toast.success('Successfully deleted!')
      setOpen(false)
    } catch (error) {
      console.error('Failed to delete jurusan:', error)
      toast.error('Failed to delete jurusan. Please try again.')
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
        <DialogTitle>{'Apakah Anda yakin ingin menghapus data ini?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>Anda tidak akan dapat mengurungkan tindakan ini!</DialogContentText>
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
  {
    field: 'no',
    headerName: 'No',
    width: 70,
    valueGetter: params => {
      const allRows = params.api.getAllRowIds()

      return allRows.indexOf(params.id) + 1 // Mendapatkan posisi berdasarkan indeks ID
    }
  },
  { field: 'full_name', headerName: 'Nama', flex: 0.175, minWidth: 140 },
  { field: 'subject_name', headerName: 'Mata Pelajaran', flex: 0.175, minWidth: 140 },
  { field: 'description', headerName: 'Deskripsi', flex: 0.175, minWidth: 140 },
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
    renderCell: ({ row }: CellType) => <RowOptions uid={row.id} />
  }
]

const SocialCardLayout: React.FC = () => {

  const data = localStorage.getItem('userData') as string;
  const getDataLocal = JSON.parse(data);
  const schoolId = getDataLocal?.school_id;
  const userId = getDataLocal?.id;
  const storedToken = window.localStorage.getItem('token');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);  // Track selected card
  const router = useRouter()
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axiosConfig.get(`/list-subjects/?schoolId=${schoolId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const filteredSubjects = response.data.filter((subject: any) =>
          subject.school_id === schoolId && subject.user_id === userId
        );

        setSubjects(filteredSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, [schoolId, userId, storedToken]);

  const handleCardClick = (subjectId: number) => {
    setSelectedCard(subjectId === selectedCard ? null : subjectId);
    router.push('/ms/rekap_siswa/progresSiswa/' + subjectId)
  };

  const formatTime = (timeString: any) => {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };


  const [school_id] = useState<number>(getDataLocal.school_id)
  const [value, setValue] = useState<string>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState<boolean>(true)
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.RekapSiswa)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchDataRekapSiswa({ school_id, q: value })).finally(() => {
      setLoading(false)
    })
  }, [dispatch, school_id, value])

  const handleFilter = useCallback((val: string) => setValue(val), [])
  return (
    <>
      <Grid container spacing={6.5}>
        {subjects.map((subject) => (
          <Grid item xs={12} sm={4} key={subject.id}>
            <Card
              sx={{
                width: '100%',
                height: 200,
                backgroundColor: selectedCard === subject.id ? 'rgba(77, 77, 77, 0.1)' : '', // Change color when selected
                cursor: 'pointer',
              }}
              onClick={() => handleCardClick(subject.id)}  // Set selected card on click
            >
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <IconButton size='small' color='primary'>
                    <Icon icon='tabler:book' />
                  </IconButton>
                  <Typography variant="h6" style={{ marginLeft: 10 }}>
                    {subject.subject_name}
                  </Typography>

                  {/* Add this div to push the times to the far right */}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" style={{ marginLeft: 0 }}>
                      {formatTime(subject.start_time_in)}
                    </Typography>
                    <Typography variant="h6" style={{ marginLeft: 10 }}>
                      {' > '}
                    </Typography>
                    <Typography variant="h6" style={{ marginLeft: 10 }}>
                      {formatTime(subject.end_time_out)}
                    </Typography>
                  </div>

                </div>

                <br />
                <Typography variant="body1" paragraph fontSize={12}>
                  {subject.description || 'No description available.'}
                </Typography>
                <br />
                <br />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{subject.unit_name || 'Unknown Author'}</Typography>
                  <div>
                    <Typography variant="body2" color="textSecondary">
                      Kode: {subject.code || '0'}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={6.5}>
        <Grid item xs={12}></Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Data Rekap Siswa' />
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
    </>
  );
};

export default SocialCardLayout;
