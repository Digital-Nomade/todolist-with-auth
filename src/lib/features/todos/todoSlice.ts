import { createSlice } from '@reduxjs/toolkit'
import { TodoData } from './todoTypes'


const initialState: TodoData = {
  toggleAddTodoModal: false,
}

export const authSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: { 
    setToggleAddTodoModal: (state) => {
      state.toggleAddTodoModal = !state.toggleAddTodoModal
    }
  }
})

export const { 
  setToggleAddTodoModal,
 } = authSlice.actions

export default authSlice.reducer