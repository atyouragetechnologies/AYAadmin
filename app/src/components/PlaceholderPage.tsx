import type { LucideIcon } from 'lucide-react';

interface PlaceholderProps {
    title: string;
    icon: LucideIcon;
    description: string;
}

export function PlaceholderPage({ title, icon: Icon, description }: PlaceholderProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900 text-white">
            <div className="p-4 rounded-full bg-slate-800 mb-6 border border-slate-700 shadow-xl shadow-cyan-500/10">
                <Icon size={64} className="text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                {title}
            </h1>
            <p className="text-slate-400 max-w-md text-lg">
                {description}
            </p>
            <div className="mt-8 px-4 py-2 bg-slate-800 rounded-md border border-slate-700 text-sm text-slate-500">
                Status: Coming Soon
            </div>
        </div>
    );
}
