"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";

import {useQueryClient} from "@tanstack/react-query";

export default function LoginPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await api.post("/auth/login", {email, password});
			const {token, user} = response.data;

			localStorage.setItem("token", token);
			localStorage.setItem("role", user.role);
			localStorage.setItem("userName", user.name);

			// Clear the cache to prevent stale data from showing on redirect
			queryClient.clear();

			switch (user.role) {
				case "Borrower":
					router.push("/apply");
					break;
				case "Sales":
				case "Admin":
					router.push("/sales");
					break;
				case "Sanction":
					router.push("/sanction");
					break;
				case "Disbursement":
					router.push("/disbursement");
					break;
				case "Collection":
					router.push("/collection");
					break;
				default:
					setError("Unknown role assignment.");
			}
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to login.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
					<CardDescription className="text-center">Enter your email and password to access your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						{error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">{error}</div>}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Signing in..." : "Sign in"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<div className="text-sm text-slate-500">
						Don&apos;t have an account?{" "}
						<Link href="/register" className="text-blue-600 hover:underline">
							Sign up
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
