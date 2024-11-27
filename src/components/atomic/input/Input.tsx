import { EyeIcon } from "@/components/icons/";
import { ForwardedRef, forwardRef, InputHTMLAttributes, useState } from "react";


interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  htmlFor: string;
  errorMessage?: string | undefined;
}

const Input = forwardRef(({ errorMessage, label, htmlFor, type, className, ...props}: Props, ref: ForwardedRef<HTMLInputElement>) => {
  const [displayPassword, setDisplayPassword] = useState(false)

  function togglePasswordType() {
    if(type === 'password' && !displayPassword) {
      return 'password'
    } else if (type === 'password' && displayPassword) {
      return 'text'
    } else {
      return type
    }
  }

  return (
    <div className={`relative z-0 ${className}`}>
      <input
        ref={ref}
        type={togglePasswordType()}
        id={htmlFor}
        className="block pl-2 py-2.5 px-0 w-full text-lg text-danger-light bg-transparent border-0 border-b-2 border-danger-light appearance-none dark:text-danger-light dark:border-danger-light dark:focus:border-danger-light focus:outline-none focus:ring-0 focus:border-danger-light peer"
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={htmlFor}
        className="font-extralight absolute text-2xl text-danger-light dark:text-danger-light duration-300 transform -translate-y-8 -translate-x-[-8px] scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-danger-light peer-focus:dark:text-danger-light peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
      >
        {label}
      </label>
      {
        type === 'password' && 
        <button
          type="button"
          className="absolute right-1 top-4 z-10"
          onClick={() => setDisplayPassword(state => !state)}
        >
          <EyeIcon />
        </button>
      }
      {errorMessage && (
        <div className="w-full absolute">
          <p className="text-danger font-light ">{errorMessage}</p>
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input };
