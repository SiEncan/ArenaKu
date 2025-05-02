import SideBar from '@/components/layouts/sidebar';
import { useSession, getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { requireOwnerRole } from "@/lib/requireOwnerRole";

function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SideBar />
      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <div className="bg-white text-black shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Selamat datang, {session?.user.name || session?.user.email}!</h2>
          <p>Role: {session?.user.role}</p>
          <p>ID: {session?.user.name}</p>
          <p>Email: {session?.user.email}</p>
        </div>
      </main>
    </div>
  );
}


export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session || session.user.role !== 'OWNER') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default requireOwnerRole(Dashboard);