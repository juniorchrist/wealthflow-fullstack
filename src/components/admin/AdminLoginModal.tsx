import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Shield, X } from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { BrandLogo } from '../common/BrandLogo';

import { api } from '../../services/api';

// Credentials hardcodés — accès admin
const ADMIN_ID = 'admin';
const ADMIN_PASSWORD = 'wealthflow2026';

interface AdminLoginModalProps {
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose }) => {
  const { setActiveTab, setIsAdminAuthenticated } = useWealth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.admin.login({ identifier, password });
      if (res.success) {
        setIsAdminAuthenticated(true);
        setActiveTab('admin');
        onClose();
      } else {
        if (identifier.trim().toLowerCase() === ADMIN_ID && password === ADMIN_PASSWORD) {
          setIsAdminAuthenticated(true);
          setActiveTab('admin');
          onClose();
        } else {
          setError(res.message || 'Identifiant ou mot de passe incorrect.');
          setPassword('');
        }
      }
    } catch (err: any) {
      if (identifier.trim().toLowerCase() === ADMIN_ID && password === ADMIN_PASSWORD) {
        setIsAdminAuthenticated(true);
        setActiveTab('admin');
        onClose();
      } else {
        setError(err?.message || 'Erreur de connexion au serveur.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fermeture sur Escape
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E8E8] animate-in zoom-in-95 duration-150 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#F0F0F0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF5330]/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#FF5330]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#18181B]">Accès administrateur</h2>
                <p className="text-[10px] text-[#A1A1AA]">Réservé à l'équipe WealthFlow</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Logo centré */}
        <div className="flex justify-center pt-5 pb-1">
          <BrandLogo size="md" showBadge={false} withDarkContainer={false} />
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Identifiant */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
              Identifiant
            </label>
            <input
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
              placeholder="Identifiant admin"
              className="w-full px-3.5 py-2.5 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-semibold text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF5330] transition-colors"
              required
              disabled={isLoading}
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="••••••••••"
                className="w-full px-3.5 py-2.5 pr-10 bg-[#F7F7F7] border border-[#E8E8E8] rounded-xl text-sm font-semibold text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#FF5330] transition-colors"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />
                }
              </button>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EF4444]/8 border border-[#EF4444]/20">
              <Lock className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
              <p className="text-[11px] font-bold text-[#EF4444]">{error}</p>
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={isLoading || !identifier.trim() || !password}
            className="w-full py-2.5 rounded-xl bg-[#FF5330] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all cursor-pointer active:scale-[0.98] mt-1"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Vérification...
              </span>
            ) : (
              'Accéder à l\'administration'
            )}
          </button>
        </form>

        {/* Footer discret */}
        <div className="px-6 pb-5 space-y-3">
          {/* Credentials affichés clairement */}
          <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#E8E8E8] space-y-1.5">
            <p className="text-[10px] font-bold text-[#6F6F73] uppercase tracking-wider">
              Accès administrateur
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#A1A1AA]">Identifiant</span>
              <code className="text-[11px] font-black text-[#18181B] bg-white border border-[#E8E8E8] px-2 py-0.5 rounded-md">
                admin
              </code>
            </div>
    
          </div>
          <p className="text-[10px] text-[#D4D4D8] text-center">
            Espace privé — accès restreint
          </p>
        </div>
      </div>
    </div>
  );
};
