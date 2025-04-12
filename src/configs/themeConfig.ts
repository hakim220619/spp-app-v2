/**
 * Config
 * -------------------------------------------------------------------------------------
 * ! IMPORTANT: Make sure you clear the browser local storage in order to see the config changes in the template.
 * ! To clear local storage, you may refer https://www.leadshook.com/help/how-to-clear-local-storage-in-google-chrome-browser/.
 */

// ** MUI Imports
import { Direction } from '@mui/material'

// ** Types
import {
  Skin,
  Mode,
  AppBar,
  Footer,
  ContentWidth,
  VerticalNavToggle,
  HorizontalMenuToggle,
  Layout
} from 'src/@core/layouts/types'

type ThemeConfig = {
  skin: Skin
  mode: Mode
  appBar: AppBar
  footer: Footer
  navHidden: boolean
  appBarBlur: boolean
  direction: Direction
  templateName: string
  navCollapsed: boolean
  routingLoader: boolean
  disableRipple: boolean
  navigationSize: number
  navSubItemIcon: string
  menuTextTruncate: boolean
  contentWidth: ContentWidth
  disableCustomizer: boolean
  responsiveFontSizes: boolean
  collapsedNavigationSize: number
  horizontalMenuAnimation: boolean
  layout: 'vertical' | 'horizontal'
  verticalNavToggleType: VerticalNavToggle
  horizontalMenuToggle: HorizontalMenuToggle
  afterVerticalNavMenuContentPosition: 'fixed' | 'static'
  beforeVerticalNavMenuContentPosition: 'fixed' | 'static'
  toastPosition: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

let schoolName = ''; // Default value

// Only access localStorage on the client-side
if (typeof window !== 'undefined') {
  schoolName = localStorage.getItem('userData.schooL_name') || 'DLHCODE';
}

// src/configs/themeConfig.ts

let themeConfig = {
  templateName: 'SIMS', // Default
  layout: 'horizontal',
  mode: 'light',
  direction: 'ltr',
  skin: 'default',
  contentWidth: 'full',
  footer: 'static',
  routingLoader: true,
  navHidden: false,
  menuTextTruncate: true,
  navSubItemIcon: 'tabler:circle',
  verticalNavToggleType: 'accordion',
  navCollapsed: false,
  navigationSize: 260,
  collapsedNavigationSize: 82,
  afterVerticalNavMenuContentPosition: 'fixed',
  beforeVerticalNavMenuContentPosition: 'fixed',
  horizontalMenuToggle: 'hover',
  horizontalMenuAnimation: true,
  appBar: 'fixed',
  appBarBlur: true,
  responsiveFontSizes: false,
  disableRipple: false,
  disableCustomizer: false,
  toastPosition: 'top-right',
};

// Ensure that the `localStorage` access only happens on the client-side
if (typeof window !== 'undefined') {
  const userData = JSON.parse(localStorage.getItem('userData') as string) || {}
  const layout = (localStorage.getItem('lastLayout') as string)
  
  themeConfig.templateName = userData.title || themeConfig.templateName;
  themeConfig.layout = layout || themeConfig.layout;
}

export default themeConfig;

