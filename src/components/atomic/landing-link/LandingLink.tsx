import Link from "next/link";

export function LandingLink() {
  return (
    <Link className="mb-4 w-fit" href={'/'}>
      <h1 className=" font-semibold text-6xl text-danger-light">You Do!</h1>
      <p className=" text-lg text-danger-light">Much More</p>
    </Link>
  )
}