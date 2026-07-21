import {
  DashboardIcon,
  HomeIcon,
  NotificationIcon,
  SearchIcon,
  UserIcon
} from "@/components/icons";
import { checkIfHasNotification } from "@/lib/features/notifications/notificationsSlice";
import { useLogoutMutation } from "@/lib/features/auth/authApi";
import { setToggleAddTodoModal } from "@/lib/features/todos/todoSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { NotificaitonMenu } from "../notification-menu/NotificationMenu";
import { AddTodoButton } from "./AddTodoButton";

export function LayoutHeader() {
  const dispatch = useAppDispatch()
  const path = usePathname()
  const router = useRouter()
  const user = useAppSelector(state => state.auth.user)
  const { hasNotifications, notifications } = useAppSelector(state => state.notification)
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()

  const [searchTerm, setSearchTerm] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (notifications) {
      dispatch(checkIfHasNotification())
    }
  }, [dispatch, notifications])

  function handleAddToDo() {
    dispatch(setToggleAddTodoModal())
  }

  function handleViewNotifications() {
    // TODO: Add function to show notifications
    setShowNotifications(state => !state)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = searchTerm.trim()
    router.replace(term ? `/dashboard?search=${encodeURIComponent(term)}` : "/dashboard")
  }

  async function handleLogout() {
    try {
      await logout().unwrap()
    } finally {
      router.replace("/login")
    }
  }

  return (
    <section className="max-w-[1284px] mx-auto w-full">
      <header className="flex justify-between w-full pt-8 px-8 h-fit flex-1 mb-14">
        <div className="flex gap-8 items-center w-full">
          {path !== "/home" && (
            <form
              className="relative max-w-[300px] w-full"
              onSubmit={handleSearch}
              role="search"
            >
              <input
                aria-label="Search todos"
                className="bg-transparent border border-danger-light rounded-lg p-2 placeholder:text-danger-light w-full"
                onChange={event => setSearchTerm(event.target.value)}
                type="text"
                placeholder="search to do"
                value={searchTerm}
              />
              <button
                aria-label="Submit todo search"
                className="absolute right-2 top-3"
                type="submit"
              >
                <SearchIcon />
              </button>
            </form>
          )}
          <div className="flex items-center gap-8">
            <h1 className="text-6xl font-thin text-white">
              {path === "/home" ? `Welcome ${user?.username}` : "New todo"}
            </h1>
            <AddTodoButton onClick={handleAddToDo} />
          </div>
        </div>
        <nav>
          <ul className="flex gap-12 items-end">
            <li className="flex-1 ">
              <Link
                href="/home"
                className={`relative flex justify-center items-center ${path === "/home" ? 'after:content-[" "] after:h-[48px] after:w-[48px] after:bg-danger-light after:absolute after:opacity-20 after:rounded-full' : ""}`}
              >
                <HomeIcon />
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className={`relative flex justify-center items-center ${path === "/dashboard" ? 'after:content-[" "] after:h-[48px] after:w-[48px] after:bg-danger-light after:absolute after:opacity-20 after:rounded-full' : ""}`}
              >
                <DashboardIcon />
              </Link>
            </li>
            <li className="h-[21px] after:h-[48px] relative">
              <button
                aria-label="View notifications"
                type="button"
                onClick={handleViewNotifications}
              >
                <NotificationIcon hasNotification={hasNotifications} />
              </button>
              {showNotifications && <NotificaitonMenu />}
            </li>
            <li className="h-[48px]">
              <Link href="/profile" aria-label="Profile">
                <UserIcon />
              </Link>
            </li>
            <li>
              <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="text-danger-light underline">
                {isLoggingOut ? "Signing out…" : "Logout"}
              </button>
            </li>
          </ul>
        </nav>
      </header>
    </section>
  )
}
