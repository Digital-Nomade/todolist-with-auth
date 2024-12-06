import {
  AddIcon,
  DashboardIcon,
  HomeIcon,
  NotificationIcon,
  SearchIcon,
  UserIcon
} from "@/components/icons";
import { setToggleAddTodoModal } from "@/lib/features/todos/todoSlice";
import { useAppDispatch } from "@/lib/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificaitonMenu } from "../notification-menu/NotificationMenu";

export function LayoutHeader() {
  const dispatch = useAppDispatch()
  const path = usePathname()

  function handleAddToDo() {
    dispatch(setToggleAddTodoModal())
  }

  function handleViewNotifications() {
    // TODO: Add function to show notifications
  }

  function handleShowUserProfile() {
    // TODO: Add function to show notifications
  }

  return (
    <section className="max-w-[1284px] mx-auto w-full">
      <header className="flex justify-between w-full pt-8 px-8 h-fit flex-1 mb-14">
        <div className="flex gap-8 items-center w-full">
          {path !== '/home' && (
            <div className="relative max-w-[300px] w-full">
              <input className="bg-transparent border border-danger-light rounded-lg p-2 placeholder:text-danger-light w-full" type="text" placeholder="search to do"/>
              <div className="absolute right-2 top-3">
                <SearchIcon />
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-6xl font-thin text-white">Welcome Bruno</h1>
            <button className="h-fit" onClick={handleAddToDo}>
              <AddIcon />
            </button>
          </div>
        </div>
        <nav>
          <ul className="flex gap-12 items-end">
            <li className="flex-1 ">
              <Link
                href="/home"
                className={`relative flex justify-center items-center ${path === '/home' ? 'after:content-[" "] after:h-[48px] after:w-[48px] after:bg-danger-light after:absolute after:opacity-20 after:rounded-full' : ''}`}
              >
                <HomeIcon />
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className={`relative flex justify-center items-center ${path === '/dashboard' ? 'after:content-[" "] after:h-[48px] after:w-[48px] after:bg-danger-light after:absolute after:opacity-20 after:rounded-full' : ''}`}
              >
                <DashboardIcon />
              </Link>
            </li>
            <li className="h-[21px] after:h-[48px] relative">
              <button
                type="button"
                onClick={handleViewNotifications}
              >
                <NotificationIcon hasNotification />
              </button>
              <NotificaitonMenu />
            </li>
            <li className="h-[48px]">
              <button onClick={handleShowUserProfile}>
                <UserIcon />
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </section>
  )
}
