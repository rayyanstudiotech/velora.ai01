import React from 'react';
import { Page } from '../types';
import { ImageIcon, VideoIcon, FilmIcon, SparklesIcon, HistoryIcon } from './Icons';

interface DashboardProps {
  setActivePage: (page: Page) => void;
}

const ToolCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  page: Page;
  onClick: (page: Page) => void;
}> = ({ icon, title, description, page, onClick }) => (
  <button
    onClick={() => onClick(page)}
    className="bg-slate-800 rounded-xl shadow-lg p-6 w-full text-left hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300"
    aria-label={`Navigate to ${title}`}
  >
    <div className="flex items-center mb-3">
      <div className="bg-slate-700 text-sky-400 p-3 rounded-full">
        {icon}
      </div>
      <h3 className="ml-4 text-xl font-bold text-slate-100">{title}</h3>
    </div>
    <p className="text-slate-300">{description}</p>
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ setActivePage }) => {
  const tools = [
    {
      icon: <ImageIcon />,
      title: 'Text to Image',
      description: 'Generate stunning images from textual descriptions.',
      page: Page.TextToImage,
    },
    {
      icon: <VideoIcon />,
      title: 'Text to Video',
      description: 'Create dynamic videos from your creative text prompts.',
      page: Page.TextToVideo,
    },
    {
      icon: <FilmIcon />,
      title: 'Image to Video',
      description: 'Animate your images and bring them to life as videos.',
      page: Page.ImageToVideo,
    },
    {
      icon: <HistoryIcon />,
      title: 'Generation History',
      description: 'View and manage all your previously generated media.',
      page: Page.History,
    },
    {
      icon: <SparklesIcon />,
      title: 'Subscription Plans',
      description: 'Upgrade your plan for more generations and pro features.',
      page: Page.Subscription,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Welcome to Velora AI</h1>
        <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">Transform your ideas into stunning visuals with the power of artificial intelligence.</p>
        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">Select a tool to begin.</p>
        <p className="mt-4 text-md text-slate-400 max-w-3xl mx-auto">
          Velora AI provides a state-of-the-art suite of generative tools designed for creators, marketers, and innovators. Whether you're bringing a character to life, producing a cinematic short, or animating a static image, our platform simplifies the creative process.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {tools.map(tool => (
          <ToolCard
            key={tool.page}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            page={tool.page}
            onClick={setActivePage}
          />
        ))}
      </div>
    </div>
  );
};