import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, IconButton } from '@mui/material';
import axiosConfig from 'src/configs/axiosConfig';
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'

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
    router.push('/ms/mataPelajaranGuru/progresSiswa/' + subjectId)
  };

  const formatTime = (timeString: any) => {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  return (
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
  );
};

export default SocialCardLayout;
