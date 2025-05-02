import clsx from "clsx"
import Link from "next/link"
import { useRouter } from 'next/router';
import { signOut } from "next-auth/react"
export default function SideBar () {
    const router = useRouter();
  
  return (
    <aside className="w-64 bg-orange-500 text-white p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Owner Panel</h2>
      <nav className="space-y-2">
        <Link
          href="/owner/dashboard"
          className={clsx(
            'block px-4 py-2 rounded hover:bg-orange-700 transition',
            router.pathname === '/owner/dashboard' && 'bg-orange-700'
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/owner/kelola-venue"
          className={clsx(
            'block px-4 py-2 rounded hover:bg-orange-700 transition',
            router.pathname === '/owner/kelola-venue' && 'bg-orange-700'
          )}
        >
          Kelola Venue
        </Link>
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-10 bg-red-500 hover:bg-red-600 w-full px-4 py-2 rounded"
        >
        Keluar
      </button>
    </aside>
  )
}