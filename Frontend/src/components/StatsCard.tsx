import React from 'react';

const StatsCard = ({ title, value, suffix, icon: Icon, color, bgColor }) => {
  return (
    <div className={`${bgColor} backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group cursor-pointer`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-white">
          {value}<span className="text-sm text-gray-400 ml-1">{suffix}</span>
        </h3>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </div>
  );
};

export default StatsCard;