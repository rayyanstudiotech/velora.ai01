import React, { useState, useEffect } from 'react';
import { HistoryItem, Page, User } from '../types';
import { getHistory, deleteHistoryItem } from '../lib/history';
import { DownloadIcon } from './Icons';

interface HistoryPageProps {
    currentUser: User | null;
    setActivePage: (page: Page) => void;
}

const HistoryCard: React.FC<{ item: HistoryItem; onDelete: (id: string) => void }> = ({ item, onDelete }) => {
    const [showFullPrompt, setShowFullPrompt] = useState(false);
    const promptNeedsTruncation = item.prompt.length > 150;

    const renderOutput = (output: string, index: number) => {
        // Simple check for video based on blob URL prefix
        if (output.startsWith('blob:')) {
            return (
                <div key={index} className="relative group aspect-video">
                    <video
                        src={output}
                        controls
                        className="w-full h-full object-cover rounded-t-lg bg-slate-900"
                        onError={(e) => (e.currentTarget.poster = '/video-error.png')}
                    />
                    <a
                        href={output}
                        download={`velora-ai-video-${item.id}.mp4`}
                        className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                        aria-label="Download video"
                    >
                        <DownloadIcon />
                    </a>
                </div>
            );
        }
        // Assume image
        return (
            <div key={index} className="relative group">
                <img src={output} alt={`Generated content for prompt: ${item.prompt}`} className="w-full h-auto object-cover rounded-t-lg" />
                 <a
                    href={output}
                    download={`velora-ai-image-${item.id}.jpeg`}
                    className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label="Download image"
                >
                    <DownloadIcon />
                </a>
            </div>
        );
    };

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-700">
                {item.parameters.inputImage && (
                     <div className="relative group">
                         <img src={item.parameters.inputImage} alt="Input" className="w-full h-auto object-cover rounded-t-lg" />
                         <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">INPUT</div>
                     </div>
                )}
                {item.outputs.map(renderOutput)}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold bg-sky-500/20 text-sky-300 px-2 py-1 rounded">{item.type}</span>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this history item?')) {
                                onDelete(item.id);
                            }
                        }}
                        className="text-slate-400 hover:text-red-400 text-xs font-semibold"
                    >
                        Delete
                    </button>
                </div>
                <p className="text-slate-300 text-sm flex-grow">
                    {showFullPrompt || !promptNeedsTruncation ? item.prompt : `${item.prompt.substring(0, 150)}...`}
                    {promptNeedsTruncation && (
                        <button onClick={() => setShowFullPrompt(!showFullPrompt)} className="text-sky-400 hover:text-sky-300 ml-1 font-semibold">
                            {showFullPrompt ? 'Show Less' : 'Show More'}
                        </button>
                    )}
                </p>
                <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700">
                    {new Date(item.createdAt).toLocaleString()}
                </div>
            </div>
        </div>
    );
};

export const HistoryPage: React.FC<HistoryPageProps> = ({ currentUser, setActivePage }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        if (currentUser) {
            setHistory(getHistory(currentUser.id));
        }
    }, [currentUser]);

    const handleDelete = (id: string) => {
        if (currentUser) {
            deleteHistoryItem(currentUser.id, id);
            setHistory(current => current.filter(item => item.id !== id));
        }
    };
    
    if (!currentUser) {
         return (
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Please log in to view your history.</h1>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center flex flex-col items-center justify-center h-full animate-fade-in">
                <h1 className="text-3xl font-bold text-white mb-4">No History Yet</h1>
                <p className="text-slate-400 mb-6 max-w-md">You haven't generated any media. Once you do, it will appear here for you to review and manage.</p>
                <button
                    onClick={() => setActivePage(Page.Dashboard)}
                    className="bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-transform transform hover:scale-105 duration-200"
                >
                    Create Something Amazing
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
             <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Generation History</h1>
                <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                    Review and manage all your past creations.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map(item => (
                    <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
                ))}
            </div>
        </div>
    );
};
