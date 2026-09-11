import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useWealth } from '../../context/WealthContext';
import { api } from '../../services/api';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    registerUser,
  } = useWealth();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setPrenom('');
    setNom('');
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.auth.login({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (res.success && res.data?.user) {
        const u = res.data.user;
        const fullName = `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email;
        login({
          name: fullName,
          email: u.email,
        });
        handleClose();
      } else {
        setErrorMessage(res.message || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPrenom = prenom.trim();
    const cleanNom = nom.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanPrenom || cleanPrenom.length < 2) {
      setErrorMessage('Le prénom doit contenir au moins 2 caractères');
      return;
    }

    if (!cleanNom || cleanNom.length < 2) {
      setErrorMessage('Le nom doit contenir au moins 2 caractères');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Veuillez entrer une adresse email valide');
      return;
    }

    if (!password || !/^\d{4}$/.test(password)) {
      setErrorMessage('Le code PIN doit contenir exactement 4 chiffres');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.auth.register({
        prenom: cleanPrenom,
        nom: cleanNom,
        email: cleanEmail,
        password: password,
        currency: 'FCFA',
      });

      if (res.success && res.data?.user) {
        const u = res.data.user;
        const fullName = `${u.prenom || ''} ${u.nom || ''}`.trim();
        registerUser({
          name: fullName,
          email: u.email,
          currency: u.currency || 'FCFA',
        });
        handleClose();
      } else {
        setErrorMessage(res.message || 'Erreur lors de la création du compte');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#6F6F73] transition-colors cursor-pointer z-10"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <BrandLogo size="md" showBadge={false} withDarkContainer={false} useOfficialLogo={true} />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#18181B] tracking-tight">
              {authModalMode === 'login' ? 'Connexion à votre espace' : 'Créez votre compte réel'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6F73]">
              {authModalMode === 'login'
                ? 'Accédez à votre tableau de bord financier sécurisé.'
                : 'Commencez à gérer vos finances personnelles en toute sécurité.'}
            </p>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={authModalMode === 'login' ? handleLogin : handleRegister}
            className="space-y-4"
          >
            {authModalMode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#18181B] block mb-1.5">Prénom</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330] transition-colors"
                      placeholder="Jean"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#18181B] block mb-1.5">Nom</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330] transition-colors"
                      placeholder="Kouassi"
                    />
                  </div>
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
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330] transition-colors"
                  placeholder="votre.email@exemple.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18181B] block mb-1.5">
                {authModalMode === 'login' ? 'Code PIN (4 chiffres)' : 'Choisir un code PIN (4 chiffres)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPassword(val);
                  }}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-xl text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330] transition-colors tracking-[0.4em]"
                  placeholder="••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authModalMode === 'register' && (
                <p className="text-[10px] text-[#A1A1AA] mt-1">Entrez 4 chiffres que vous mémoriserez facilement</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FF5330] text-white font-bold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,83,48,0.3)]"
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
                    onClick={() => {
                      setErrorMessage(null);
                      setAuthModalMode('register');
                    }}
                    className="font-bold text-[#FF5330] cursor-pointer"
                  >
                    Créer un compte
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setAuthModalMode('login');
                    }}
                    className="font-bold text-[#FF5330] cursor-pointer"
                  >
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
