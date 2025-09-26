import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TextToImageGenerator } from './components/generators/TextToImageGenerator';
import { TextToVideoGenerator } from './components/generators/TextToVideoGenerator';
import { ImageToVideoGenerator } from './components/generators/ImageToVideoGenerator';
import { VeoVideosGenerator } from './components/generators/VeoVideosGenerator';
import { SubscriptionPage } from './components/SubscriptionPage';
import { PaymentPage } from './components/PaymentPage';
import { AuthModal } from './components/AuthModal';
import { AdminPage } from './components/admin/AdminPage';
import { CouponPage } from './components/CouponPage';
import { HistoryPage } from './components/HistoryPage';
import { MenuIcon, XIcon, UserIcon, AdminIcon } from './components/Icons';
import { Page, User, Plan, UserSubscription, HistoryItem } from './types';
import { auth } from './lib/firebase';
// FIX: Corrected Firebase import path for modular SDK to resolve 'has no exported member' errors.
import { onAuthStateChanged, signOut, User as FirebaseUser } from '@firebase/auth';
// FIX: Import `plans` to resolve the `Cannot find name 'plans'` error.
import { plans } from './lib/plans';
import { mockCoupons } from './lib/mockAdminData';
import { addHistoryItem } from './lib/history';


const ADMIN_EMAILS = ['rayyanzameer123@gmail.com', 'zameerahmedniazi@gmail.com'];

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSubscriptionOnboarding, setShowSubscriptionOnboarding] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);

  useEffect(() => {
    // API key check. The user provided a screenshot of this error, so it's important to provide this feedback.
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
      console.error("Configuration Error: Google AI API Key is missing. The application's core features will not work. Please ensure the API_KEY is set in your environment.");
    }

    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
        if (user) {
            setCurrentUser({
                id: user.uid,
                email: user.email,
                username: user.displayName || user.email?.split('@')[0] || 'User',
            });
            // In a real app, you would fetch this from your database.
            // For this prototype, we assign the starter plan by default on login.
            if (!userSubscription) {
                const starterPlan = plans.find(p => p.name === 'Starter Plan')!;
                setUserSubscription({
                    plan: starterPlan,
                    imageCount: 0,
                    videoCount: 0,
                    startDate: new Date().toISOString(),
                });
            }
            setIsAuthModalOpen(false);
        } else {
            setCurrentUser(null);
            setUserSubscription(null); // Clear subscription on logout
        }
    });
    return () => unsubscribe();
  }, []); // Note: userSubscription is intentionally not in the dependency array to avoid re-setting it on every usage change.

  const handleLogout = async () => {
    try {
        await signOut(auth);
        setCurrentUser(null);
        setUserSubscription(null);
        setShowSubscriptionOnboarding(false);
        setActivePage(Page.Dashboard); // Return to dashboard on logout
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };
  
  const handleSignUpSuccess = () => {
    setShowSubscriptionOnboarding(true);
    setActivePage(Page.Subscription);
  };

  const updateSubscription = (plan: Plan) => {
    setUserSubscription({
        plan: plan,
        imageCount: 0,
        videoCount: 0,
        startDate: new Date().toISOString(),
    });
  };

  const handlePlanChosen = (plan: Plan) => {
    if (plan.name === 'Pro Plan' && couponApplied) {
        updateSubscription(plan);
        setCouponApplied(false); // Reset coupon after use
        setShowSubscriptionOnboarding(false);
        setActivePage(Page.Dashboard);
        // In a real app, a toast notification would be better.
        alert('Congratulations! Your Pro Plan has been activated for 1 month, free of charge.');
        return;
    }

    if (plan.name === 'Starter Plan') {
        updateSubscription(plan);
        setShowSubscriptionOnboarding(false);
        setActivePage(Page.Dashboard);
    } else {
        setSelectedPlan(plan);
        setActivePage(Page.Payment);
    }
  };

  const handlePaymentSuccess = () => {
    if (selectedPlan) {
      updateSubscription(selectedPlan);
    }
    setShowSubscriptionOnboarding(false);
    setActivePage(Page.Dashboard);
    setSelectedPlan(null);
  };

  const handleImageGenerated = () => {
    setUserSubscription(prev => prev ? { ...prev, imageCount: prev.imageCount + 1 } : null);
  };

  const handleVideoGenerated = () => {
    setUserSubscription(prev => prev ? { ...prev, videoCount: prev.videoCount + 1 } : null);
  };
  
  const handleCouponSuccess = (redeemedCode: string) => {
    const coupon = mockCoupons.find(c => c.code.toUpperCase() === redeemedCode.trim().toUpperCase());
    if (coupon && coupon.status === 'Available') {
      // Update the mock data source to reflect redemption
      coupon.status = 'Redeemed';
      coupon.redeemedBy = currentUser?.email || 'unknown@user.com';
      coupon.redeemedOn = new Date().toISOString();

      setCouponApplied(true);
      setActivePage(Page.Subscription);
    }
    // Error handling for already redeemed or invalid codes is done in CouponPage.tsx
  };

  const handleAddToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    if (currentUser) {
      addHistoryItem(currentUser.id, item);
    }
  }, [currentUser]);

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);
  
  const handlePageChange = useCallback((page: Page) => {
    setActivePage(page);
    setIsSidebarOpen(false);
  }, []);

  const renderContent = useCallback(() => {
    const generatorProps = {
        userSubscription,
        openAuthModal,
        setActivePage,
        onImageGenerated: handleImageGenerated,
        onVideoGenerated: handleVideoGenerated,
        onAddToHistory: handleAddToHistory,
    };

    if (activePage === Page.Admin) {
      // Protect the admin route
      return currentUser?.email && ADMIN_EMAILS.includes(currentUser.email) ? <AdminPage onExitAdmin={() => handlePageChange(Page.Dashboard)} /> : <Dashboard setActivePage={setActivePage} />;
    }

    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard setActivePage={setActivePage} />;
      case Page.TextToImage:
        return <TextToImageGenerator {...generatorProps} />;
      case Page.TextToVideo:
        return <TextToVideoGenerator {...generatorProps} />;
      case Page.ImageToVideo:
        return <ImageToVideoGenerator {...generatorProps} />;
      case Page.VeoVideos:
          return <VeoVideosGenerator {...generatorProps} />;
      case Page.History:
          return <HistoryPage currentUser={currentUser} setActivePage={setActivePage} />;
      case Page.Coupon:
          return <CouponPage onCouponSuccess={handleCouponSuccess} />;
      case Page.Subscription:
        return <SubscriptionPage onPlanChosen={handlePlanChosen} userSubscription={userSubscription} couponApplied={couponApplied} />;
      case Page.Payment:
        return selectedPlan ? <PaymentPage plan={selectedPlan} onPaymentSuccess={handlePaymentSuccess} /> : <Dashboard setActivePage={setActivePage} />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  }, [activePage, openAuthModal, selectedPlan, userSubscription, currentUser, handlePageChange, couponApplied, handleAddToHistory]);

  const pageTitles: Record<Page, string> = {
    [Page.Dashboard]: 'Dashboard',
    [Page.TextToImage]: 'Text to Image Generator',
    [Page.TextToVideo]: 'Text to Video Generator',
    [Page.ImageToVideo]: 'Image to Video Generator',
    [Page.VeoVideos]: 'Veo Videos Generator',
    [Page.History]: 'Generation History',
    [Page.Subscription]: 'Subscription Plans',
    [Page.Payment]: 'Complete Your Purchase',
    [Page.Admin]: 'Admin Panel',
    [Page.Coupon]: 'Redeem Coupon Code',
  };

  const currentPageTitle = useMemo(() => pageTitles[activePage], [activePage]);
  const isAdminPage = activePage === Page.Admin;

  if (showSubscriptionOnboarding) {
      const OnboardingContent = () => {
        if (activePage === Page.Payment && selectedPlan) {
            return (
                <>
                    <header className="text-center mb-10 animate-fade-in">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Complete Your Purchase</h1>
                        <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">You're one step away from unlocking premium features.</p>
                    </header>
                    <main className="flex-1 overflow-y-auto">
                        <PaymentPage plan={selectedPlan} onPaymentSuccess={handlePaymentSuccess} />
                    </main>
                </>
            );
        }
        return (
            <>
                <header className="text-center mb-10 animate-fade-in">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Welcome to Velora AI!</h1>
                  <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">Your account has been created. Please select a plan to continue.</p>
                </header>
                <main className="flex-1 overflow-y-auto">
                  <SubscriptionPage onPlanChosen={handlePlanChosen} userSubscription={userSubscription} />
                </main>
            </>
        );
    };
    return (
      <div className="flex flex-col h-screen bg-slate-900 font-sans">
        {isApiKeyMissing && (
            <div className="bg-orange-500 text-white text-center p-2 text-sm font-semibold shadow-md z-50">
                Configuration Error: Google AI API Key is missing. The application's core features will not work. Please ensure the API_KEY is set in your environment.
            </div>
        )}
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
            <OnboardingContent />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 font-sans">
      {isApiKeyMissing && (
        <div className="bg-orange-500 text-white text-center p-2 text-sm font-semibold shadow-md z-50">
            Configuration Error: Google AI API Key is missing. The application's core features will not work. Please ensure the API_KEY is set in your environment.
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {!isAdminPage && (
            <Sidebar 
              activePage={activePage} 
              setActivePage={handlePageChange}
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
            />
        )}

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          onSignUpSuccess={handleSignUpSuccess}
        />

        <div className={`flex-1 flex flex-col overflow-hidden h-full transition-all duration-300 ease-in-out ${isSidebarOpen && !isAdminPage ? 'md:ml-64' : ''} ${isAdminPage ? 'w-full' : ''}`}>
          
          {/* Render header only for non-admin pages */}
          {!isAdminPage ? (
              <header className="flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 shadow-sm w-full z-10">
                  <div className="flex items-center">
                      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white mr-4 z-40">
                          <span className="sr-only">{isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
                          {isSidebarOpen ? <XIcon /> : <MenuIcon />}
                      </button>
                      <div className="flex items-center gap-4">
                        {activePage === Page.Dashboard ? (
                          <button onClick={() => handlePageChange(Page.Dashboard)} className="text-xl font-bold text-slate-200">
                            Velora AI
                          </button>
                        ) : (
                          <h1 className="text-xl font-bold text-slate-200">{currentPageTitle}</h1>
                        )}
                        {/* FIX: Removed redundant `activePage !== Page.Admin` check, which caused a TypeScript error because the surrounding `!isAdminPage` condition already guarantees it. */}
                        {currentUser && activePage !== Page.Coupon && (
                            <button
                              onClick={() => handlePageChange(Page.Coupon)}
                              className="text-sm font-medium text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-lg hover:bg-amber-400/20 transition-colors whitespace-nowrap"
                            >
                              Coupon Code
                            </button>
                        )}
                      </div>
                  </div>
                  <div className="flex items-center space-x-4">
                      {currentUser ? (
                          <>
                              {userSubscription && (
                                  <div className="hidden md:flex items-center space-x-3 text-xs font-mono bg-slate-700/50 px-3 py-1.5 rounded-md">
                                      <span>Images: {userSubscription.imageCount}/{userSubscription.plan.imageLimit}</span>
                                      <span className="text-slate-500">|</span>
                                      <span>Videos: {userSubscription.videoCount}/{userSubscription.plan.videoLimit}</span>
                                  </div>
                              )}
                              {currentUser?.email && ADMIN_EMAILS.includes(currentUser.email) && (
                                  <button
                                      onClick={() => handlePageChange(Page.Admin)}
                                      className="hidden sm:flex items-center space-x-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors"
                                      title="Go to Admin Panel"
                                  >
                                      <AdminIcon />
                                      <span>Admin</span>
                                  </button>
                              )}
                              <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sky-400">
                                      <UserIcon />
                                  </div>
                                  <span className="text-sm font-medium text-slate-300 hidden sm:block">
                                      {currentUser.username}
                                  </span>
                              </div>
                              <button onClick={handleLogout} className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
                                  Logout
                              </button>
                          </>
                      ) : (
                          <>
                              <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
                                  Login
                              </button>
                              <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg shadow-sm transition-colors">
                                  Sign Up
                              </button>
                          </>
                      )}
                  </div>
              </header>
          ) : null}

          <main className={`flex-1 overflow-y-auto ${!isAdminPage ? 'p-4 sm:p-6 md:p-8' : ''}`}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;