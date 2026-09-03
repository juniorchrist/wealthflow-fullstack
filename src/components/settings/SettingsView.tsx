import React, { useState } from 'react';
import {
  Award,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Phone,
  PiggyBank,
  QrCode,
  RefreshCw,
  Save,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    changePin,
    lockApp,
    simulateLoading,
    exportDataJSON,
    resetAllData,
    formatCurrency,
    totalSaved,
    totalBalance,
    savingsRate,
    transactions,
    savingsGoals,
  } = useWealth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'badges' | 'preferences' | 'data'>('profile');

  // Form states for profile
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [currency, setCurrency] = useState(userProfile.currency || 'FCFA');
  const [language, setLanguage] = useState(userProfile.language || 'Français');
  const [timezone, setTimezone] = useState(userProfile.timezone || 'GMT +00:00');
  const [dateFormat, setDateFormat] = useState(userProfile.dateFormat || 'DD/MM/YYYY');
  const [occupation, setOccupation] = useState('Entrepreneur & Cadre');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState('Wave / Orange Money');
  const [annualSavingsTarget, setAnnualSavingsTarget] = useState('5000000');

  // PIN change state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinFeedback, setPinFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  // Gamification & Badges
  const badges = [
    {
      id: 'b1',
      title: 'Grand Épargnant',
      description: 'Avoir plus de 1 000 000 FCFA épargnés',
      unlocked: totalSaved >= 1000000,
      icon: <PiggyBank className="w-5 h-5 text-[#FF5330]" />,
      date: 'Obtenu en Août 2026',
    },
    {
      id: 'b2',
      title: 'Tirelire d’Or',
      description: 'Avoir complété au moins 50% d’une tirelire',
      unlocked: savingsGoals.some((g) => (g.currentAmount / g.targetAmount) >= 0.5),
      icon: <Target className="w-5 h-5 text-[#10B981]" />,
      date: 'Obtenu en Septembre 2026',
    },
    {
      id: 'b3',
      title: 'Maître du Budget',
      description: 'Taux d’épargne supérieur à 30%',
      unlocked: savingsRate >= 30,
      icon: <TrendingUp className="w-5 h-5 text-[#3B82F6]" />,
      date: 'Actif en continu',
    },
    {
      id: 'b4',
      title: 'Sécurité Maximale',
      description: 'Code PIN configuré et session active',
      unlocked: true,
      icon: <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />,
      date: 'Actif',
    },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      phone,
      currency,
      language,
      timezone,
      dateFormat,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setPinFeedback({ message: 'Le nouveau code PIN doit comporter exactement 4 chiffres.', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinFeedback({ message: 'La confirmation du nouveau code PIN ne correspond pas.', isError: true });
      return;
    }
    const success = changePin(oldPin, newPin);
    if (success) {
      setPinFeedback({ message: 'Votre code PIN a été mis à jour avec succès !', isError: false });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinFeedback(null), 3500);
    } else {
      setPinFeedback({ message: 'L’ancien code PIN est incorrect.', isError: true });
    }
  };

  // CSV Export helper
  const exportTransactionsCSV = () => {
    const headers = ['Date', 'Heure', 'Titre', 'Catégorie', 'Type', 'Montant (FCFA)', 'Compte', 'Notes'];
    const rows = transactions.map((t) => [
      t.date,
      t.time,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.type,
      t.amount,
      `"${t.account}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WealthFlow_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="settings-view" className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* 1. HERO PROFILE IDENTITY CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-[#121214] border border-[#27272A] p-3.5 sm:p-5 text-white shadow-md">
        {/* Subtle Decorative Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5330]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#FF5330] to-[#FF8A65] p-0.5 shadow-lg">
                <div className="w-full h-full rounded-[14px] bg-[#18181B] flex items-center justify-center font-black text-xl text-white">
                  {userProfile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'WF'}
                </div>
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#121214]"
                title="Compte actif & synchronisé"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-white truncate">
                  {userProfile.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF5330] text-white tracking-wider uppercase">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>VIP PRO</span>
                </span>
              </div>
              <p className="text-xs text-white/70 truncate mt-0.5">{userProfile.email}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/60">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Protection 256-bit</span>
                </span>
                <span>•</span>
                <span>Membre depuis 2026</span>
              </div>
            </div>
          </div>

          {/* Quick Financial Snapshot Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white/5 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/10 self-stretch md:self-auto">
            <div className="text-center px-1">
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider block">Santé</span>
              <span className="text-sm sm:text-base font-black text-[#10B981] num-tabular">88/100</span>
              <span className="text-[9px] text-white/50 block">Excellente</span>
            </div>
            <div className="text-center px-1 border-x border-white/10">
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider block">Épargne</span>
              <span className="text-sm sm:text-base font-black text-[#FF5330] num-tabular">{savingsRate}%</span>
              <span className="text-[9px] text-white/50 block">Du revenu</span>
            </div>
            <div className="text-center px-1">
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider block">Tirelires</span>
              <span className="text-sm sm:text-base font-black text-white num-tabular">{savingsGoals.length}</span>
              <span className="text-[9px] text-white/50 block">Actives</span>
            </div>
          </div>
        </div>

        {/* Quick Action Footer in Hero */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Données locales chiffrées & synchronisées</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={lockApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verrouiller</span>
            </button>
            <button
              onClick={exportDataJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5330] hover:bg-[#E84524] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b border-[#E8E8E8] pb-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-[#18181B] text-white shadow-2xs'
              : 'text-[#6F6F73] hover:text-[#18181B] hover:bg-[#F7F7F7]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profil & Identité</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-[#18181B] text-white shadow-2xs'
              : 'text-[#6F6F73] hover:text-[#18181B] hover:bg-[#F7F7F7]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Sécurité & PIN</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'badges'
              ? 'bg-[#18181B] text-white shadow-2xs'
              : 'text-[#6F6F73] hover:text-[#18181B] hover:bg-[#F7F7F7]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Badges & VIP</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-[#18181B] text-white shadow-2xs'
              : 'text-[#6F6F73] hover:text-[#18181B] hover:bg-[#F7F7F7]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Préférences</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'data'
              ? 'bg-[#18181B] text-white shadow-2xs'
              : 'text-[#6F6F73] hover:text-[#18181B] hover:bg-[#F7F7F7]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Sauvegarde & Données</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="rounded-xl bg-white border border-[#E8E8E8] p-4 sm:p-6 shadow-2xs">
        {/* TAB 1: PROFIL & IDENTITÉ */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#18181B]">Informations Personnelles</h3>
                <p className="text-xs text-[#6F6F73]">Mettez à jour vos coordonnées et paramètres d’utilisateur</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#10B981]/10 text-[#10B981]">
                Compte Vérifié
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Nom complet</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330]"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Adresse email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330]"
                    placeholder="nom@exemple.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330]"
                    placeholder="+225 07 00 00 00 00"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Activité / Profession</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330]"
                  placeholder="Ex: Consultant, Commerçant..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Fournisseur Mobile Money favori</label>
                <input
                  type="text"
                  value={mobileMoneyProvider}
                  onChange={(e) => setMobileMoneyProvider(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330]"
                  placeholder="Wave / Orange / MTN / Moov"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Objectif Annuel d’Épargne (FCFA)</label>
                <input
                  type="number"
                  value={annualSavingsTarget}
                  onChange={(e) => setAnnualSavingsTarget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm text-[#18181B] font-semibold focus:outline-none focus:border-[#FF5330]"
                  placeholder="5000000"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-[#F0F0F0]">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF5330] hover:bg-[#E84524] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer mon profil</span>
              </button>
              {profileSaved && (
                <span className="text-xs font-bold text-[#10B981] flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Modifications sauvegardées avec succès !</span>
                </span>
              )}
            </div>
          </form>
        )}

        {/* TAB 2: SÉCURITÉ & PIN */}
        {activeTab === 'security' && (
          <div className="space-y-5 max-w-xl">
            <div className="border-b border-[#F0F0F0] pb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-[#18181B]">Code PIN & Protection</h3>
              <p className="text-xs text-[#6F6F73]">
                Sécurisez vos données financières avec un code PIN à 4 chiffres
              </p>
            </div>

            <form onSubmit={handlePinChangeSubmit} className="p-4 sm:p-5 rounded-2xl bg-[#FAFAFA] border border-[#E8E8E8] space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#18181B]">
                <KeyRound className="w-4 h-4 text-[#FF5330]" />
                <span>Modifier mon Code PIN (4 chiffres)</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F6F73] block mb-1">
                  Ancien code PIN (défaut : 1234)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8E8E8] text-sm text-center font-bold tracking-widest focus:outline-none focus:border-[#FF5330]"
                  placeholder="••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#6F6F73] block mb-1">Nouveau code PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8E8E8] text-sm text-center font-bold tracking-widest focus:outline-none focus:border-[#FF5330]"
                    placeholder="••••"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#6F6F73] block mb-1">Confirmer PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8E8E8] text-sm text-center font-bold tracking-widest focus:outline-none focus:border-[#FF5330]"
                    placeholder="••••"
                  />
                </div>
              </div>

              {pinFeedback && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-bold ${
                    pinFeedback.isError ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#10B981]/10 text-[#10B981]'
                  }`}
                >
                  {pinFeedback.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Mettre à jour le code PIN
              </button>
            </form>

            <div className="p-4 rounded-xl bg-[#FFF8F6] border border-[#FF5330]/20 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B]">Verrouillage immédiat (Code PIN)</h4>
                <p className="text-xs text-[#6F6F73]">Affiche la page de verrouillage avec pavé tactile et biométrie</p>
              </div>
              <button
                onClick={lockApp}
                className="px-3.5 py-2 rounded-xl bg-[#EF4444] text-white font-bold text-xs hover:bg-[#DC2626] transition-colors cursor-pointer flex-shrink-0"
              >
                Verrouiller
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/20 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B]">Écran de Chargement / Splash</h4>
                <p className="text-xs text-[#6F6F73]">Visualiser la séquence de démarrage et d'initialisation chiffrée</p>
              </div>
              <button
                onClick={() => simulateLoading(1600, 'Synchronisation des flux financiers...')}
                className="px-3.5 py-2 rounded-xl bg-[#10B981] text-white font-bold text-xs hover:bg-[#059669] transition-colors cursor-pointer flex-shrink-0"
              >
                Tester
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: BADGES & VIP */}
        {activeTab === 'badges' && (
          <div className="space-y-5">
            <div className="border-b border-[#F0F0F0] pb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-[#18181B]">Réussites & Badges Débloqués</h3>
              <p className="text-xs text-[#6F6F73]">
                Suivez vos accomplissements dans la gestion de votre patrimoine financier
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    b.unlocked
                      ? 'bg-white border-[#E8E8E8] shadow-2xs hover:border-[#FF5330]/40'
                      : 'bg-[#FAFAFA] border-[#E8E8E8]/60 opacity-60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      b.unlocked ? 'bg-[#FAFAFA] border border-[#E8E8E8]' : 'bg-[#F0F0F0]'
                    }`}
                  >
                    {b.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B] truncate">{b.title}</h4>
                      {b.unlocked ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#10B981]/10 text-[#10B981]">
                          Débloqué
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#71717A]/10 text-[#71717A]">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6F6F73] mt-0.5">{b.description}</p>
                    <p className="text-[10px] text-[#A1A1AA] mt-1">{b.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PRÉFÉRENCES */}
        {activeTab === 'preferences' && (
          <div className="space-y-4 max-w-xl">
            <div className="border-b border-[#F0F0F0] pb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-[#18181B]">Préférences Régionales & Affichage</h3>
              <p className="text-xs text-[#6F6F73]">Configurez votre devise et vos préférences d’utilisation</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Devise principale</label>
                <select
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    updateUserProfile({ currency: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
                >
                  <option value="FCFA">FCFA — Franc CFA (UEMOA / CEMAC)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="USD">USD — Dollar ($)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Langue de l’application</label>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    updateUserProfile({ language: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
                >
                  <option value="Français">Français (Intégral)</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18181B] block mb-1">Fuseau horaire</label>
                <select
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value);
                    updateUserProfile({ timezone: e.target.value });
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] text-xs sm:text-sm font-semibold text-[#18181B] focus:outline-none focus:border-[#FF5330]"
                >
                  <option value="GMT +00:00">GMT +00:00 (Abidjan, Dakar, Bamako, Ouaga, Londres)</option>
                  <option value="GMT +01:00">GMT +01:00 (Paris, Douala, Yaoundé, Libreville, Cotonou)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SAUVEGARDE & DONNÉES */}
        {activeTab === 'data' && (
          <div className="space-y-4 max-w-xl">
            <div className="border-b border-[#F0F0F0] pb-3">
              <h3 className="font-extrabold text-sm sm:text-base text-[#18181B]">Gestion des Données & Export</h3>
              <p className="text-xs text-[#6F6F73]">
                Téléchargez vos sauvegardes ou réinitialisez les données de l’application
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] flex items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B]">Sauvegarde intégrale (JSON)</h4>
                <p className="text-xs text-[#6F6F73]">Téléchargez budgets, tirelires et transactions au format JSON</p>
              </div>
              <button
                onClick={exportDataJSON}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] flex items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#18181B]">Tableau Excel / Transactions (CSV)</h4>
                <p className="text-xs text-[#6F6F73]">Exportez la liste des flux financiers pour votre comptabilité</p>
              </div>
              <button
                onClick={exportTransactionsCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs transition-colors cursor-pointer flex-shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exporter CSV</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#EF4444]/20 flex items-center justify-between gap-3 mt-4">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[#EF4444]">Réinitialisation de l’application</h4>
                <p className="text-xs text-[#6F6F73]">Restaure les données de démonstration d’origine</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Voulez-vous vraiment réinitialiser toutes les données de WealthFlow ?')) {
                    resetAllData();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs transition-colors cursor-pointer flex-shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
