import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { api } from "./api"

import authReducer from "./features/auth/authSlice"
import notificationReducer from "./features/notifications/notificationsSlice"
import offlineTodosReducer from "./features/todos/offline/offlineSlice"
import todoReducer from "./features/todos/todoSlice"

const rootReducer = combineReducers({
  auth: authReducer,
  offlineTodos: offlineTodosReducer,
  todo: todoReducer,
  notification: notificationReducer,
  [api.reducerPath]: api.reducer
})

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    devTools: false,
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]