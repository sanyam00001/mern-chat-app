import { APP_NAME } from '../utils/constants'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 py-8">
      <div className="container-app flex flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
        <p>
          &copy; {year} {APP_NAME}. All rights reserved.
        </p>
        <p>Built with React, Vite, and Tailwind CSS.</p>
      </div>
    </footer>
  )
}

export default Footer
