import Link from "next/link";

export default function Home() {
  return (
    <main
      className=" h-[100%] w-full p-8 max-w-[1200px] mx-auto"
    >
      <div className="flex flex-1 justify-between mb-20">
        <section>
          <h1 className="font-light text-8xl text-white">You Do!</h1>
          <h2 className="font-extralight text-6xl text-white ml-[60%] text-nowrap">much more</h2>
        </section>
        <header >
          <nav>
            <ul className="flex flex-1 gap-6 text-white underline font-extralight ">
              <li>
                <Link href="signup" className="w-fit text-nowrap">Sign Up</Link>
              </li>
              <li>
                <Link href="login">Login</Link>
              </li>
            </ul>
          </nav>
        </header>
      </div>
      <section className="flex justify-between text-white font-extralight h-full max-h-[600px] w-full gap-12">
        <article className="p-4 flex-1">
          <p className="mb-4 text-xl">Tired of losing track of all your tasks and activities?</p>
          <p className="text-xl">
              Here you&apos;ll have a chance to experience a nice and user friendly way to check your 
upcoming events and tasks.
          </p>
        </article>
        <article className={`bg-[url('/images/dots.svg')] p-4 h-full flex flex-col flex-1 `}>
          <p className="mb-8 text-xl">Don&apos;t forget your to-do&apos;s anymore.</p>
          <p className="mb-8 text-xl">With <strong className="font-bold">You Do!</strong> you much more, never forget what your wife asked you to buy at the grocery store. </p>
          <p className="mb-8 text-xl">Never forget the beer and steak your husband ask.</p>
          <p className="mb-8 text-xl">Be more productive with <strong className=" font-bold">You Do!</strong></p>
        </article>
      </section>
    </main>
  );
}
