import { viewNotification } from '@/lib/features/notifications/notificationsSlice'
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { format } from "date-fns"

export function NotificaitonMenu() {
  const dispatch = useAppDispatch()
  const { notifications } = useAppSelector(state => state.notification)

  function handleClickNotification(id: string) {
    dispatch(viewNotification({ notificationId: id }))
  }

  return (
    <div className="absolute left-[-66px]">
      <div className="mx-auto border-solid border-b-secondary border-b-8 border-x-transparent border-x-8 border-t-0 w-[5px] h-[5px" />
      <ul
        className='
          w-[150px]
          bg-secondary
          h-[300px]
          z-50
          after:contents
          mx-auto
          rounded-md
          p-2
          relative
          shadow-[0_12px_16px_3px_rgba(0,0,0,0.4)]
        '
      >
        {
          notifications.map(notification => (
            <button
              key={notification.id}
              className="flex items-center mb-3 justify-between w-full text-white font-light" 
              onClick={() => handleClickNotification(notification.id)}
              disabled={notification.isViewed}
            >
              <p className=" leading-[19px]">{notification.title}</p>
              {notification.viewedIn && <small>{format(notification.viewedIn, 'L')}</small>}
              {!notification.isViewed && <div className="h-[8px] w-[8px] bg-alert rounded-full" />}
            </button>
          ))
        }
      </ul>
    </div>
  )
}
