import React from 'react';
import type { Role } from '../types';

interface Props {
  roles: Record<string, Role>;
  onSelect: (roleId: string) => void;
}

export const RoleSelector: React.FC<Props> = ({ roles, onSelect }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
      <div className="max-w-2xl w-full mx-4 bg-gray-900/90 rounded-2xl p-8 border border-cyan-500/30 shadow-2xl">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2 text-center">CareerForge</h1>
        <p className="text-gray-400 text-center mb-2">The System Architect's Journey</p>
        <p className="text-gray-500 text-center text-sm mb-8">Не читай резюме — пройди его</p>
        
        <h2 className="text-lg text-gray-300 mb-4 text-center">Кто вы?</h2>
        
        <div className="space-y-3">
          {Object.values(roles).map(role => (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-cyan-500/50 rounded-xl p-4 text-left transition-all group"
            >
              <div className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                {role.label}
              </div>
              <div className="text-gray-500 text-sm mt-1">{role.description}</div>
            </button>
          ))}
        </div>

        <p className="text-gray-600 text-xs text-center mt-6">
          5 интерактивных сцен · 12-15 минут · реальные кейсы
        </p>
      </div>
    </div>
  );
};
