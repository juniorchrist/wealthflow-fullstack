import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    registerUser,
  } = useWealth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login({ name: name || 'Junior', email: email || 'junior@wealthflow.com' });
      setIsLoading(false);
      handleClose();
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      registerUser({
        name: name || 'Nouvel utilisateur',
        email: email || 'user@wealthflow.com',
        currency: 'FCFA',
      });
      setIsLoading(false);
      handleClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F7F7] hover:bg-[#E8E8E8] flex items-center justify-center text-[#6F6F73] hover:text-[#18181B] transition-colors cursor-pointer z-10"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <img src="/LOGOwealthflow.png" alt="WealthFlow" className="h-8 w-auto mx-auto" />
            <h2 className="text-lg sm:text-xl font-black text-[#18181B] tracking-tight">
              {authModalMode === 'login' ? 'Bon retour parmi nous' : 'Créez votre espace'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6F73]">
              {authModalMode === 'login'
                ? 'Connectez-vous pour accéder à votre coffre-fort financier.'
                : 'Commencez à gérer vos finances en quelques secondes.'}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={authModalMode === 'login' ? handleLogin : handleRegister}
            className="space-y-4"
          >
            {authModalMode === 'register' && (
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1.5">Nom complet</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330] transition-colors"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330] transition-colors"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#6F6F73] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FF5330] hover:bg-[#E84524] text-white font-bold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,83,48,0.3)]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{authModalMode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="text-center">
            <p className="text-xs text-[#6F6F73]">
              {authModalMode === 'login' ? (
                <>
                  Pas encore de compte ?{' '}
                  <button
                    onClick={() => setAuthModalMode('register')}
                    className="font-bold text-[#FF5330] hover:underline cursor-pointer"
                  >
                    Créer un compte
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <button
                    onClick={() => setAuthModalMode('login')}
                    className="font-bold text-[#FF5330] hover:underline cursor-pointer"
                  >
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Demo hint */}
          <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#E8E8E8] text-center">
            <p className="text-[11px] text-[#6F6F73]">
              <strong className="text-[#18181B]">Démo :</strong> Utilisez n'importe quels identifiants pour tester l'application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
