import React, { useEffect, useState } from 'react'

// ** Type Imports
import { NavLink, NavGroup, NavSectionTitle, LayoutProps } from 'src/@core/layouts/types'

// ** Custom Menu Components
import VerticalNavLink from './VerticalNavLink'
import VerticalNavGroup from './VerticalNavGroup'
import VerticalNavSectionTitle from './VerticalNavSectionTitle'

interface Props {
  parent?: NavGroup
  navHover?: boolean
  navVisible?: boolean
  groupActive: string[]
  isSubToSub?: NavGroup
  currentActiveGroup: string[]
  navigationBorderWidth: number
  settings: LayoutProps['settings']
  saveSettings: LayoutProps['saveSettings']
  setGroupActive: (value: string[]) => void
  setCurrentActiveGroup: (item: string[]) => void
  verticalNavItems?: Promise<LayoutProps['verticalLayoutProps']['navMenu']['navItems']> // Expecting a Promise here
}

const resolveNavItemComponent = (item: NavGroup | NavLink | NavSectionTitle) => {
  if ((item as NavSectionTitle).sectionTitle) return VerticalNavSectionTitle
  if ((item as NavGroup).children) return VerticalNavGroup

  return VerticalNavLink
}

const VerticalNavItems = (props: Props) => {
  const [navItems, setNavItems] = useState<LayoutProps['verticalLayoutProps']['navMenu']['navItems']>([]) as any

  // Fetch the nav items when the component mounts
  useEffect(() => {
    const fetchNavItems = async () => {
      if (props.verticalNavItems) {
        const resolvedNavItems = await props.verticalNavItems
        setNavItems(resolvedNavItems)
      }
    }

    fetchNavItems()
  }, [props.verticalNavItems]) // Dependency array to re-fetch when props change

  const RenderMenuItems = navItems.map((item: NavGroup | NavLink | NavSectionTitle, index: number) => {
    const TagName: any = resolveNavItemComponent(item)

    return <TagName {...props} key={index} item={item} />
  })

  return <>{RenderMenuItems}</>
}

export default VerticalNavItems
