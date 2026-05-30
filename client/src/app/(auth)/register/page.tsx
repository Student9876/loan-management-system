"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function RegisterPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "Borrower", // Default to Borrower for normal flow
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setFormData({...formData, [e.target.name]: e.target.value});
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await api.post("/auth/register", formData);
			router.push("/login");
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to register.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleRegister}>
					{error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
					<div className="rounded-md shadow-sm space-y-4">
						<div>
							<label htmlFor="name" className="sr-only">
								Full Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Full Name"
								value={formData.name}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label htmlFor="email-address" className="sr-only">
								Email address
							</label>
							<input
								id="email-address"
								name="email"
								type="email"
								required
								className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Email address"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label htmlFor="role" className="sr-only">
								Role
							</label>
							<select
								id="role"
								name="role"
								className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
								value={formData.role}
								onChange={handleChange}>
								<option value="Borrower">Borrower</option>
								<option value="Sales">Sales Executive</option>
								<option value="Sanction">Sanction Executive</option>
								<option value="Disbursement">Disbursement Executive</option>
								<option value="Collection">Collection Executive</option>
								<option value="Admin">Admin</option>
							</select>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400">
							{loading ? "Creating account..." : "Sign up"}
						</button>
					</div>
				</form>
				<div className="text-center text-sm">
					<span className="text-gray-600">Already have an account? </span>
					<Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
						Sign in
					</Link>
				</div>
			</div>
		</div>
	);
}
