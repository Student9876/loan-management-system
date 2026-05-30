"use client";

import {useEffect, useState} from "react";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

interface Lead {
	_id: string;
	name: string;
	email: string;
	createdAt: string;
}

export default function SalesDashboard() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchLeads = async () => {
			try {
				const response = await api.get("/loans/dashboard");
				if (response.data.type === "leads") {
					setLeads(response.data.data);
				}
			} catch (err) {
				const error = err as {response?: {data?: {message?: string}}};
				toast.error(error.response?.data?.message || "Failed to fetch leads");
			} finally {
				setLoading(false);
			}
		};
		fetchLeads();
	}, []);

	return (
		<Card className="shadow-sm border-slate-200">
			<CardHeader className="bg-white border-b pb-4">
				<CardTitle className="text-2xl">Acquisition Pipeline</CardTitle>
				<CardDescription>Registered borrowers who have not yet submitted a loan application.</CardDescription>
			</CardHeader>
			<CardContent className="pt-6 bg-slate-50/50">
				{loading ? (
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
								{leads.map((lead) => (
									<TableRow key={lead._id} className="hover:bg-slate-50/80 transition-colors">
										<TableCell className="font-medium text-slate-900">{lead.name}</TableCell>
										<TableCell className="text-slate-600">{lead.email}</TableCell>
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
												onClick={() => toast.info(`Initiating contact sequence for ${lead.name}...`)}>
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
