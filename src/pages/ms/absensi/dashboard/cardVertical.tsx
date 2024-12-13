// ** MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'

interface CardStatsVerticalProps {
  stats: string | number // The main data displayed in the card (can be string or number)
  title: string // The title of the card
  chipText?: string // Optional text for a chip (if needed)
  subtitle: string // Subtitle of the card (e.g., a description or category)
  avatarIcon: string // The icon for the avatar (can be an icon name or component)
  avatarSize?: number // Optional size of the avatar (default: 44)
  avatarColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' // Optional avatar color (default: 'primary')
}
const CardStatsVertical = (props: CardStatsVerticalProps) => {
  // ** Props
  const { stats, title, subtitle, avatarIcon, avatarSize = 44, avatarColor = 'primary' } = props

  return (
    <Card sx={{}}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <CustomAvatar
          skin='light'
          variant='rounded'
          color={avatarColor}
          sx={{ mb: 3.5, width: avatarSize, height: avatarSize }}
        >
          <Icon icon={avatarIcon} fontSize={20} />
        </CustomAvatar>
        <Typography variant='h5' sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant='body2' sx={{ mb: 1, color: 'text.disabled' }}>
          {subtitle}
        </Typography>
        <Typography sx={{ mb: 3.5, color: 'text.secondary' }}>{stats}</Typography>
      </CardContent>
    </Card>
  )
}

export default CardStatsVertical
