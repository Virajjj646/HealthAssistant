
import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  colorClass: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onClick, colorClass }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-8 rounded-3xl text-left transition-all hover:scale-105 active:scale-95 shadow-lg border-b-8 ${colorClass} text-white`}
    >
      <div className="flex items-center gap-6">
        <div className="bg-white/20 p-5 rounded-2xl">
          <i className={`fas ${icon} text-4xl`}></i>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-lg opacity-90">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default FeatureCard;
