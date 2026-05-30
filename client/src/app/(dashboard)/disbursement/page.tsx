"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {Banknote, CheckCircle2} from "lucide-react";

interface Application {
	_id: string;
	borrowerId: {
		name: string;
		email: string;
	};
	amount: number;
	totalRepayment: number;
	tenure: number;
	status: string;
}

export default function DisbursementDashboard() {
	const router = useRouter();
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const role = localStorage.getItem("role");
		if (role !== "Disbursement" && role !== "Admin") {
			router.push("/sales");
			return;
		}

		const fetchApplications = async () => {
			try {
				const response = await api.get("/loans/dashboard");
				// Force filter on the frontend to ensure we only see actionable items for this stage
				const actionableLoans = (response.data.data || []).filter((app: Application) => app.status === "Sanctioned");
				setApplications(actionableLoans);
			} catch (error: any) {
				toast.error(error.response?.data?.message || "Failed to fetch applications");
			} finally {
				setLoading(false);
			}
		};

		fetchApplications();
	}, [router]);

	const handleDisbursement = async (id: string) => {
		try {
			await api.patch(`/loans/${id}/status`, {status: "Disbursed"});
			toast.success("Funds disbursed successfully. Loan is now active.");
			setApplications((prev) => prev.filter((app) => app._id !== id));
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to disburse funds");
		}
	};

	return (
		<Card className="shadow-sm border-slate-200">
			<CardHeader className="bg-white border-b pb-4">
				<CardTitle className="text-2xl">Disbursement Queue</CardTitle>
				<CardDescription>Review sanctioned loans and execute final fund transfers to borrowers.</CardDescription>
			</CardHeader>
			<CardContent className="pt-6 bg-slate-50/50">
				{loading ? (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				) : applications.length === 0 ? (
					<div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-white">
						No approved applications pending disbursement.
					</div>
				) : (
					<div className="border rounded-md bg-white overflow-hidden shadow-sm">
						<Table>
							<TableHeader className="bg-slate-50">
								<TableRow>
									<TableHead className="font-semibold text-slate-700">Applicant</TableHead>
									<TableHead className="font-semibold text-slate-700">Payout Amount</TableHead>
									<TableHead className="font-semibold text-slate-700">Expected Recovery</TableHead>
									<TableHead className="font-semibold text-slate-700">Status</TableHead>
									<TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{applications.map((app) => (
									<TableRow key={app._id} className="hover:bg-slate-50/80 transition-colors">
										<TableCell>
											<div className="font-medium text-slate-900">{app.borrowerId?.name || "Unknown"}</div>
											<div className="text-xs text-slate-500">{app.borrowerId?.email || "N/A"}</div>
										</TableCell>
										<TableCell>
											<div className="font-bold text-green-700 text-lg">₹{app.amount.toLocaleString()}</div>
											<div className="text-xs text-slate-500">To Borrower Account</div>
										</TableCell>
										<TableCell>
											<div className="font-medium text-blue-700">₹{app.totalRepayment.toLocaleString()}</div>
											<div className="text-xs text-slate-500">Over {app.tenure} Days</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
												{app.status}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Button
												size="sm"
												className="bg-slate-900 hover:bg-slate-800 text-white"
												onClick={() => handleDisbursement(app._id)}>
												<Banknote className="w-4 h-4 mr-2" />
												Disburse Funds
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
