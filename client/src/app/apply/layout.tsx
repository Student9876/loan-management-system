"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

import {useQueryClient} from "@tanstack/react-query";

export default function ApplyLayout({children}: {children: React.ReactNode}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [userName, setUserName] = useState("");

	useEffect(() => {
		const authenticate = async () => {
			const token = localStorage.getItem("token");

			if (!token) {
				router.push("/login");
				return;
			}

			setUserName(localStorage.getItem("userName") || "Borrower");
		};

		authenticate();
	}, [router]);

	const handleLogout = () => {
		localStorage.clear();
		queryClient.clear();
		router.push("/login");
	};

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col">
			<header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
				<div className="flex items-center space-x-8">
					<h1 className="text-xl font-extrabold text-blue-900 tracking-tight">
						LMS <span className="text-slate-400 font-normal">|</span> Borrower Portal
					</h1>
				</div>
				<div className="flex items-center space-x-4">
					<div className="flex flex-col text-right">
						<span className="text-sm font-bold text-slate-800">{userName}</span>
						<span className="text-xs text-slate-500">Borrower</span>
					</div>
					<Button variant="outline" size="sm" onClick={handleLogout}>
						Logout
					</Button>
				</div>
			</header>
			<main className="flex-1 w-full">{children}</main>
		</div>
	);
}
