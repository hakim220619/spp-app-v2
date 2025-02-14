import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  const data = localStorage.getItem('userData')
  const getDataLocal = data ? JSON.parse(data) : null // Handle null case
  const role = getDataLocal?.role // Optional chaining for safety

  if (role === 150) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        path: 'admin/cb/approval'
      },
      {
        title: 'Master Data',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [
          { title: 'Admin', path: '/ms/admin' },
          { title: 'Siswa', path: '/ms/siswa' },
          { title: 'Sekolah', path: '/ms/sekolah' },
          { title: 'Aplikasi', path: '/ms/aplikasi' },
          { title: 'Affiliate', path: '/ms/affiliate' },
          { title: 'Permission', path: '/ms/permission' }
        ]
      },
      {
        title: 'Setting',
        icon: 'tabler:settings-cog',
        badgeColor: 'error',
        children: [{ title: 'Aplikasi', path: '/ms/setting/aplikasi' }]
      }
    ]
  } else if (role === 160) {
    return [
      {
        title: 'Home',
        icon: 'ion:home-outline',
        badgeColor: 'error',
        path: '/ms/dashboard/siswa'
      }
    ]
  } else if (role === 170) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        subject: 'ms-ds-admin',
        path: '/ms/dashboard/admin'
      },
      {
        title: 'Broadcast',
        icon: 'ion:logo-whatsapp',
        path: '/ms/broadcast/whatsapp'
      },
      {
        title: 'PPDB',
        icon: 'tabler:registered',
        badgeColor: 'error',
        children: [
          { title: 'Daftar Siswa', path: '/ms/ppdb' },
          { title: 'Setting PPDB', path: '/ms/setting/ppdb' }
        ]
      },
      {
        title: 'Kas',
        icon: 'ion:albums-outline',
        path: '/ms/kas'
      },

      {
        title: 'Master Data',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [
          { title: 'Admin', path: '/ms/admin' },
          { title: 'Guru', path: '/ms/guru' },
          { title: 'Siswa', path: '/ms/siswa', subject: 'ms-siswa' },
          { title: 'Kelas', path: '/ms/kelas' },
          { title: 'Pindah Kelas', path: '/ms/kelas/pindahKelas' },
          { title: 'Kelulusan', path: '/ms/lulus' },
          { title: 'Jurusan', path: '/ms/jurusan' },
          { title: 'Mata Pelajaran', path: '/ms/mataPelajaran' },
          { title: 'Bulan', path: '/ms/bulan' },
          { title: 'Unit', path: '/ms/unit' }
        ]
      },
      {
        title: 'Absensi',
        icon: 'tabler:fingerprint',
        badgeColor: 'error',
        children: [
          { title: 'Dashboard', path: '/ms/absensi/dashboard' },
          { title: 'Absensi', path: '/ms/absensi' },
          { title: 'Kegiatan', path: '/ms/absensi/activities' },
          { title: 'Jenis Cuti', path: '/ms/absensi/cuti/jenisCuti' },
          { title: 'Cuti', path: '/ms/absensi/cuti' },
          { title: 'Hari Libur', path: '/ms/absensi/hariLibur' },
          { title: 'Laporan', path: '/ms/absensi/laporan' }
        ]
      },
      {
        title: 'Tunggakan',
        icon: 'tabler:bell-dollar',
        path: '/ms/tunggakan'
      },
      {
        title: 'Pembayaran',
        icon: 'ion:wallet-outline',
        path: '/ms/pembayaran/admin'
      },
      {
        title: 'Setting Pembayaran',
        icon: 'ion:wallet',
        path: '/ms/setting/pembayaran'
      },
      {
        title: 'Laporan',
        icon: 'tabler:report-search',
        path: '/ms/laporan'
      },

      {
        title: 'Setting',
        icon: 'tabler:settings-cog',
        badgeColor: 'error',
        children: [
          { title: 'Aplikasi', path: '/ms/setting/aplikasi' },
          { title: 'Template Pesan', path: '/ms/templateMessage' }
        ]
      }
    ]
  } else if (role === 200) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        subject: 'ms-ds-admin',
        path: '/ms/dashboard/admin'
      },
      {
        title: 'Broadcast',
        icon: 'ion:logo-whatsapp',
        path: '/ms/broadcast/whatsapp'
      },
      {
        title: 'Master Data',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [
          { title: 'Siswa', path: '/ms/siswa', subject: 'ms-siswa' },
          { title: 'Kelas', path: '/ms/kelas' },
          { title: 'Jurusan', path: '/ms/jurusan' },
          { title: 'Bulan', path: '/ms/bulan' },
          { title: 'Unit', path: '/ms/unit' }
        ]
      },
      {
        title: 'Tunggakan',
        icon: 'tabler:bell-dollar',
        path: '/ms/tunggakan'
      },
      {
        title: 'Pembayaran',
        icon: 'ion:wallet-outline',
        path: '/ms/pembayaran/admin'
      },
      {
        title: 'Setting Pembayaran',
        icon: 'ion:wallet',
        path: '/ms/setting/pembayaran'
      },
      {
        title: 'Laporan',
        icon: 'tabler:report-search',
        path: '/ms/laporan'
      }
    ]
  } else if (role === 210) {
    return [
      {
        title: 'Dashboards',
        icon: 'ion:home-outline',
        subject: 'ms-ds-admin',
        path: '/ms/dashboard/admin'
      },
      {
        title: 'Master Data',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [{ title: 'Siswa', path: '/ms/siswa', subject: 'ms-siswa' }]
      },
      {
        title: 'Tunggakan',
        icon: 'tabler:bell-dollar',
        path: '/ms/tunggakan'
      },
      {
        title: 'Pembayaran',
        icon: 'ion:wallet-outline',
        path: '/ms/pembayaran/admin'
      },
      {
        title: 'Setting Pembayaran',
        icon: 'ion:wallet',
        path: '/ms/setting/pembayaran'
      }
    ]
  } else if (role === 230) {
    return [
      {
        title: 'PPDB',
        icon: 'tabler:registered',
        badgeColor: 'error',
        children: [
          { title: 'Daftar Siswa', path: '/ms/ppdb' },
          { title: 'Setting PPDB', path: '/ms/setting/ppdb' }
        ]
      }
    ]
  } else {
    return [
      {
        title: 'Admin',
        icon: 'tabler:users',
        badgeColor: 'error',
        children: [{ title: 'Data Admin', path: '/ms/admin' }]
      }
    ]
  }
}

export default navigation
