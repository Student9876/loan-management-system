"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

export default function RegisterPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "Borrower",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({...formData, [e.target.name]: e.target.value});
	};

	const handleRoleChange = (value: string | null) => {
		if (value) {
			setFormData({...formData, role: value});
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await api.post("/auth/register", formData);
			router.push("/login");
		} catch (err) {
			const error = err as {response?: {data?: {message?: string}}};
			setError(error.response?.data?.message || "Failed to register.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
					<CardDescription className="text-center">Enter your information to get started</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleRegister} className="space-y-4">
						{error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">{error}</div>}

						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input id="name" name="name" required value={formData.name} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" name="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="role">Role</Label>
							<Select onValueChange={handleRoleChange} defaultValue={formData.role}>
								<SelectTrigger>
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Borrower">Borrower</SelectItem>
									<SelectItem value="Sales">Sales Executive</SelectItem>
									<SelectItem value="Sanction">Sanction Executive</SelectItem>
									<SelectItem value="Disbursement">Disbursement Executive</SelectItem>
									<SelectItem value="Collection">Collection Executive</SelectItem>
									<SelectItem value="Admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Creating account..." : "Sign up"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center">
					<div className="text-sm text-slate-500">
						Already have an account?{" "}
						<Link href="/login" className="text-blue-600 hover:underline">
							Sign in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
