interface Props {
  description?: string;
  title?: string;
}

export function TodoEmptyState({
  title = "No todos yet",
  description = "Tap the + button above to create your first todo and start getting things done.",
}: Props) {
  return (
    <section
      aria-labelledby="todo-empty-state-title"
      className="mx-auto flex w-full max-w-[684px] flex-1 flex-col items-center justify-center py-16 text-center text-white"
    >
      <h2
        id="todo-empty-state-title"
        className="mb-4 text-4xl font-extralight"
      >
        {title}
      </h2>
      <p className="max-w-md text-lg font-extralight text-white/80">
        {description}
      </p>
    </section>
  );
}
