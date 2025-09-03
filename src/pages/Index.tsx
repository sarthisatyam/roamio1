import React, { useState } from "react";
import OnboardingFlow from "../components/OnboardingFlow";
import MainApp from "../components/MainApp";

const Index = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userData, setUserData] = useState<{ name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean } | null>(null);

  const handleOnboardingComplete = (data: { name: string; emailOrPhone: string; preferences: string[]; language: string; locationEnabled: boolean }) => {
    setUserData(data);
    setHasCompletedOnboarding(true);
  };

  const handleLogout = () => {
    setHasCompletedOnboarding(false);
    setUserData(null);
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <MainApp userData={userData} onLogout={handleLogout} />;
};

export default Index;
