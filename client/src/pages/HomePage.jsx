import { Link } from 'react-router-dom'
import { ROUTES } from '../utils/constants'

const features = [
  {
    title: 'Real-time messaging',
    description:
      'Send and receive messages instantly with a modern chat experience.',
  },
  {
    title: 'Secure authentication',
    description:
      'User accounts protected with industry-standard security practices.',
  },
  {
    title: 'Responsive design',
    description:
      'A polished interface that works seamlessly on desktop and mobile.',
  },
]

function HomePage() {
  return (
    <div className="container-app py-12 sm:py-16 lg:py-20">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-flex rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1 text-sm font-medium text-primary-300">
          MERN Stack Chat Application
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Connect and chat in{' '}
          <span className="bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
            real time
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          A production-ready foundation for a full-stack messaging app. The
          frontend is set up with routing, API services, and a scalable folder
          structure — ready for the next build steps.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-500 sm:w-auto"
          >
            Get Started
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-primary-500/30 hover:bg-white/[0.05]"
          >
            <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {feature.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default HomePage
