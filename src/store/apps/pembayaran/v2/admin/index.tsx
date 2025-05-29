import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosConfig from 'src/configs/axiosConfig'

interface DataParams {
    q: string
    school_id: string
    user_id: string
    unit_id: string
}

// ** Fetch Users
export const ListPaymentDashboardByMonthAdminv2 = createAsyncThunk(
    'appListPaymentByAdmin/ListPaymentDashboardByMonthAdminv2',
    async (params: DataParams) => {
        const storedToken = window.localStorage.getItem('token')
        const customConfig = {
            params,
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + storedToken
            }
        }
        const response = await axiosConfig.get('/list-payment-byAdmin-v2', customConfig)
        
        return response.data
    }
)

export const appListPaymentByAdminSlice = createSlice({
    name: 'appListPaymentByAdmin',
    initialState: {
        data: [],
        total: 1,
        params: {},
        allData: []
    },
    reducers: {},
    extraReducers: builder => {
        builder.addCase(ListPaymentDashboardByMonthAdminv2.fulfilled, (state, action) => {
            state.data = action.payload
            state.total = action.payload.total
            state.params = action.payload.params
            state.allData = action.payload.allData
        })
    }
})

export default appListPaymentByAdminSlice.reducer
