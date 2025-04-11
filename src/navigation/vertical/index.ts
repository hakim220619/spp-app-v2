import { VerticalNavItemsType, NavLink } from 'src/@core/layouts/types'
import axiosConfig from 'src/configs/axiosConfig'

const fetchMenuData = async () => {
  try {
    const response = await axiosConfig.get('/menu')
    if (Array.isArray(response.data.data)) {
      return response.data.data
    } else {
      console.error('Invalid data format')
      return []
    }
  } catch (error) {
    console.error('Error fetching menu data:', error)
    return []
  }
}

const transformMenuData = (menuData: any, role: number): VerticalNavItemsType => {
  const navigation: VerticalNavItemsType = []

  menuData.forEach((item: any) => {
    if (item.is_active === 1 && item.parent_id === null) {
      const navItem: NavLink = {
        title: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        icon: item.icon || 'ion:home-outline',
        path: item.address
      }

      const children = menuData.filter((child: any) => child.parent_id === item.id && child.is_active === 1)

      if (children.length > 0) {
        navItem.children = children.map((child: any) => ({
          title: child.name.charAt(0).toUpperCase() + child.name.slice(1),
          path: child.address
        }))
      }

      navigation.push(navItem)
    }
  })

  return navigation
}

const navigation = async (): Promise<VerticalNavItemsType> => {
  const data = localStorage.getItem('userData')
  const getDataLocal = data ? JSON.parse(data) : null
  const role = getDataLocal?.role

  if (!role) {
    return []
  }

  const menuData = await fetchMenuData()
  const transformedMenu = transformMenuData(menuData, role)

  return transformedMenu
}

export default navigation
