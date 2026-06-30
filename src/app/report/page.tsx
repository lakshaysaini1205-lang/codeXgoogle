import ReportForm from "@/components/ReportForm";
import { Sparkles } from "lucide-react";

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-2xl flex-1 px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
        <p className="mt-2 text-sm text-slate-500">
          Help your community by reporting local problems. AI will automatically
          categorize and prioritize your report.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI-powered categorization included
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ReportForm />
      </div>
    </div>
  );
}
