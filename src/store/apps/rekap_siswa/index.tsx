import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'
import axiosConfig from 'src/configs/axiosConfig'

interface DataParams {
    school_id: number
    q: string
}
interface Redux {
    getState: any
    dispatch: Dispatch<any>
}

// ** Fetch Users
export const fetchDataRekapSiswa = createAsyncThunk('appUsers/fetchDataRekapSiswa', async (params: DataParams) => {
    const storedToken = window.localStorage.getItem('token')
    const customConfig = {
        params,
        headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + storedToken
        }
    }
    const response = await axiosConfig.get('/list-rekap-siswa', customConfig)

    return response.data
})

export const deleteRekapSiswa = createAsyncThunk(
    'appUsers/deleteRekapSiswa',
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
        const { school_id, q } = getState().kelas

        // Memanggil fetchDataRekapSiswa untuk memperbarui data setelah penghapusan
        dispatch(fetchDataRekapSiswa({ school_id, q }))

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
        builder.addCase(fetchDataRekapSiswa.fulfilled, (state, action) => {
            state.data = action.payload
            state.total = action.payload.total
            state.params = action.payload.params
            state.allData = action.payload.allData
        })
    }
})

export default appUsersSlice.reducer
