interface Props {
  reminderOn?: Date | undefined | null
}

export function SectionReminderOn({ reminderOn }: Props) {
  if (!reminderOn) {
    return null
  }

  return (
    reminderOn 
    && (
      <p className="text-white font-extralight">
        Reminder on: <strong>{new Date(reminderOn).toDateString()}</strong>
      </p>
    )
  )
}
