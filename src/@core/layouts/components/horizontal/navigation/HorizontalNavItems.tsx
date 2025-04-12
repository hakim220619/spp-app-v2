import { useState, useEffect } from 'react'
import { NavLink, NavGroup, HorizontalNavItemsType } from 'src/@core/layouts/types'

// ** Custom Navigation Components
import HorizontalNavLink from './HorizontalNavLink'
import HorizontalNavGroup from './HorizontalNavGroup'

interface Props {
  hasParent?: boolean
  horizontalNavItems?: Promise<HorizontalNavItemsType> | HorizontalNavItemsType
}

const resolveComponent = (item: NavGroup | NavLink) => {
  if ((item as NavGroup).children) return HorizontalNavGroup
  return HorizontalNavLink
}

const HorizontalNavItems = (props: Props) => {
  const [navItems, setNavItems] = useState<HorizontalNavItemsType | null>(null)

  // Fetch the horizontalNavItems when the component mounts (if it's a Promise)
  useEffect(() => {
    if (props.horizontalNavItems instanceof Promise) {
      props.horizontalNavItems.then((resolvedItems) => {
        setNavItems(resolvedItems)
      })
    } else {
      setNavItems(props.horizontalNavItems || [])
    }
  }, [props.horizontalNavItems])

  // If navItems is still null or undefined, we can return loading state or null
  if (!navItems) return <div>Loading...</div>

  const RenderMenuItems = navItems.map((item: NavGroup | NavLink, index: number) => {
    const TagName: any = resolveComponent(item)

    return <TagName {...props} key={index} item={item} />
  })

  return <>{RenderMenuItems}</>
}

export default HorizontalNavItems
