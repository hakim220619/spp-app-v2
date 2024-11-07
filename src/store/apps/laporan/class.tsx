import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosConfig from 'src/configs/axiosConfig'

interface DataParams {
  school_id: any
  q: string
  class_id: any
}

// ** Fetch Users
export const ListPaymentReportClass = createAsyncThunk('appData/ListPaymentReportClass', async (params: DataParams) => {
  const storedToken = window.localStorage.getItem('token')
  const customConfig = {
    params,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + storedToken
    }
  }
  const response = await axiosConfig.get('/list-report-class', customConfig)

  return response.data
})

export const appDataSlice = createSlice({
  name: 'appData',
  initialState: {
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(ListPaymentReportClass.fulfilled, (state, action) => {
      state.data = action.payload
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
    })
  }
})

export default appDataSlice.reducer
