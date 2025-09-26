

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GeneratorCard, ResultPreview } from '../GeneratorCard';
import { LightbulbIcon, DownloadIcon } from '../Icons';
import { UserSubscription, Page, HistoryItem } from '../../types';

interface TextToImageGeneratorProps {
    userSubscription: UserSubscription | null;
    openAuthModal: () => void;
    setActivePage: (page: Page) => void;
    onImageGenerated: () => void;
    onAddToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
        <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-400">Generating image(s)...</p>
    </div>
);

const samplePrompts = [
    'A cinematic shot of a raccoon chief in tribal gear, navigating a futuristic forest.',
    'A photorealistic image of a glass apple reflecting a galaxy.',
    'An oil painting of a whimsical bookshop on a rainy Parisian street.',
    'A synthwave-style illustration of a robot DJing at a party on Mars.',
    'A high-fashion cat wearing a custom-tailored suit, walking down a runway.',
    'A majestic lion with a nebula-patterned mane, standing on a cliff overlooking a starlit ocean.',
    'An enchanted, glowing mushroom forest at midnight with fireflies lighting up the scene.'
];

const imageStyles = [
    '3D render', '3D model', 'isometric view', 'cartoonish', 'futuristic', 'textured', 'glossy overlay', 'Vray render',
    'cinematic', 'photorealistic', 'cinematic lighting', 'dramatic portrait', 'moody cityscape', 'wide-angle shot', 'lens flare', 'golden hour sunlight'
];


export const TextToImageGenerator: React.FC<TextToImageGeneratorProps> = ({ userSubscription, openAuthModal, setActivePage, onImageGenerated, onAddToHistory }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [result, setResult] = useState<string[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState<number>(0);

  const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  const imageCounts = [1, 2, 3, 4];

  useEffect(() => {
    let timer: number;
    if (cooldownTime > 0) {
      timer = window.setInterval(() => {
        setCooldownTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [cooldownTime]);

  const handleSuggestPrompt = () => {
    const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setPrompt(randomPrompt);
  };

  const handleStyleClick = (style: string) => {
    setPrompt(prev => prev.trim() ? `${prev.trim()}, ${style}` : style);
  };

  const handleGenerate = useCallback(async () => {
    if (!userSubscription) {
        openAuthModal();
        return;
    }
    
    if (userSubscription.imageCount >= userSubscription.plan.imageLimit) {
        setError("You have reached your image generation limit for this plan. Please upgrade to continue.");
        return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
     const ai = new GoogleGenAI({ apiKey: "AIzaSyCKV_y_YeE9afnHZ41wgn55SRELZopeISc" });
      const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: numberOfImages,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
          },
      });
      
      if (response.generatedImages && response.generatedImages.length > 0) {
        const imageUrls = response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        setResult(imageUrls);
        onImageGenerated(); // Increment count on success
        onAddToHistory({
          type: 'Text to Image',
          prompt,
          outputs: imageUrls,
          parameters: { aspectRatio, numberOfImages },
        });
      } else {
        throw new Error("Image generation failed to produce an image.");
      }
    } catch (e: any) {
      console.error(e);
      const errorText = (e.message || JSON.stringify(e)).toLowerCase();
      
      if (errorText.includes('lifetime quota exceeded')) {
        setError("The application's API key has exceeded its free quota. The service is temporarily unavailable. Please contact support.");
      } else if (errorText.includes('resource_exhausted') || errorText.includes('rate limit') || errorText.includes('quota')) {
        setError("The service is currently experiencing high traffic. Please wait a moment and try again.");
      } else {
        setError(e.message || "An unexpected error occurred while generating the image. Please try again later.");
      }
    } finally {
      setLoading(false);
      setCooldownTime(10);
    }
  }, [prompt, aspectRatio, numberOfImages, userSubscription, openAuthModal, setActivePage, onImageGenerated, onAddToHistory]);

  return (
    <GeneratorCard title="Text to Image Generator">
      <div>
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="prompt" className="block text-md font-medium text-slate-300">
                Enter your prompt
            </label>
            <button onClick={handleSuggestPrompt} className="flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors">
                <LightbulbIcon />
                <span className="ml-1">Suggest</span>
            </button>
        </div>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A cute cat wearing a tiny wizard hat"
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder:text-slate-400"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="mt-6">
        <label className="block text-md font-medium text-slate-300 mb-2">
            Models
        </label>
        <div className="flex flex-wrap gap-2">
            {imageStyles.map((style) => (
                <button
                    key={style}
                    onClick={() => handleStyleClick(style)}
                    disabled={loading}
                    className="px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors duration-200 bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Add style: ${style}`}
                >
                    {style}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-md font-medium text-slate-300 mb-2">
            Number of Images
          </label>
          <div className="flex flex-wrap gap-3">
            {imageCounts.map((count) => (
              <label key={count} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="image-count"
                  value={count}
                  checked={numberOfImages === count}
                  onChange={() => setNumberOfImages(count)}
                  className="sr-only"
                  aria-label={`Number of images ${count}`}
                  disabled={loading}
                />
                <div
                  className={`px-5 py-2 border rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    numberOfImages === count
                      ? 'bg-sky-500 text-white border-sky-500 ring-2 ring-sky-300 ring-offset-1'
                      : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {count}
                </div>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-md font-medium text-slate-300 mb-2">
            Aspect Ratio
          </label>
          <div className="flex flex-wrap gap-3">
            {aspectRatios.map((ratio) => (
              <label key={ratio} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="aspect-ratio-image"
                  value={ratio}
                  checked={aspectRatio === ratio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="sr-only"
                  aria-label={`Aspect ratio ${ratio}`}
                  disabled={loading}
                />
                <div
                  className={`px-5 py-2 border rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    aspectRatio === ratio
                      ? 'bg-sky-500 text-white border-sky-500 ring-2 ring-sky-300 ring-offset-1'
                      : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {ratio}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleGenerate}
          disabled={loading || cooldownTime > 0}
          className="w-full sm:w-auto bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-transform transform hover:scale-105 duration-200 disabled:bg-sky-500/50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? 'Generating...' : (cooldownTime > 0 ? `Please wait... (${cooldownTime}s)` : 'Generate')}
        </button>
      </div>

      <ResultPreview>
        {loading && <LoadingSpinner />}
        {error && <div className="text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</div>}
        {!loading && !error && !result && <p className="text-slate-400 italic">Your generated image will appear here.</p>}
        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img src={imageUrl} alt={`Generated image ${index + 1}`} className="rounded-lg shadow-md w-full" />
                <a
                  href={imageUrl}
                  download={`velora-ai-generated-image-${index + 1}.jpeg`}
                  className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                  aria-label="Download image"
                >
                  <DownloadIcon />
                </a>
              </div>
            ))}
          </div>
        )}
      </ResultPreview>
    </GeneratorCard>
  );
};
