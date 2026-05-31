"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {Banknote} from "lucide-react";

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
	const queryClient = useQueryClient();

	useEffect(() => {
		const role = localStorage.getItem("role");
		if (role !== "Disbursement" && role !== "Admin") {
			router.push("/sales");
		}
	}, [router]);

	// Declarative Fetching
	const {data: applications = [], isLoading} = useQuery({
		queryKey: ["disbursement-loans"],
		queryFn: async () => {
			const response = await api.get("/loans/dashboard");
			return (response.data.data || []).filter((app: Application) => app.status === "Sanctioned");
		},
	});

	// Declarative Mutation
	const disburseMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await api.patch(`/loans/${id}/status`, {status: "Disbursed"});
			return response.data;
		},
		onSuccess: () => {
			toast.success("Funds disbursed successfully. Loan is now active.");
			queryClient.invalidateQueries({queryKey: ["disbursement-loans"]});
		},
		onError: (err: {response?: {data?: {message?: string}}}) => {
			toast.error(err.response?.data?.message || "Failed to disburse funds");
		},
	});

	return (
		<Card className="shadow-sm border-slate-200">
			<CardHeader className="bg-white border-b pb-4">
				<CardTitle className="text-2xl">Disbursement Queue</CardTitle>
				<CardDescription>Review sanctioned loans and execute final fund transfers to borrowers.</CardDescription>
			</CardHeader>
			<CardContent className="pt-6 bg-slate-50/50">
				{isLoading ? (
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
								{applications.map((app: Application) => (
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
												disabled={disburseMutation.isPending}
												onClick={() => disburseMutation.mutate(app._id)}>
												<Banknote className="w-4 h-4 mr-2" />
												{disburseMutation.isPending && disburseMutation.variables === app._id ? "Processing..." : "Disburse Funds"}
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
