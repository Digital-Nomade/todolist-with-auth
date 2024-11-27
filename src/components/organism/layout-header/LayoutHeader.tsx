import {
  AddIcon,
  HomeIcon,
  NotificationIcon,
  SearchIcon,
  UserIcon
} from "@/components/icons";
import Link from "next/link";

interface Props {
  path: string
}

export function LayoutHeader({ path }: Props) {

  function handleAddToDo() {
    // TODO: Add redux function
  }

  function handleViewNotifications() {
    // TODO: Add function to show notifications
  }

  function handleShowUserProfile() {
    // TODO: Add function to show notifications
  }

  console.log('===> ' + path)

  return (
    <section className="max-w-[1284px] mx-auto">
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
          <h1 className="text-6xl font-thin text-white">Welcome Bruno</h1>
          <button className="h-fit" onClick={handleAddToDo}>
            <AddIcon />
          </button>
        </div>
        <nav>
          <ul className="flex gap-12 items-end">
            <li className="flex-1">
              <Link href="#">
                <HomeIcon />
              </Link>
            </li>
            <li className="h-[21px]">
              <button onClick={handleViewNotifications}>
                <NotificationIcon hasNotification />
              </button>
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
