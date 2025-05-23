import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import axiosConfig from 'src/configs/axiosConfig'

interface DataParams {
  school_id: number
  q: string
  subjec: any
}
interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

// ** Fetch Users
export const fetchDataProgresSiswa = createAsyncThunk('appUsers/fetchDataProgresSiswa', async (params: DataParams) => {
  const storedToken = window.localStorage.getItem('token')
  const customConfig = {
    params,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + storedToken
    }
  }
  const response = await axiosConfig.get('/list-progres-siswa', customConfig)

  return response.data
})

export const deleteProgresSiswa = createAsyncThunk(
  'appUsers/deleteProgresSiswa',
  async (uid: number | string, { getState, dispatch }: Redux) => {
    const storedToken = window.localStorage.getItem('token')
    const dataAll = {
      data: uid
    }
    const customConfig = {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + storedToken
      }
    }
    const response = await axiosConfig.post('/delete-progres-siswa', dataAll, customConfig)
    const { school_id, subjec, q } = getState().kelas

    // Memanggil fetchDataProgresSiswa untuk memperbarui data setelah penghapusan
    dispatch(fetchDataProgresSiswa({ school_id, subjec, q }))

    return response.data
  }
)
export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchDataProgresSiswa.fulfilled, (state, action) => {
      state.data = action.payload
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
    })
  }
})

export default appUsersSlice.reducer
