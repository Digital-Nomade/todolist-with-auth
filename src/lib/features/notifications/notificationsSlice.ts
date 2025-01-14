import { Notification } from '@/types/Notification.type'
import { createSlice } from '@reduxjs/toolkit'
import { NotificationsInitialState } from './notificationsTypes'

const notificationArray: Notification[] = [
  {
    id: '#091283912839',
    title: 'Notification 1',
    isViewed: false,
    viewedIn: null
  },
  {
    id: '#0192038758',
    title: 'Notification 2',
    isViewed: false,
    viewedIn: null
  },
  {
    id: '#1029751987hj;l',
    title: 'Notification 3',
    isViewed: false,
    viewedIn: null
  },
  {
    id: '#1239818978jhcj0',
    title: 'Notification 4',
    isViewed: false,
    viewedIn: null
  },
]

const initialState: NotificationsInitialState = {
  hasNotifications: false,
  notifications: notificationArray
}

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: { 
    viewNotification: (state, { payload }) => {
      const { notificationID } = payload
      console.log(payload)
      state.notifications = state.notifications.map(notification => {
        if (notification.id === notificationID) {
          notification.isViewed = true
          notification.viewedIn = new Date()
        }

        return notification
      })

      const isAllViewed = state.notifications.every(notification => !notification.isViewed)
      state.hasNotifications = isAllViewed
    },
    checkIfHasNotification: (state) => {
      state.notifications.some(notification => !notification.isViewed)
      // state.hasNotifications = hasNotification
    }
  }
})

export const { 
  viewNotification,
  checkIfHasNotification,
 } = notificationSlice.actions

export default notificationSlice.reducer