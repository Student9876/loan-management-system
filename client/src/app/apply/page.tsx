"use client";

import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import api from "@/lib/api";
import PersonalDetailsForm from "./components/PersonalDetailsForm";
import UploadSlipForm from "./components/UploadSlipForm";
import LoanConfigForm from "./components/LoanConfigForm";
import {Card, CardContent} from "@/components/ui/card";
import {Clock, CheckCircle, XCircle, FileText, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";

interface LoanApplication {
	_id: string;
	status: string;
	createdAt: string;
	amount: number;
	totalRepayment: number;
	outstandingBalance: number;
	rejectionReason?: string;
}

export default function ApplyPage() {
	const [step, setStep] = useState(1);
	const [activeTab, setActiveTab] = useState<"dashboard" | "apply">("dashboard");

	const nextStep = () => setStep((prev) => prev + 1);
	const prevStep = () => setStep((prev) => prev - 1);

	// Declarative Fetching via TanStack Query
	const {data: loans = [], isLoading} = useQuery({
		queryKey: ["borrower-loans"],
		queryFn: async () => {
			const response = await api.get("/loans/dashboard");
			return response.data.data || [];
		},
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[60vh]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	return (
		<div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
			{/* Tab Navigation */}
			<div className="flex p-1 space-x-1 bg-slate-200/50 rounded-xl w-full max-w-md mx-auto mb-10">
				<button
					onClick={() => setActiveTab("dashboard")}
					className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all ${
						activeTab === "dashboard" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
					}`}>
					<FileText className="w-4 h-4 mr-2" />
					My Applications
				</button>
				<button
					onClick={() => {
						setActiveTab("apply");
						setStep(1);
					}}
					className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all ${
						activeTab === "apply" ? "bg-white text-purple-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
					}`}>
					<Plus className="w-4 h-4 mr-2" />
					New Application
				</button>
			</div>

			{/* DASHBOARD TAB */}
			{activeTab === "dashboard" && (
				<div className="space-y-6">
					<div className="mb-6 flex justify-between items-end">
						<div>
							<h2 className="text-3xl font-bold text-slate-900">Application History</h2>
							<p className="text-slate-500 mt-1">Track the status of your current and past loans.</p>
						</div>
					</div>

					{loans.length === 0 ? (
						<div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
							<FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-slate-900 mb-1">No Applications Found</h3>
							<p className="text-slate-500 mb-6">You haven&apos;t applied for any loans yet.</p>
							<Button onClick={() => setActiveTab("apply")} className="bg-purple-600 hover:bg-purple-700">
								Start First Application
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-6">
							{loans.map((loan: LoanApplication, index: number) => (
								<Card key={loan._id || index} className="shadow-sm border-slate-200 overflow-hidden">
									<div
										className={`h-1.5 w-full ${
											loan.status === "Applied"
												? "bg-amber-400"
												: loan.status === "Sanctioned"
													? "bg-blue-500"
													: loan.status === "Disbursed"
														? "bg-green-500"
														: loan.status === "Rejected"
															? "bg-red-500"
															: "bg-purple-500"
										}`}
									/>
									<CardContent className="p-6">
										<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
											{/* Status Badge */}
											<div className="flex-1">
												<p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</p>
												<div className="flex items-center">
													{loan.status === "Applied" && <Clock className="w-5 h-5 text-amber-500 mr-2" />}
													{loan.status === "Sanctioned" && <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />}
													{loan.status === "Disbursed" && <CheckCircle className="w-5 h-5 text-green-500 mr-2" />}
													{loan.status === "Rejected" && <XCircle className="w-5 h-5 text-red-500 mr-2" />}
													{loan.status === "Closed" && <CheckCircle className="w-5 h-5 text-purple-500 mr-2" />}
													<span className="text-xl font-bold text-slate-800">{loan.status}</span>
												</div>
												<p className="text-xs text-slate-400 mt-2">Applied on {new Date(loan.createdAt).toLocaleDateString()}</p>
											</div>

											{/* Financials */}
											<div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
												<div className="grid grid-cols-2 gap-4">
													<div>
														<p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Principal</p>
														<p className="text-lg font-bold text-slate-800">₹{loan.amount?.toLocaleString()}</p>
													</div>
													<div>
														<p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Repayment</p>
														<p className="text-lg font-bold text-slate-800">₹{loan.totalRepayment?.toLocaleString()}</p>
													</div>
												</div>
											</div>

											{/* Active Balance / Rejection Reason */}
											<div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
												{loan.status === "Rejected" ? (
													<div>
														<p className="text-xs text-red-500 font-medium uppercase tracking-wider mb-1">Rejection Reason</p>
														<p className="text-sm font-medium text-slate-800 line-clamp-2">
															{loan.rejectionReason || "Did not meet criteria"}
														</p>
													</div>
												) : (
													<div>
														<p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Outstanding Balance</p>
														<p className="text-2xl font-bold text-purple-700">₹{loan.outstandingBalance?.toLocaleString()}</p>
													</div>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			)}

			{/* APPLY TAB */}
			{activeTab === "apply" && (
				<div className="max-w-2xl mx-auto">
					<div className="mb-8">
						<h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Apply for a Loan</h2>
						<div className="flex justify-between items-center relative">
							{[1, 2, 3].map((i) => (
								<div key={i} className="flex flex-col items-center flex-1 z-10">
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
											step >= i ? "bg-purple-600 text-white shadow-md" : "bg-slate-200 text-slate-500"
										}`}>
										{i}
									</div>
									<span className={`text-xs mt-3 font-medium ${step >= i ? "text-purple-600" : "text-slate-400"}`}>
										{i === 1 ? "Details" : i === 2 ? "Document" : "Configure"}
									</span>
								</div>
							))}
							<div className="absolute top-5 left-0 w-full h-1 bg-slate-200 z-0"></div>
							<div
								className="absolute top-5 left-0 h-1 bg-purple-600 z-0 transition-all duration-300"
								style={{width: `${((step - 1) / 2) * 100}%`}}></div>
						</div>
					</div>

					<div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
						{step === 1 && <PersonalDetailsForm onNext={nextStep} />}
						{step === 2 && <UploadSlipForm onNext={nextStep} onPrev={prevStep} />}
						{step === 3 && <LoanConfigForm onPrev={prevStep} />}
					</div>
				</div>
			)}
		</div>
	);
}
