import React, { useState } from 'react';

const FormRow: React.FC<{ label: string; id: string; children: React.ReactNode; description?: string; }> = ({ label, id, children, description }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-start">
        <div className="md:col-span-1">
            <label htmlFor={id} className="font-semibold text-white">{label}</label>
            {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2">
            {children}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ id: string; checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ id, checked, onChange, label }) => (
     <label htmlFor={id} className="flex items-center cursor-pointer">
        <div className="relative">
            <input type="checkbox" id={id} className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-12 h-6 rounded-full ${checked ? 'bg-sky-500' : 'bg-slate-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
        <div className="ml-3 text-slate-300">{label}</div>
    </label>
);

export const Settings: React.FC = () => {
    const [settings, setSettings] = useState({
        siteName: "Velora AI All in One Ai",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        geminiApiKey: "AIzaSy... (hidden)",
        firebaseApiKey: "AIzaSy... (hidden)",
        supportEmail: "support@velora.ai",
        enableImageGen: true,
        enableVideoGen: true,
        enableVeo: true,
    });
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleToggle = (key: keyof typeof settings, value: boolean) => {
        setSettings({ ...settings, [key]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fade-in max-w-4xl mx-auto space-y-10">
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                 <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-3">General Settings</h3>
                 <div className="space-y-6">
                    <FormRow label="Website Name" id="siteName">
                        <input id="siteName" name="siteName" type="text" value={settings.siteName} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
                    </FormRow>
                     <FormRow label="Support Email" id="supportEmail" description="This email will be displayed to users for support inquiries.">
                        <input id="supportEmail" name="supportEmail" type="email" value={settings.supportEmail} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
                    </FormRow>
                 </div>
            </div>

             <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                 <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-3">API Keys</h3>
                 <div className="space-y-6">
                    <FormRow label="Google Gemini API Key" id="geminiApiKey" description="API Key for all generative AI features.">
                        <input id="geminiApiKey" name="geminiApiKey" type="password" value={settings.geminiApiKey} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
                    </FormRow>
                 </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                 <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-3">Feature Management</h3>
                 <div className="space-y-6">
                    <FormRow label="Enable/Disable Features" id="feature-toggles" description="Toggle core functionalities of the application.">
                        <div className="space-y-3">
                            <ToggleSwitch id="enableImageGen" checked={settings.enableImageGen} onChange={v => handleToggle('enableImageGen', v)} label="Image Generation"/>
                            <ToggleSwitch id="enableVideoGen" checked={settings.enableVideoGen} onChange={v => handleToggle('enableVideoGen', v)} label="Video Generation (Standard)"/>
                            <ToggleSwitch id="enableVeo" checked={settings.enableVeo} onChange={v => handleToggle('enableVeo', v)} label="Veo Video Generation"/>
                        </div>
                    </FormRow>
                 </div>
            </div>

            <div className="flex justify-end items-center">
                {message && <p className="text-green-400 mr-4">{message}</p>}
                <button type="submit" className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-md font-semibold text-white">Save Settings</button>
            </div>
        </form>
    );
};
