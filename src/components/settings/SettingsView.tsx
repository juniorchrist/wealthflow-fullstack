import React, { useState } from 'react';
import {
  Bell,
  ChevronRight,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import { useWealth } from '../../context/WealthContext';
import { BrandLogo } from '../common/BrandLogo';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    changePin,
    lockApp,
    logout,
    setActiveTab,
  } = useWealth();

  const [activeSection, setActiveSection] = useState<'profile' | 'security'>('profile');

  // Form states — Profil
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [saved, setSaved] = useState(false);

  // Form states — PIN
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<{ message: string; isError: boolean } | null>(null);

  const userInitials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'WF';

  const handleSaveProfile = () => {
    updateUserProfile({ name, email, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePinChange = () => {
    if (newPin.length !== 4) {
      setPinMessage({ message: 'Le code PIN doit comporter 4 chiffres', isError: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage({ message: 'La confirmation ne correspond pas', isError: true });
      return;
    }
    const success = changePin(oldPin, newPin);
    if (success) {
      setPinMessage({ message: 'Code PIN mis à jour avec succès', isError: false });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinMessage(null), 3000);
    } else {
      setPinMessage({ message: 'Ancien code PIN incorrect', isError: true });
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-4 pb-6 border-b border-[#E8E8E8]">
        <div className="w-20 h-20 rounded-full bg-[#18181B] text-white flex items-center justify-center text-2xl font-bold">
          {userInitials}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#18181B]">{userProfile.name}</h2>
          <p className="text-sm text-[#6F6F73]">{userProfile.email}</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
          Informations personnelles
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#6F6F73] mb-1">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#FF5330]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6F6F73] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#FF5330]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6F6F73] mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#FF5330]"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full py-2 bg-[#FF5330] text-white font-bold text-sm rounded-lg transition-colors"
        >
          {saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">Sécurité</h3>

      {/* PIN Change */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#6F6F73] mb-1">Ancien code PIN</label>
          <input
            type="password"
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            maxLength={4}
            className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#FF5330]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6F6F73] mb-1">Nouveau code PIN</label>
          <input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            maxLength={4}
            className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#FF5330]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6F6F73] mb-1">
            Confirmer le nouveau code PIN
          </label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            maxLength={4}
            className="w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#FF5330]"
          />
        </div>

        {pinMessage && (
          <p className={`text-xs ${pinMessage.isError ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
            {pinMessage.message}
          </p>
        )}

        <button
          onClick={handlePinChange}
          className="w-full py-2 bg-[#FF5330] text-white font-bold text-sm rounded-lg transition-colors"
        >
          Modifier le code PIN
        </button>
      </div>

      {/* Lock App */}
      <div className="pt-4 border-t border-[#E8E8E8]">
        <button
          onClick={lockApp}
          className="w-full flex items-center justify-center space-x-2 py-2 border border-[#E8E8E8] rounded-lg text-sm font-medium text-[#6F6F73] transition-colors"
        >
          <Lock className="w-4 h-4" />
          <span>Verrouiller l'application</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:p-0">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between mb-6">
        <BrandLogo size="md" showBadge={false} withDarkContainer={false} useOfficialLogo={true} />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#18181B]">Mon Profil</h1>
        <BrandLogo size="lg" showBadge={false} withDarkContainer={false} useOfficialLogo={true} />
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Navigation — sans Préférences */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'profile'
                ? 'bg-[#FF5330]/10 text-[#FF5330]'
                : 'text-[#6F6F73]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil</span>
          </button>

          <button
            onClick={() => setActiveSection('security')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'security'
                ? 'bg-[#FF5330]/10 text-[#FF5330]'
                : 'text-[#6F6F73]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Sécurité</span>
          </button>

          <div className="pt-4 border-t border-[#E8E8E8]">
            <button
              onClick={() => setActiveTab('notifications')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6F6F73] transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6F6F73] transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Analyses</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6F6F73] transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              <span>Catégories</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#E8E8E8]">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-[#EF4444] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {activeSection === 'profile' && renderProfileSection()}
          {activeSection === 'security' && renderSecuritySection()}
        </div>
      </div>
    </div>
  );
};
