"use client";

import {useEffect, useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
	const router = useRouter();
	const pathname = usePathname();
	const [userName, setUserName] = useState("");
	const [role, setRole] = useState("");

	useEffect(() => {
		const authenticate = async () => {
			const token = localStorage.getItem("token");
			const userRole = localStorage.getItem("role");

			if (!token || userRole === "Borrower") {
				router.push("/login");
				return;
			}

			setUserName(localStorage.getItem("userName") || "Executive");
			setRole(userRole || "");
		};

		authenticate();
	}, [router]);

	const handleLogout = () => {
		localStorage.clear();
		router.push("/login");
	};

	const navLinks = [
		{href: "/sales", label: "Sales", roles: ["Sales", "Admin"]},
		{href: "/sanction", label: "Sanction", roles: ["Sanction", "Admin"]},
		{href: "/disbursement", label: "Disbursement", roles: ["Disbursement", "Admin"]},
		{href: "/collection", label: "Collection", roles: ["Collection", "Admin"]},
	];

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col">
			<header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
				<div className="flex items-center space-x-8">
					<h1 className="text-xl font-extrabold text-blue-900 tracking-tight">
						LMS <span className="text-slate-400 font-normal">|</span> Portal
					</h1>
					<nav className="hidden md:flex space-x-1">
						{navLinks.map((link) => {
							if (!link.roles.includes(role)) return null;
							const isActive = pathname.startsWith(link.href);
							return (
								<Link key={link.href} href={link.href}>
									<span
										className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
											isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
										}`}>
										{link.label}
									</span>
								</Link>
							);
						})}
					</nav>
				</div>
				<div className="flex items-center space-x-4">
					<div className="flex flex-col text-right">
						<span className="text-sm font-bold text-slate-800">{userName}</span>
						<span className="text-xs text-slate-500">{role}</span>
					</div>
					<Button variant="outline" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</header>
			<main className="flex-1 max-w-7xl w-full mx-auto p-6">{children}</main>
		</div>
	);
}
