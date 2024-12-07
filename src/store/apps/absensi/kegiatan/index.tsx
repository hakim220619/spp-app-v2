import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import axiosConfig from 'src/configs/axiosConfig'

interface DataParams {
  school_id: number
  unit_id: string
  class_id: string
}
interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

// ** Fetch Users
export const fetchDataAbsensiKegiatan = createAsyncThunk(
  'appUsers/fetchDataAbsensiKegiatan',
  async (params: DataParams) => {
    const storedToken = window.localStorage.getItem('token')
    const customConfig = {
      params,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + storedToken
      }
    }
    const response = await axiosConfig.get('/list-absensi-kegiatan-by-userId', customConfig)

    return response.data
  }
)

export const deleteAbsensi = createAsyncThunk(
  'appUsers/deleteAbsensi',
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
    const response = await axiosConfig.post('/delete-Cuti', dataAll, customConfig)
    const { school_id, class_id, unit_id } = getState().AbsensiKegiatan

    // Memanggil fetchDataAbsensi untuk memperbarui data setelah penghapusan
    dispatch(fetchDataAbsensiKegiatan({ school_id, class_id, unit_id }))

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
    builder.addCase(fetchDataAbsensiKegiatan.fulfilled, (state, action) => {
      state.data = action.payload
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
    })
  }
})

export default appUsersSlice.reducer
