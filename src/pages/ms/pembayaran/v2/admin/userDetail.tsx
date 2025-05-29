import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import urlImage from '../../../../../configs/url_image'

const UserImage = ({ schoolId, imageName, id }: { schoolId: string; imageName: string; id: string }) => {
  // Construct the full image URL
  const imageUrl = `${urlImage}uploads/school/siswa/${schoolId}/${imageName}`

  return (
    <Box
      component='img'
      src={imageUrl}
      alt={id}
      sx={{
        width: '100%',
        height: '230px',
        borderRadius: '15%',
        margin: '10px',
        objectFit: 'cover'
      }}
    />
  )
}

const UserBasicDetails = ({ userDetails }: { userDetails: any }) => {
  const bold = { fontWeight: 'bold' }; // Define the bold style for values

  return (
    <TableContainer>
      <Table sx={{ border: 'none' }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ borderBottom: 'none', width: '150px', textAlign: 'center', verticalAlign: 'middle' }}>
              <div>{'Nama Lengkap'}</div>
              <div style={bold}>{userDetails.full_name}</div> {/* Bold applied to value */}
            </TableCell>
            <TableCell sx={{ borderBottom: 'none', width: '150px', textAlign: 'center', verticalAlign: 'middle' }}>
              <div>{'Kelas'}</div>
              <div style={bold}>{userDetails.class_name}</div> {/* Bold applied to value */}
            </TableCell>
            <TableCell sx={{ borderBottom: 'none', width: '150px', textAlign: 'center', verticalAlign: 'middle' }}>
              <div>{'Jurusan'}</div>
              <div style={bold}>{userDetails.major_name}</div> {/* Bold applied to value */}
            </TableCell>
            <TableCell sx={{ borderBottom: 'none', width: '150px', textAlign: 'center', verticalAlign: 'middle' }}>
              <div>{'Yayasan'}</div>
              <div style={bold}>{userDetails.school_name}</div> {/* Bold applied to value */}
            </TableCell>
            <TableCell sx={{ borderBottom: 'none', width: '150px', textAlign: 'center', verticalAlign: 'middle' }}>
              <div>{'Sekolah'}</div>
              <div style={bold}>{userDetails.unit_name}</div> {/* Bold applied to value */}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};



const UserContactDetails = ({ userDetails }: { userDetails: any }) => (
  <TableContainer>
    <Table sx={{ border: 'none' }}>
      <TableBody>
        <TableRow>
          <TableCell sx={{ borderBottom: 'none', textAlign: 'center' }}>Nisn</TableCell>
          <TableCell sx={{ borderBottom: 'none' }}>: {userDetails.nisn}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ borderBottom: 'none', textAlign: 'center' }}>Email</TableCell>
          <TableCell sx={{ borderBottom: 'none' }}>: {userDetails.email}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ borderBottom: 'none', textAlign: 'center' }}>No. Wa</TableCell>
          <TableCell sx={{ borderBottom: 'none' }}>: {userDetails.phone}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ borderBottom: 'none', textAlign: 'center' }}>Status</TableCell>
          <TableCell sx={{ borderBottom: 'none' }}>
            :{' '}
            <Button
              variant='contained'
              color={userDetails.status === 'ON' ? 'primary' : userDetails.status === 'LULUS' ? 'success' : 'error'}
              size='small'
            >
              {userDetails.status}
            </Button>
          </TableCell>
        </TableRow>
        {/* Separate Address Row */}
        <TableRow>
          <TableCell sx={{ borderBottom: 'none', textAlign: 'center' }}>Alamat</TableCell>
          <TableCell sx={{ borderBottom: 'none' }}>: {userDetails.address}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
)

const UserDetailsCard = ({ userDetails }: { userDetails: any }) => (
  <Grid container spacing={3}>
    {/* User Image */}

    {/* User Basic Details */}
    <Grid item xs={12} md={12}>
      <UserBasicDetails userDetails={userDetails} />
    </Grid>

    {/* User Contact Details */}
    {/* <Grid item xs={12} md={5}>
      <UserContactDetails userDetails={userDetails} />
    </Grid> */}
  </Grid>
)

export default UserDetailsCard
