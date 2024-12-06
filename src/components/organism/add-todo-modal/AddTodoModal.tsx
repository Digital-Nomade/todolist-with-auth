import { Button, FormGroup, Input } from '@/components/atomic'
import { useAddNewTodoMutation } from '@/lib/features/todos/todoApi'
import { useAppSelector } from '@/lib/hooks'
import { DatePicker } from '@nextui-org/react'
import { isBefore } from 'date-fns'
import { motion, useAnimate } from 'framer-motion'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface Inputs {
  title: string
  description: string
  dueTo: Date,
  reminderOn: Date,
}

interface Props {
  isOpen: boolean
  handleToggleModal: () => void
}

export function AddTodoModal({ handleToggleModal, isOpen }: Props) {
  const {
    watch,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: {
      errors
    }
  } = useForm<Inputs>()
  const { toggleAddTodoModal } = useAppSelector(state => state.todo)
  const [createTodo, { }] = useAddNewTodoMutation()
  const [scope, animate] = useAnimate()
  const [scopeWrapper, animateWrapper] = useAnimate()

  useEffect(() => {
    function escKeyListener(event: any) {
      if (event.key === 'Escape' && toggleAddTodoModal) {
        handleCloseModal()
      }
    }

    window.addEventListener('keydown', escKeyListener)

    return () => {
      window.removeEventListener('keydown', escKeyListener)
    }
  }, [toggleAddTodoModal])

  if (!isOpen) return null

  async function handleCloseModal() {
    await animate(
      scope.current,
      {
        translateX: -1330,
      },
      {
        ease: 'linear',
        type: 'spring',
        duration: .3
      }
    )
    await animateWrapper(
      scopeWrapper.current,
      {
        opacity: 0,
      },
      {
        duration: .3
      }
    ) 
    handleToggleModal()
  }

  async function onSubmit(data: Inputs) {
    try {
      const response = await createTodo(data)
      handleCloseModal()
      reset()
    } catch (error: any) {
      console.error(error)
    }
  }

  return (
    <motion.div
      ref={scopeWrapper}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: .3,
        ease: 'linear',
      }}
      className="top-0 left-0 absolute h-[100%] w-full flex justify-center items-center bg-[#00000099]"
      onAnimationComplete={() => {
        if (isOpen) {
          animate(
            scope.current,
            {
              initial: {
                translateX: -1330,
              },
              animate: {
                translateX: 0
              },
              exit: {
                translateX: -1330
              }
            },
            {
              ease: 'linear', 
              duration: .3,
              type: 'spring'
            },
          )
        } else {
          handleCloseModal()
        }
      }}
    >
      <motion.form
        initial={{
          translateX: -1330,
        }}
        animate={{
          translateX: 0,
        }}
        exit={{
          translateX: 0,
        }}
        transition={{
          duration: .3,
          type: 'spring',
          ease: 'linear',
          delay: .2,
        }}
        ref={scope}
        className="h-2/3 w-1/2 bg-primary-dark p-8 rounded-lg flex flex-col mx-auto translate-x-[-1330]"
      >
        <FormGroup>
          <Input
            htmlFor='title'
            label='New Todo'
            {...register('title', { required: true })}
            errorMessage={errors['title']?.message}
          />
        </FormGroup>
        <FormGroup>
          <label
            className="
              text-danger-light
              font-extralight
              mb-4
            "
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            className="
              outline-danger-light
              border-b-danger-light
              text-danger-light
              bg-transparent
              w-full
              resize-none
              border-b
              h-[200px]
              p-2
            "
            {...register('description')}
            name="description"
            onChange={(event) => setValue('description', event.currentTarget.value)}
            value={watch('description')}
          />
        </FormGroup>
        <div className='flex justify-between items-center w-full danger'>
          <div>
            <DatePicker
              label="Due To" 
              dateInputClassNames={{
                inputWrapper: "bg-secondary hover:text-danger-light",
                label: "text-danger-light",
                input: "text-danger-light",
                segment: "text-danger-light hover:text-danger-light",
                innerWrapper: "text-danger-light",
              }}
              { ...register('dueTo')}
              onChange={(value) => setValue('dueTo', value.toDate('America'))}

            />
          </div>
          <div>
            <DatePicker
              label="Reminder On"
              dateInputClassNames={{
                inputWrapper: "bg-secondary hover:text-secondary",
                label: "text-danger-light",
                input: "text-danger-light",
                segment: "text-danger-light",
                innerWrapper: "text-danger-light hover:text-secondary",
              }}
              isDateUnavailable={(date) => {
                return isBefore(date.toString(), new Date())
              }}
              { ...register('reminderOn')}
              onChange={(value) => setValue('reminderOn', value.toDate('America'))}
            />
          </div>
        </div>
        <div className='flex justify-between w-full gap-16 mt-auto'>
          <Button
            variant='outlined'
            buttonType='danger'
            onClick={handleCloseModal}
            type='button'
          >
            Cancel
          </Button>
          <Button
            variant='outlined'
            buttonType='success'
            type='button'
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </Button>
        </div>
      </motion.form>
    </motion.div>
  )
}
