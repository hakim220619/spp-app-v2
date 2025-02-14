import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosConfig from 'src/configs/axiosConfig'

interface DataParams {
  school_id: number
  q: string
  status: string
}

// ** Fetch Users
export const fetchDataHariLibur = createAsyncThunk('appUsers/fetchDataHariLibur', async (params: DataParams) => {
  const storedToken = window.localStorage.getItem('token')
  const customConfig = {
    params,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + storedToken
    }
  }
  const response = await axiosConfig.get('/list-holiday', customConfig)

  return response.data
})

export const deleteHariLibur = createAsyncThunk('appUsers/deleteHariLibur', async (id: number | string) => {
  const storedToken = window.localStorage.getItem('token')
  const dataAll = {
    data: id
  }
  const customConfig = {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + storedToken
    }
  }
  const response = await axiosConfig.post('/delete-holiday', dataAll, customConfig)

  return response.data
})
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
    builder.addCase(fetchDataHariLibur.fulfilled, (state, action) => {
      state.data = action.payload
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
    })
  }
})

export default appUsersSlice.reducer
