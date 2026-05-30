"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {CheckCircle, ShieldAlert} from "lucide-react";

interface Application {
	_id: string;
	borrowerId: {
		name: string;
		email: string;
	};
	totalRepayment: number;
	outstandingBalance: number;
	tenure: number;
	status: string;
	createdAt: string;
}

export default function CollectionDashboard() {
	const router = useRouter();
	const [loans, setLoans] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const role = localStorage.getItem("role");
		if (role !== "Collection" && role !== "Admin") {
			router.push("/sales");
			return;
		}

		const fetchLoans = async () => {
			try {
				const response = await api.get("/loans/dashboard");
				// Filter for active disbursed loans
				const activeLoans = (response.data.data || []).filter((app: Application) => app.status === "Disbursed");
				setLoans(activeLoans);
			} catch (err) {
				const error = err as {response?: {data?: {message?: string}}};
				toast.error(error.response?.data?.message || "Failed to fetch active loans");
			} finally {
				setLoading(false);
			}
		};

		fetchLoans();
	}, [router]);

	const handleSettlement = async (id: string) => {
		try {
			await api.patch(`/loans/${id}/status`, {status: "Closed"});
			toast.success("Loan settled and closed successfully.");
			setLoans((prev) => prev.filter((loan) => loan._id !== id));
		} catch (err) {
			const error = err as {response?: {data?: {message?: string}}};
			toast.error(error.response?.data?.message || "Failed to settle loan");
		}
	};

	return (
		<Card className="shadow-sm border-slate-200">
			<CardHeader className="bg-white border-b pb-4">
				<CardTitle className="text-2xl">Active Collections</CardTitle>
				<CardDescription>Monitor active disbursed loans and register final settlements.</CardDescription>
			</CardHeader>
			<CardContent className="pt-6 bg-slate-50/50">
				{loading ? (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				) : loans.length === 0 ? (
					<div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-white">
						No active loans pending collection.
					</div>
				) : (
					<div className="border rounded-md bg-white overflow-hidden shadow-sm">
						<Table>
							<TableHeader className="bg-slate-50">
								<TableRow>
									<TableHead className="font-semibold text-slate-700">Borrower</TableHead>
									<TableHead className="font-semibold text-slate-700">Total Due</TableHead>
									<TableHead className="font-semibold text-slate-700">Timeframe</TableHead>
									<TableHead className="font-semibold text-slate-700">Status</TableHead>
									<TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loans.map((loan) => (
									<TableRow key={loan._id} className="hover:bg-slate-50/80 transition-colors">
										<TableCell>
											<div className="font-medium text-slate-900">{loan.borrowerId?.name || "Unknown"}</div>
											<div className="text-xs text-slate-500">{loan.borrowerId?.email || "N/A"}</div>
										</TableCell>
										<TableCell>
											<div className="font-bold text-red-700 text-lg">₹{loan.outstandingBalance.toLocaleString()}</div>
											<div className="text-xs text-slate-500">of ₹{loan.totalRepayment.toLocaleString()}</div>
										</TableCell>
										<TableCell>
											<div className="font-medium text-slate-700">{loan.tenure} Days</div>
											<div className="text-xs text-slate-500">Since {new Date(loan.createdAt).toLocaleDateString()}</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
												{loan.status}
											</Badge>
										</TableCell>
										<TableCell className="text-right flex justify-end space-x-2">
											<Button
												variant="outline"
												size="sm"
												className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 border-amber-200"
												onClick={() => toast.info("Follow-up notification sent to borrower.")}>
												<ShieldAlert className="w-4 h-4 mr-1" />
												Remind
											</Button>
											<Button
												size="sm"
												className="bg-purple-600 hover:bg-purple-700 text-white"
												onClick={() => handleSettlement(loan._id)}>
												<CheckCircle className="w-4 h-4 mr-2" />
												Settle & Close
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
