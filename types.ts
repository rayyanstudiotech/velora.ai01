export enum Page {
  Dashboard = 'Dashboard',
  TextToImage = 'TextToImage',
  TextToVideo = 'TextToVideo',
  ImageToVideo = 'ImageToVideo',
  Subscription = 'Subscription',
  Payment = 'Payment',
  VeoVideos = 'VeoVideos',
  Admin = 'Admin',
  Coupon = 'Coupon',
  History = 'History',
}

export interface User {
  id: string;
  email?: string | null;
  username: string;
}

export interface Plan {
    name: string;
    price: string;
    priceDetails: string;
    features: string[];
    bgColor: string;
    borderColor: string;
    buttonColor: string;
    buttonTextColor: string;
    highlight?: boolean;
    highlightText?: string;
    imageLimit: number;
    videoLimit: number;
}

export interface UserSubscription {
    plan: Plan;
    imageCount: number;
    videoCount: number;
    startDate: string;
}

export interface HistoryItem {
  id: string;
  type: 'Text to Image' | 'Text to Video' | 'Image to Video' | 'Veo Video';
  prompt: string;
  outputs: string[]; // base64 data URLs for images, blob URLs for videos
  parameters: {
    [key: string]: any;
  };
  createdAt: string; // ISO date string
}


export interface AdminWithdrawal {
  id: string;
  adminEmail: string;
  amount: number;
  easypaisaNumber: string;
  easypaisaName: string;
  status: 'Pending' | 'Completed' | 'Failed';
  timestamp: string;
}

export interface AdminCoupon {
  code: string;
  status: 'Available' | 'Redeemed';
  generatedOn: string; // ISO date string
  redeemedOn?: string; // ISO date string
  redeemedBy?: string; // user email
}