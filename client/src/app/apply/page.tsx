"use client";

import {useState} from "react";
import PersonalDetailsForm from "./components/PersonalDetailsForm";
import UploadSlipForm from "./components/UploadSlipForm";
import LoanConfigForm from "./components/LoanConfigForm";

export default function ApplyPage() {
	const [step, setStep] = useState(1);

	const nextStep = () => setStep((prev) => prev + 1);
	const prevStep = () => setStep((prev) => prev - 1);

	return (
		<div className="py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-2xl mx-auto">
				<div className="mb-8">
					<div className="flex justify-between items-center">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex flex-col items-center flex-1">
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
										step >= i ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
									}`}>
									{i}
								</div>
								<span className="text-xs mt-2 font-medium text-gray-500">{i === 1 ? "Details" : i === 2 ? "Document" : "Configure"}</span>
							</div>
						))}
					</div>
					<div className="relative mt-2">
						<div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
						<div
							className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-300"
							style={{width: `${((step - 1) / 2) * 100}%`}}></div>
					</div>
				</div>

				{step === 1 && <PersonalDetailsForm onNext={nextStep} />}
				{step === 2 && <UploadSlipForm onNext={nextStep} onPrev={prevStep} />}
				{step === 3 && <LoanConfigForm onPrev={prevStep} />}
			</div>
		</div>
	);
}
