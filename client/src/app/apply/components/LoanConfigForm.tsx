"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useApplicationStore} from "@/store/useApplicationStore";
import api from "@/lib/api";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Slider} from "@/components/ui/slider";
import {toast} from "sonner";

export default function LoanConfigForm({onPrev}: {onPrev: () => void}) {
	const router = useRouter();
	const {personalDetails, salarySlipUrl, loanConfig, setLoanConfig, resetApplication} = useApplicationStore();
	const [loading, setLoading] = useState(false);

	// Math: SI = (P * R * T) / (365 * 100)
	const interest = (loanConfig.amount * loanConfig.interestRate * loanConfig.tenure) / (365 * 100);
	const totalRepayment = loanConfig.amount + interest;

	const handleApply = async () => {
		setLoading(true);
		try {
			const payload = {
				...personalDetails,
				salarySlipUrl,
				amount: loanConfig.amount,
				tenure: loanConfig.tenure,
			};

			await api.post("/loans/apply", payload);
			toast.success("Loan application submitted successfully!");
			resetApplication();
			router.push("/login"); // Or a dedicated success page
		} catch (err) {
			const error = err as {response?: {data?: {message?: string; errors?: string[]}}};
			const msg = error.response?.data?.message || "Submission failed";
			const errors = error.response?.data?.errors;
			if (errors && errors.length > 0) {
				errors.forEach((e: string) => toast.error(`BRE Reject: ${e}`));
			} else {
				toast.error(msg);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Configure Loan</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<div className="flex justify-between">
						<Label>Loan Amount (₹)</Label>
						<span className="font-bold">₹{loanConfig.amount.toLocaleString()}</span>
					</div>
					<Slider
						min={50000}
						max={500000}
						step={10000}
						value={[loanConfig.amount]}
						onValueChange={(val: number | readonly number[]) =>
							setLoanConfig({amount: Array.isArray(val) ? val[0] : val})
						}
					/>
				</div>

				<div className="space-y-4">
					<div className="flex justify-between">
						<Label>Tenure (Days)</Label>
						<span className="font-bold">{loanConfig.tenure} Days</span>
					</div>
					<Slider
						min={30}
						max={365}
						step={1}
						value={[loanConfig.tenure]}
						onValueChange={(val: number | readonly number[]) =>
							setLoanConfig({tenure: Array.isArray(val) ? val[0] : val})
						}
					/>
				</div>

				<div className="bg-slate-100 p-4 rounded-lg space-y-2 mt-6">
					<div className="flex justify-between text-sm">
						<span>Interest Rate (Fixed)</span>
						<span className="font-medium">{loanConfig.interestRate}% p.a.</span>
					</div>
					<div className="flex justify-between text-sm">
						<span>Simple Interest</span>
						<span className="font-medium text-orange-600">+ ₹{interest.toFixed(2)}</span>
					</div>
					<div className="flex justify-between text-lg font-bold border-t border-slate-300 pt-2 mt-2">
						<span>Total Repayment</span>
						<span className="text-blue-600">₹{totalRepayment.toFixed(2)}</span>
					</div>
				</div>

				<div className="flex space-x-4 pt-4">
					<Button variant="outline" className="w-1/3" onClick={onPrev} disabled={loading}>
						Back
					</Button>
					<Button className="w-2/3" onClick={handleApply} disabled={loading}>
						{loading ? "Applying..." : "Submit Application"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
