import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

// HOC untuk otentikasi dan pengecekan role OWNER
export function requireOwnerRole(Component: React.ComponentType) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function WrappedComponent(props: any) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/auth/login");
      } else if (status === "authenticated" && session?.user.role !== "OWNER") {
        router.push("/");
      }
    }, [status, session, router]);

    if (status === "loading") {
      return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    if (!session || session.user.role !== "OWNER") {
      return null;
    }

    return <Component {...props} />;
  };
}