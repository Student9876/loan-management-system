"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

interface Lead {
	_id: string;
	borrowerId: {
		name: string;
		email: string;
	};
	status: string;
	createdAt: string;
}

export default function SalesDashboard() {
	const router = useRouter();

	// RBAC Protection
	useEffect(() => {
		const role = localStorage.getItem("role");
		if (role !== "Sales" && role !== "Admin") {
			router.push("/login");
		}
	}, [router]);

	// Declarative Fetching
	const {data: leads = [], isLoading} = useQuery({
		queryKey: ["sales-leads"],
		queryFn: async () => {
			const response = await api.get("/loans/dashboard");
			return (response.data.data || []).filter((item: Lead) => item.status === "Lead");
		},
	});

	return (
		<Card className="shadow-sm border-slate-200">
			<CardHeader className="bg-white border-b pb-4">
				<CardTitle className="text-2xl">Acquisition Pipeline</CardTitle>
				<CardDescription>Registered borrowers who have not yet submitted a loan application.</CardDescription>
			</CardHeader>
			<CardContent className="pt-6 bg-slate-50/50">
				{isLoading ? (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				) : leads.length === 0 ? (
					<div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-lg bg-white">
						No active leads found. All registered borrowers have applied.
					</div>
				) : (
					<div className="border rounded-md bg-white overflow-hidden shadow-sm">
						<Table>
							<TableHeader className="bg-slate-50">
								<TableRow>
									<TableHead className="font-semibold text-slate-700">Borrower Name</TableHead>
									<TableHead className="font-semibold text-slate-700">Email Address</TableHead>
									<TableHead className="font-semibold text-slate-700">Status</TableHead>
									<TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{leads.map((lead: Lead) => (
									<TableRow key={lead._id} className="hover:bg-slate-50/80 transition-colors">
										<TableCell className="font-medium text-slate-900">{lead.borrowerId?.name}</TableCell>
										<TableCell className="text-slate-600">{lead.borrowerId?.email}</TableCell>
										<TableCell>
											<Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
												Cold Lead
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												className="hover:text-blue-700"
												onClick={() => toast.info(`Initiating contact sequence for ${lead.borrowerId?.name}...`)}>
												Follow Up
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
