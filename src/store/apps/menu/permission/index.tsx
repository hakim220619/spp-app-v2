import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import axiosConfig from 'src/configs/axiosConfig'

interface DataParams {
    school_id: number
    q: string
    role_id: string
}
interface Redux {
    getState: any
    dispatch: Dispatch<any>
}

// ** Fetch Users
export const fetchDataMenuPermission = createAsyncThunk('appUsers/fetchDataMenuPermission', async (params: DataParams) => {
    const storedToken = window.localStorage.getItem('token')
    const customConfig = {
        params,
        headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + storedToken
        }
    }
    const response = await axiosConfig.get('/list-menuPermission', customConfig)

    return response.data.data
})

export const deleteMenuPermission = createAsyncThunk(
    'appUsers/deleteMenuPermission',
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
        const response = await axiosConfig.post('/delete-menuPermission', dataAll, customConfig)

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
        builder.addCase(fetchDataMenuPermission.fulfilled, (state, action) => {
            state.data = action.payload
            state.total = action.payload.total
            state.params = action.payload.params
            state.allData = action.payload.allData
        })
    }
})

export default appUsersSlice.reducer
