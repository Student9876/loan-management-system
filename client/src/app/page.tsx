import Link from "next/link";
import {ArrowRight, ShieldCheck, Banknote, Clock} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-slate-50 flex flex-col">
			{/* Navbar */}
			<nav className="w-full bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center">
				<div className="font-bold text-2xl text-purple-700 tracking-tight">
					FinLend<span className="text-slate-900">.</span>
				</div>
				<div className="space-x-4">
					<Link href="/login">
						<Button variant="ghost" className="text-slate-600 hover:text-slate-900">
							Sign In
						</Button>
					</Link>
					<Link href="/register">
						<Button className="bg-purple-600 hover:bg-purple-700">Apply Now</Button>
					</Link>
				</div>
			</nav>

			{/* Hero Section */}
			<main className="flex-1 flex flex-col items-center justify-center px-4 text-center mt-12 mb-20">
				<div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm text-purple-600 mb-8">
					<span className="flex h-2 w-2 rounded-full bg-purple-600 mr-2"></span>
					Instant Approvals Live
				</div>

				<h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl leading-tight mb-6">
					Smart Lending for <br className="hidden md:block" />
					<span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600">Ambitious Goals.</span>
				</h1>

				<p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10">
					Experience frictionless lending. Get approved in minutes with our automated Business Rule Engine and transparent processing.
				</p>

				<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
					<Link href="/register">
						<Button size="lg" className="h-14 px-8 text-lg bg-slate-900 hover:bg-slate-800 rounded-full">
							Get Started
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
					<Link href="/login">
						<Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-300">
							Staff Portal
						</Button>
					</Link>
				</div>

				{/* Feature grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl text-left">
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
						<div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
							<Clock className="w-6 h-6 text-blue-600" />
						</div>
						<h3 className="font-semibold text-xl mb-2">Lightning Fast</h3>
						<p className="text-slate-500">Automated evaluations mean you get a decision instantly without the endless waiting.</p>
					</div>
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
						<div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
							<Banknote className="w-6 h-6 text-green-600" />
						</div>
						<h3 className="font-semibold text-xl mb-2">Transparent Rates</h3>
						<p className="text-slate-500">A flat 12% p.a. simple interest. No hidden fees, no compounding tricks. Just clear math.</p>
					</div>
					<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
						<div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
							<ShieldCheck className="w-6 h-6 text-purple-600" />
						</div>
						<h3 className="font-semibold text-xl mb-2">Bank-grade Security</h3>
						<p className="text-slate-500">Your data is secured with enterprise-level encryption and rigorous RBAC protocols.</p>
					</div>
				</div>
			</main>
		</div>
	);
}
