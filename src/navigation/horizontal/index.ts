import { HorizontalNavItemsType, NavLink } from 'src/@core/layouts/types'
import axiosConfig from 'src/configs/axiosConfig'



const fetchMenuData = async () => {
  const storedToken = window.localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('userData') as string);
  const schoolId = userData?.school_id;
  const roleId = userData?.role;

  try {
    const response = await axiosConfig.get('/list-menu', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + storedToken,
      },
      params: {
        school_id: schoolId,
        role_id: roleId
      },
    });

    if (Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error('Invalid data format');
      return [];
    }
  } catch (error) {
    console.error('Error fetching menu data:', error);
    return [];
  }
};


const transformMenuData = (menuData: any, role: number): HorizontalNavItemsType => {
  const navigation: HorizontalNavItemsType = []

  const createNavItem = (item: any, level: number = 1): NavLink => {

    const navItem: NavLink = {
      title: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      icon: level === 1 ? (item.icon || 'ion:radio-button-on-outline') : '',  // Default icon for submenus
      path: item.address
    }

    const children = menuData.filter((child: any) => child.parent_id === item.id && child.status === 'ON' && (child.role_id === role || !child.role_id))

    if (children.length > 0) {
      navItem.children = children.map((child: any) => createNavItem(child, level + 1)) // Recursively create children
    }

    return navItem
  }

  menuData.forEach((item: any) => {
    if (item.status === 'ON' && item.parent_id === null && (item.role === role || !item.role)) {
      const navItem = createNavItem(item); // Create the nav item for the top-level item
      if (navItem) {
        navigation.push(navItem); // Only add valid nav items
      }
    }
  })

  return navigation
}

const navigation = async (): Promise<HorizontalNavItemsType> => {
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
