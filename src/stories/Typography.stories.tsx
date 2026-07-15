import type { Meta, StoryObj } from "@storybook/react";

const typeScale = [
  {
    name: "Display / Brand",
    className: "text-6xl font-semibold text-danger-light",
    sample: "You Do!",
    usage: "Landing brand, welcome headers",
  },
  {
    name: "Hero",
    className: "text-8xl font-light text-danger-light",
    sample: "Much More",
    usage: "Marketing hero copy on the landing page",
  },
  {
    name: "Page Title",
    className: "text-4xl font-bold text-danger-light",
    sample: "Create account",
    usage: "Auth forms and primary page headings",
  },
  {
    name: "Section Title",
    className: "text-4xl font-extralight text-white",
    sample: "Plan sprint backlog",
    usage: "Todo detail titles and section headers",
  },
  {
    name: "Button Label",
    className: "font-light text-2xl text-primary-dark",
    sample: "login",
    usage: "Primary actions inside filled buttons",
  },
  {
    name: "Input Label",
    className: "font-extralight text-2xl text-danger-light",
    sample: "email",
    usage: "Floating labels in form inputs",
  },
  {
    name: "Body",
    className: "text-2xl font-extralight text-white",
    sample: "Review priorities with the team.",
    usage: "Todo descriptions and long-form copy",
  },
  {
    name: "Supporting",
    className: "text-lg font-extralight text-danger-light",
    sample: "Already registered? Login",
    usage: "Helper text and secondary navigation",
  },
  {
    name: "List Item",
    className: "text-white font-light",
    sample: "Write release notes",
    usage: "Todo list rows and compact navigation",
  },
  {
    name: "Error",
    className: "text-danger font-light",
    sample: "Email is required",
    usage: "Validation and inline form errors",
  },
];

const colorTokens = [
  { name: "primary-dark", className: "bg-primary-dark text-white", hex: "#0E003A" },
  { name: "secondary", className: "bg-secondary text-primary-dark", hex: "#BF0066" },
  { name: "danger", className: "bg-danger text-white", hex: "#F3434F" },
  { name: "danger-light", className: "bg-danger-light text-primary-dark", hex: "#EEB0B4" },
  { name: "success", className: "bg-success text-primary-dark", hex: "#7DE300" },
  { name: "alert", className: "bg-alert text-primary-dark", hex: "#DBE300" },
  { name: "info", className: "bg-info text-primary-dark", hex: "#28DDFD" },
];

const meta = {
  title: "Design System/Typography",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScale: Story = {
  render: () => (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-danger-light">Typography Playbook</h1>
        <p className="text-lg font-extralight text-white">
          Roboto is loaded globally through <code className="text-danger-light">globals.css</code>.
          Use the classes below instead of inventing new sizes or weights.
        </p>
      </header>
      <div className="space-y-6">
        {typeScale.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-danger-light/30 bg-primary-dark-transparency p-6"
          >
            <p className="mb-2 text-sm font-light text-danger-light">{item.name}</p>
            <p className={item.className}>{item.sample}</p>
            <p className="mt-3 font-mono text-sm text-white/80">{item.className}</p>
            <p className="mt-1 text-sm font-extralight text-white/70">{item.usage}</p>
          </article>
        ))}
      </div>
    </div>
  ),
};

export const ColorTokens: Story = {
  render: () => (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
      {colorTokens.map((token) => (
        <div
          key={token.name}
          className={`rounded-2xl p-6 ${token.className}`}
        >
          <p className="text-2xl font-light">{token.name}</p>
          <p className="font-mono text-sm">{token.hex}</p>
        </div>
      ))}
    </div>
  ),
};

export const OnGradientSurface: Story = {
  render: () => (
    <section className="mx-auto max-w-3xl rounded-3xl border border-danger-light/40 p-10">
      <LandingPreview />
      <h2 className="mt-8 text-4xl font-bold text-danger-light">Login</h2>
      <p className="mt-4 text-lg font-extralight text-danger-light">
        Don&apos;t have an account? Create account
      </p>
      <h3 className="mt-10 text-4xl font-extralight text-white">Plan sprint backlog</h3>
      <p className="mt-2 text-white font-extralight">
        Reminder on: <strong>Mon Jul 20 2026</strong>
      </p>
      <p className="mt-6 text-2xl font-extralight text-white">
        Review priorities with the team.
      </p>
      <p className="mt-4 text-danger font-light">Email is required</p>
    </section>
  ),
};

function LandingPreview() {
  return (
    <div>
      <h1 className="font-semibold text-6xl text-danger-light">You Do!</h1>
      <p className="text-lg text-danger-light">Much More</p>
    </div>
  );
}
