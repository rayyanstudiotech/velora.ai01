
import React from 'react';

interface GeneratorCardProps {
  title: string;
  children: React.ReactNode;
}

export const GeneratorCard: React.FC<GeneratorCardProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-4xl mx-auto animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-6 border-b border-slate-700 pb-4">{title}</h2>
        {children}
    </div>
  );
};

interface ResultPreviewProps {
    children: React.ReactNode;
}

export const ResultPreview: React.FC<ResultPreviewProps> = ({ children }) => {
    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Result</h3>
            <div className="w-full bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-lg min-h-[200px] sm:min-h-[300px] flex items-center justify-center p-4">
                {children}
            </div>
        </div>
    );
};