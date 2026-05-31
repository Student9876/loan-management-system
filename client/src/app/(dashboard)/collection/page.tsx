"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {ShieldAlert, IndianRupee, X} from "lucide-react";

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
	const queryClient = useQueryClient();

	// Payment Modal State
	const [activePaymentLoan, setActivePaymentLoan] = useState<Application | null>(null);
	const [utr, setUtr] = useState("");
	const [amount, setAmount] = useState<number | "">("");

	// RBAC Protection
	useEffect(() => {
		const role = localStorage.getItem("role");
		if (role !== "Collection" && role !== "Admin") {
			router.push("/sales");
		}
	}, [router]);

	// 1. Declarative Fetching via TanStack Query
	const {data: loans = [], isLoading} = useQuery({
		queryKey: ["collection-loans"],
		queryFn: async () => {
			const response = await api.get("/loans/dashboard");
			return (response.data.data || []).filter((app: Application) => app.status === "Disbursed");
		},
	});

	// 2. Declarative Mutation for Payments
	const paymentMutation = useMutation({
		mutationFn: async (paymentData: {id: string; utr: string; amount: number}) => {
			const response = await api.post(`/loans/${paymentData.id}/payments`, {
				utr: paymentData.utr,
				amount: paymentData.amount,
			});
			return response.data;
		},
		onSuccess: (data) => {
			toast.success(data.message || "Payment recorded successfully");

			// Invalidate the cache to trigger an automatic background refetch
			queryClient.invalidateQueries({queryKey: ["collection-loans"]});

			// Reset modal state
			setActivePaymentLoan(null);
			setUtr("");
			setAmount("");
		},
		onError: (err: {response?: {data?: {message?: string}}}) => {
			toast.error(err.response?.data?.message || "Failed to process payment");
		},
	});

	const handlePaymentSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!activePaymentLoan || !utr || !amount) return;

		paymentMutation.mutate({
			id: activePaymentLoan._id,
			utr,
			amount: Number(amount),
		});
	};

	return (
		<>
			<Card className="shadow-sm border-slate-200 relative">
				<CardHeader className="bg-white border-b pb-4">
					<CardTitle className="text-2xl">Active Collections</CardTitle>
					<CardDescription>Monitor active disbursed loans and register EMI or final settlements.</CardDescription>
				</CardHeader>
				<CardContent className="pt-6 bg-slate-50/50">
					{isLoading ? (
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
										<TableHead className="font-semibold text-slate-700">Outstanding Balance</TableHead>
										<TableHead className="font-semibold text-slate-700">Timeframe</TableHead>
										<TableHead className="font-semibold text-slate-700">Status</TableHead>
										<TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loans.map((loan: Application) => (
										<TableRow key={loan._id} className="hover:bg-slate-50/80 transition-colors">
											<TableCell>
												<div className="font-medium text-slate-900">{loan.borrowerId?.name || "Unknown"}</div>
												<div className="text-xs text-slate-500">{loan.borrowerId?.email || "N/A"}</div>
											</TableCell>
											<TableCell>
												<div className="font-bold text-red-700 text-lg">₹{loan.outstandingBalance.toLocaleString()}</div>
												<div className="text-xs text-slate-500">of ₹{loan.totalRepayment.toLocaleString()} Original</div>
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
													onClick={() => setActivePaymentLoan(loan)}>
													<IndianRupee className="w-4 h-4 mr-2" />
													Record Payment
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

			{/* Tailwind Payment Modal */}
			{activePaymentLoan && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
					<div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col mt-10 mb-auto">
						<div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
							<h3 className="font-semibold text-lg text-slate-900">Record Payment</h3>
							<button
								onClick={() => setActivePaymentLoan(null)}
								className="text-slate-400 hover:text-slate-700 transition-colors rounded-full p-1 hover:bg-slate-200">
								<X className="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
							<div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
								<p className="text-sm text-blue-900 font-medium">Borrower: {activePaymentLoan.borrowerId?.name}</p>
								<p className="text-sm text-blue-800 mt-1">
									Outstanding: <span className="font-bold text-lg">₹{activePaymentLoan.outstandingBalance.toLocaleString()}</span>
								</p>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-semibold text-slate-700">UTR Number</label>
								<input
									type="text"
									required
									placeholder="e.g., UTR123456789"
									className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase transition-all"
									value={utr}
									onChange={(e) => setUtr(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-semibold text-slate-700">Payment Amount (₹)</label>
								<input
									type="number"
									required
									min="0.01"
									step="any"
									max={activePaymentLoan.outstandingBalance}
									placeholder={`Max: ${activePaymentLoan.outstandingBalance}`}
									className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
									value={amount}
									onChange={(e) => setAmount(Number(e.target.value) || "")}
								/>
							</div>

							<div className="pt-4 pb-2 flex space-x-3">
								<Button type="button" variant="outline" className="w-1/2 py-5" onClick={() => setActivePaymentLoan(null)}>
									Cancel
								</Button>
								<Button
									type="submit"
									className="w-1/2 py-5 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
									disabled={paymentMutation.isPending}>
									{paymentMutation.isPending ? "Processing..." : "Confirm"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
