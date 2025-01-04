import { ReactNode } from 'react'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'
import { ChipProps } from '@mui/material/Chip'
import { SxProps, Theme } from '@mui/material'

export type CardStatsHorizontalProps = {
  title: string
  stats: string
  icon: ReactNode
  color?: ThemeColor
  trendNumber: string
  trend?: 'positive' | 'negative'
}

export type CardStatsVerticalProps = {
  title: string
  stats: string
  icon: ReactNode
  chipText: string
  color?: ThemeColor
  trendNumber: string
  trend?: 'positive' | 'negative'
}
export type CardVerticalDashboard = {
  stats: string
  title: string
  chipText: string
  subtitle: string
  avatarIcon: string
  sx?: SxProps<Theme>
  avatarSize?: number
  avatarColor?: ThemeColor
  iconSize?: number | string
  chipColor?: ChipProps['color']
}

export type CardStatsCharacterProps = {
  src: string
  title: string
  stats: string
  chipText: string
  trendNumber: string
  chipColor?: ThemeColor
  trend?: 'positive' | 'negative'
}
