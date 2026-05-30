"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {ExternalLink, CheckCircle, XCircle} from "lucide-react";

interface Application {
	_id: string;
	borrowerId: {
		name: string;
		email: string;
	};
	amount: number;
	tenure: number;
	monthlySalary: number;
	employmentMode: string;
	salarySlipUrl: string;
	status: string;
}

export default function SanctionDashboard() {
	const router = useRouter();
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const role = localStorage.getItem("role");
		if (role !== "Sanction" && role !== "Admin") {
			router.push("/sales");
			return;
		}

		const fetchApplications = async () => {
			try {
				const response = await api.get("/loans/dashboard");
				const actionableLoans = (response.data.data || []).filter((app: Application) => app.status === "Applied");
				setApplications(actionableLoans);
			} catch (error: any) {
				toast.error(error.response?.data?.message || "Failed to fetch applications");
			} finally {
				setLoading(false);
			}
		};

		fetchApplications();
	}, [router]);

	const handleStatusUpdate = async (id: string, newStatus: string) => {
		try {
			await api.patch(`/loans/${id}/status`, {status: newStatus});
			toast.success(`Loan application ${newStatus.toLowerCase()} successfully`);
			// Remove the processed application from the local state
			setApplications((prev) => prev.filter((app) => app._id !== id));
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update status");
		}
	};

	return (
		<Card className="shadow-sm border-slate-200">
			<CardHeader className="bg-white border-b pb-4">
				<CardTitle className="text-2xl">Sanction Queue</CardTitle>
				<CardDescription>Review applied loans, verify salary slips, and make approval decisions.</CardDescription>
			</CardHeader>
			<CardContent className="pt-6 bg-slate-50/50">
				{loading ? (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				) : applications.length === 0 ? (
					<div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-white">
						No applications pending review. The queue is clear.
					</div>
				) : (
					<div className="border rounded-md bg-white overflow-hidden shadow-sm">
						<Table>
							<TableHeader className="bg-slate-50">
								<TableRow>
									<TableHead className="font-semibold text-slate-700">Applicant</TableHead>
									<TableHead className="font-semibold text-slate-700">Financials</TableHead>
									<TableHead className="font-semibold text-slate-700">Document</TableHead>
									<TableHead className="font-semibold text-slate-700">Status</TableHead>
									<TableHead className="text-right font-semibold text-slate-700">Decision</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{applications.map((app) => (
									<TableRow key={app._id} className="hover:bg-slate-50/80 transition-colors">
										<TableCell>
											<div className="font-medium text-slate-900">{app.borrowerId?.name || "Unknown"}</div>
											<div className="text-xs text-slate-500">{app.borrowerId?.email || "N/A"}</div>
											<div className="text-xs text-slate-500 mt-1">{app.employmentMode}</div>
										</TableCell>
										<TableCell>
											<div className="font-medium text-blue-700">Req: ₹{app.amount.toLocaleString()}</div>
											<div className="text-sm text-slate-600">Tenure: {app.tenure} Days</div>
											<div className="text-xs text-slate-500 mt-1">Salary: ₹{app.monthlySalary.toLocaleString()}</div>
										</TableCell>
										<TableCell>
											{app.salarySlipUrl ? (
												<a
													href={app.salarySlipUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline">
													<ExternalLink className="w-4 h-4 mr-1" />
													View Slip
												</a>
											) : (
												<span className="text-sm text-slate-400">No Document</span>
											)}
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
												{app.status}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end space-x-2">
												<Button
													variant="outline"
													size="sm"
													className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
													onClick={() => handleStatusUpdate(app._id, "Rejected")}>
													<XCircle className="w-4 h-4 mr-1" />
													Reject
												</Button>
												<Button
													size="sm"
													className="bg-green-600 hover:bg-green-700 text-white"
													onClick={() => handleStatusUpdate(app._id, "Sanctioned")}>
													<CheckCircle className="w-4 h-4 mr-1" />
													Sanction
												</Button>
											</div>
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
