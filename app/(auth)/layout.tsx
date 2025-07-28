//common auth layout

import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
    const isUserAuthenticated = await isAuthenticated();

    // If the user is authenticated, redirect them to the home page, else to the signin page
    if (isUserAuthenticated) redirect("/");

    return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;