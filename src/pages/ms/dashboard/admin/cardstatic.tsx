// ** MUI Imports
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Type Import
import { CardVerticalDashboard } from 'src/@core/components/card-statistics/types'

// ** Custom Component Import
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

const CardStatsVertical = (props: CardVerticalDashboard) => {
  // ** Props
  const {
    sx,
    stats,
    title,
    chipText,
    subtitle,
    avatarIcon,
    avatarSize = 44,
    iconSize = '1.75rem',
    chipColor = 'primary',
    avatarColor = 'primary'
  } = props

  const RenderChip = chipColor === 'default' ? Chip : CustomChip

  return (
    <Card sx={{ ...sx }}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          textAlign: 'center',
          mb: 0, // Menghilangkan margin bawah sepenuhnya
          pb: 0 // Menghilangkan padding bawah agar benar-benar rapat
        }}
      >
        <div>
          <CustomAvatar
            skin='light'
            variant='rounded'
            color={avatarColor}
            sx={{ mr: 3, width: avatarSize, height: avatarSize }}
          >
            <Icon icon={avatarIcon} fontSize={iconSize} />
          </CustomAvatar>
          <Typography variant='body2' sx={{ mb: 1, textAlign: 'center' }}>
            {subtitle}
          </Typography>
        </div>
        <Typography sx={{ mb: 1, color: 'secondary', fontSize: 25 }}>{stats}</Typography>
      </CardContent>
      <CardContent
        sx={{
          display: 'grid',
          flexDirection: 'row',
          alignItems: 'flex-start',
          mt: 0, // Menghilangkan margin atas sepenuhnya
          pt: 0 // Menghilangkan padding atas agar benar-benar rapat
        }}
      >
        <Typography variant='h5' sx={{ mb: 1 }}>
          {title}
        </Typography>
        <RenderChip
          size='small'
          label={chipText}
          color={chipColor}
          {...(chipColor === 'default'
            ? { sx: { borderRadius: '4px', color: 'text.secondary' } }
            : { rounded: true, skin: 'light' })}
        />
      </CardContent>
    </Card>
  )
}

export default CardStatsVertical
