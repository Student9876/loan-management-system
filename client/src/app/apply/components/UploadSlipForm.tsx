"use client";

import {useState} from "react";
import {useApplicationStore} from "@/store/useApplicationStore";
import api from "@/lib/api";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

export default function UploadSlipForm({onNext, onPrev}: {onNext: () => void; onPrev: () => void}) {
	const {salarySlipUrl, setSalarySlipUrl} = useApplicationStore();
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);

	const handleUpload = async () => {
		if (!file && !salarySlipUrl) {
			toast.error("Please select a file");
			return;
		}
		if (salarySlipUrl) {
			onNext();
			return;
		}

		const formData = new FormData();
		formData.append("file", file as Blob);

		setLoading(true);
		try {
			const response = await api.post("/loans/upload-slip", formData, {
				headers: {"Content-Type": "multipart/form-data"},
			});
			setSalarySlipUrl(response.data.url);
			toast.success("File uploaded successfully");
			onNext();
		} catch (err) {
			const error = err as {response?: {data?: {message?: string}}};
			toast.error(error.response?.data?.message || "Upload failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-2xl">Salary Slip</CardTitle>
				<CardDescription>Upload a PDF, JPG, or PNG (Max 5MB)</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label>Select File</Label>
					<Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
				</div>
				{salarySlipUrl && <div className="text-sm text-green-600 font-medium">File uploaded and linked.</div>}
				<div className="flex space-x-4 pt-4">
					<Button variant="outline" className="w-1/2" onClick={onPrev} disabled={loading}>
						Back
					</Button>
					<Button className="w-1/2" onClick={handleUpload} disabled={loading}>
						{loading ? "Uploading..." : salarySlipUrl ? "Next Step" : "Upload & Continue"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
