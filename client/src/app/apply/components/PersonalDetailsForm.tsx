"use client";

import {useApplicationStore} from "@/store/useApplicationStore";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

export default function PersonalDetailsForm({onNext}: {onNext: () => void}) {
	const {personalDetails, setPersonalDetails} = useApplicationStore();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onNext();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Personal Details</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label>Full Name</Label>
						<Input required value={personalDetails.fullName} onChange={(e) => setPersonalDetails({fullName: e.target.value})} />
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>PAN</Label>
							<Input
								required
								placeholder="ABCDE1234F"
								value={personalDetails.pan}
								onChange={(e) => setPersonalDetails({pan: e.target.value.toUpperCase()})}
							/>
						</div>
						<div className="space-y-2">
							<Label>Date of Birth</Label>
							<Input type="date" required value={personalDetails.dob} onChange={(e) => setPersonalDetails({dob: e.target.value})} />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Monthly Salary (₹)</Label>
							<Input
								type="number"
								required
								min="0"
								value={personalDetails.monthlySalary}
								onChange={(e) => setPersonalDetails({monthlySalary: Number(e.target.value)})}
							/>
						</div>
						<div className="space-y-2">
							<Label>Employment Mode</Label>
							<Select required value={personalDetails.employmentMode} onValueChange={(val: any) => setPersonalDetails({employmentMode: val})}>
								<SelectTrigger>
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Salaried">Salaried</SelectItem>
									<SelectItem value="Self-Employed">Self-Employed</SelectItem>
									<SelectItem value="Unemployed">Unemployed</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<Button type="submit" className="w-full mt-6">
						Next Step
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
