import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  KeyRound,
  LogOut,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  User,
  Database,
  Trash2,
} from 'lucide-react';
import { AppState, UserProfile } from '../types';
import { exportToCSV, parseImportJSON, generateDemoState } from '../utils/storage';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface SettingsViewProps {
  state: AppState;
  userProfile?: UserProfile;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onLogout?: () => void;
  onResetAccount?: () => void;
  onRestoreState?: (newState: AppState) => void;
  onResetData?: () => void;
  onLockSession?: () => void;
  onRequestConfirm?: (config: {
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  userProfile,
  onUpdateUser,
  onLogout,
  onResetAccount,
  onRestoreState,
  onResetData,
  onLockSession,
  onRequestConfirm,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ message: string; success: boolean } | null>(null);

  // Security / PIN change state
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  // Profile Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNom, setEditNom] = useState(userProfile?.nom || state.userProfile?.nom || '');
  const [editPrenom, setEditPrenom] = useState(userProfile?.prenom || state.userProfile?.prenom || '');
  const [editNumero, setEditNumero] = useState(userProfile?.numero || state.userProfile?.numero || '');
  const [editEmail, setEditEmail] = useState(userProfile?.email || state.userProfile?.email || '');
  const [profileMessage, setProfileMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const currentUser = userProfile || state.userProfile;

  const handleExportJSON = async () => {
    try {
      await userService.exportUserData();
      setImportStatus({ message: 'Sauvegarde cloud exportée avec succès !', success: true });
      setTimeout(() => setImportStatus(null), 3000);
    } catch (err: any) {
      setImportStatus({ message: 'Erreur lors de l’export des données.', success: false });
    }
  };

  const handleExportCSV = () => {
    exportToCSV(state.transactions, state.categories);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseImportJSON(content);

      if (res.success && res.data) {
        if (onRequestConfirm) {
          onRequestConfirm({
            title: 'Restaurer la sauvegarde JSON',
            message:
              'Attention : Cette action va importer vos données locales. Voulez-vous continuer ?',
            confirmLabel: 'Restaurer',
            variant: 'danger',
            onConfirm: () => {
              if (onRestoreState) onRestoreState(res.data!);
              setImportStatus({
                message: 'Données restaurées avec succès !',
                success: true,
              });
              setTimeout(() => setImportStatus(null), 3000);
            },
          });
        } else if (onRestoreState) {
          onRestoreState(res.data);
          setImportStatus({ message: 'Données restaurées avec succès !', success: true });
          setTimeout(() => setImportStatus(null), 3000);
        }
      } else {
        setImportStatus({
          message: res.error || "Erreur lors de l'importation.",
          success: false,
        });
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          nom: editNom.trim(),
          prenom: editPrenom.trim(),
          numero: editNumero.trim(),
          email: editEmail.trim().toLowerCase(),
        });
      }
      setIsEditingProfile(false);
      setProfileMessage({ text: 'Profil mis à jour avec succès !' });
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err: any) {
      setProfileMessage({ text: err.message || 'Erreur lors de la mise à jour.', error: true });
    }
  };

  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (!currentUser) return;

    if (!newPin || !/^\d+$/.test(newPin)) {
      setPinError('Le code doit comporter uniquement des chiffres (0-9).');
      return;
    }

    if (newPin.length < 4 || newPin.length > 8) {
      setPinError('Le code doit comporter entre 4 et 8 chiffres.');
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinError('Les deux nouveaux codes ne correspondent pas.');
      return;
    }

    try {
      await authService.updatePin(newPin, oldPin || undefined);
      setPinSuccess('Code PIN mis à jour avec succès sur le serveur !');
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
      setIsEditingPin(false);
      setTimeout(() => setPinSuccess(null), 4000);
    } catch (err: any) {
      setPinError(err.message || 'Erreur lors de la mise à jour du code PIN.');
    }
  };

  const handleDeleteAccountAction = () => {
    if (onRequestConfirm) {
      onRequestConfirm({
        title: 'Supprimer définitivement le compte',
        message:
          'Attention : Cette action est irréversible. Toutes vos données cloud (transactions, budgets, épargnes, catégories) seront définitivement supprimées du serveur.',
        confirmLabel: 'Supprimer mon compte',
        variant: 'danger',
        onConfirm: async () => {
          try {
            await userService.deleteAccount();
            if (onLogout) onLogout();
          } catch (err: any) {
            alert(err.message || 'Erreur lors de la suppression du compte.');
          }
        },
      });
    }
  };

  return (
    <div className="wf-page animate-slideUp space-y-5">
      {/* Header */}
      <div>
        <h1 className="wf-title-page">Paramètres</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--wf-text-secondary)' }}>
          Gestion du profil, sécurité et sauvegarde cloud des données
        </p>
      </div>

      {/* Notifications / Alerts */}
      {importStatus && (
        <div
          className="p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-fadeIn"
          style={{
            background: importStatus.success ? 'var(--wf-success-soft)' : 'var(--wf-danger-soft)',
            color: importStatus.success ? 'var(--wf-success)' : 'var(--wf-danger)',
            borderColor: importStatus.success ? 'rgba(46,125,50,0.2)' : 'rgba(211,47,47,0.2)',
          }}
        >
          {importStatus.success ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span>{importStatus.message}</span>
        </div>
      )}

      {profileMessage && (
        <div
          className="p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-fadeIn"
          style={{
            background: !profileMessage.error ? 'var(--wf-success-soft)' : 'var(--wf-danger-soft)',
            color: !profileMessage.error ? 'var(--wf-success)' : 'var(--wf-danger)',
            borderColor: !profileMessage.error ? 'rgba(46,125,50,0.2)' : 'rgba(211,47,47,0.2)',
          }}
        >
          {!profileMessage.error ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span>{profileMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Colonne gauche : Profil & Sécurité */}
        <div className="space-y-5">
          {/* SECTION 1 : PROFIL UTILISATEUR */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="wf-title-section text-sm flex items-center gap-2">
                <User size={16} style={{ color: 'var(--wf-primary)' }} />
                <span>Profil Utilisateur</span>
              </h2>
              {currentUser && !isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs font-semibold flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--wf-primary)' }}
                >
                  <Edit2 size={13} />
                  <span>Modifier</span>
                </button>
              )}
            </div>

            <div className="liquid-card p-4 sm:p-5 space-y-4">
              {currentUser ? (
                <>
                  {!isEditingProfile ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: 'var(--wf-border)' }}>
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-extrabold text-white shadow-sm flex-shrink-0"
                          style={{ background: 'var(--wf-primary)' }}
                        >
                          {(currentUser.prenom?.[0] || 'W') + (currentUser.nom?.[0] || 'F')}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold truncate" style={{ color: 'var(--wf-text)' }}>
                            {currentUser.prenom} {currentUser.nom}
                          </h3>
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1"
                            style={{ background: 'var(--wf-success-soft)', color: 'var(--wf-success)' }}
                          >
                            <ShieldCheck size={12} />
                            Compte vérifié
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                        <div className="p-2.5 rounded-xl" style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}>
                          <span className="text-[10px] font-semibold uppercase tracking-wider block mb-0.5" style={{ color: 'var(--wf-text-tertiary)' }}>
                            Téléphone
                          </span>
                          <span className="font-semibold flex items-center gap-1.5 truncate" style={{ color: 'var(--wf-text)' }}>
                            <Phone size={13} style={{ color: 'var(--wf-primary)' }} />
                            {currentUser.numero || 'Non renseigné'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl" style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}>
                          <span className="text-[10px] font-semibold uppercase tracking-wider block mb-0.5" style={{ color: 'var(--wf-text-tertiary)' }}>
                            Email
                          </span>
                          <span className="font-semibold flex items-center gap-1.5 truncate" style={{ color: 'var(--wf-text)' }}>
                            <Mail size={13} style={{ color: 'var(--wf-primary)' }} />
                            {currentUser.email || 'Non renseigné'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="wf-label text-xs">Nom</label>
                          <input
                            type="text"
                            value={editNom}
                            onChange={(e) => setEditNom(e.target.value)}
                            className="wf-input text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="wf-label text-xs">Prénom</label>
                          <input
                            type="text"
                            value={editPrenom}
                            onChange={(e) => setEditPrenom(e.target.value)}
                            className="wf-input text-xs"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="wf-label text-xs">Téléphone</label>
                        <input
                          type="tel"
                          value={editNumero}
                          onChange={(e) => setEditNumero(e.target.value)}
                          className="wf-input text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="wf-label text-xs">Email</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="wf-input text-xs"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold btn-ghost"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="btn-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Save size={14} />
                          <span>Enregistrer</span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <p className="text-xs" style={{ color: 'var(--wf-text-tertiary)' }}>
                  Aucun profil utilisateur actif.
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2 : SÉCURITÉ & CODE PIN */}
          <div className="space-y-2.5">
            <h2 className="wf-title-section text-sm flex items-center gap-2">
              <Lock size={16} style={{ color: 'var(--wf-primary)' }} />
              <span>Sécurité d'accès rapide (PIN)</span>
            </h2>

            <div className="liquid-card p-4 sm:p-5 space-y-3">
              {pinSuccess && (
                <div
                  className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
                  style={{ background: 'var(--wf-success-soft)', color: 'var(--wf-success)' }}
                >
                  <Check size={15} />
                  <span>{pinSuccess}</span>
                </div>
              )}

              {pinError && (
                <div
                  className="p-3 rounded-xl text-xs font-semibold flex items-center gap-2"
                  style={{ background: 'var(--wf-danger-soft)', color: 'var(--wf-danger)' }}
                >
                  <AlertTriangle size={15} />
                  <span>{pinError}</span>
                </div>
              )}

              {!isEditingPin ? (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold block" style={{ color: 'var(--wf-text)' }}>
                      Code PIN de verrouillage
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--wf-text-tertiary)' }}>
                      Permet de verrouiller rapidement l'interface
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onLockSession && (
                      <button
                        onClick={onLockSession}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold btn-ghost flex items-center gap-1.5 touch-target"
                      >
                        <Lock size={13} />
                        <span>Verrouiller</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditingPin(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold btn-primary flex items-center gap-1.5 touch-target"
                    >
                      <KeyRound size={13} />
                      <span>Modifier PIN</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveNewPin} className="space-y-3 pt-1">
                  <div>
                    <label className="wf-label text-[11px]">Ancien code PIN (si configuré)</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ancien code PIN"
                      className="wf-input font-mono font-bold text-center text-xs py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="wf-label text-[11px]">Nouveau PIN</label>
                      <input
                        type={showNewPin ? 'text' : 'password'}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Nouveau PIN"
                        className="wf-input font-mono font-bold text-center text-xs py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="wf-label text-[11px]">Confirmer</label>
                      <input
                        type={showNewPin ? 'text' : 'password'}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={confirmNewPin}
                        onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Confirmer PIN"
                        className="wf-input font-mono font-bold text-center text-xs py-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="text-[11px] flex items-center gap-1 font-medium"
                      style={{ color: 'var(--wf-text-secondary)' }}
                    >
                      {showNewPin ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showNewPin ? 'Masquer' : 'Afficher'}</span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingPin(false);
                          setPinError(null);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold btn-ghost"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="btn-primary px-3 py-1 text-xs font-semibold flex items-center gap-1"
                      >
                        <Save size={13} />
                        <span>Sauver</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite : Données, Sauvegarde, Session & Suppression */}
        <div className="space-y-5">
          {/* SECTION 3 : DONNÉES & SAUVEGARDE */}
          <div className="space-y-2.5">
            <h2 className="wf-title-section text-sm flex items-center gap-2">
              <Database size={16} style={{ color: 'var(--wf-primary)' }} />
              <span>Données & Sauvegarde Cloud</span>
            </h2>

            {/* Statistiques du compte */}
            <div className="liquid-card p-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--wf-text-tertiary)' }}>
                Volume enregistré
              </span>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg" style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}>
                  <span className="text-[10px] block" style={{ color: 'var(--wf-text-tertiary)' }}>Flux</span>
                  <strong className="text-sm font-bold tabular-nums" style={{ color: 'var(--wf-text)' }}>
                    {state.transactions.length}
                  </strong>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}>
                  <span className="text-[10px] block" style={{ color: 'var(--wf-text-tertiary)' }}>Budgets</span>
                  <strong className="text-sm font-bold tabular-nums" style={{ color: 'var(--wf-text)' }}>
                    {Object.keys(state.budgets).length}
                  </strong>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}>
                  <span className="text-[10px] block" style={{ color: 'var(--wf-text-tertiary)' }}>Épargne</span>
                  <strong className="text-sm font-bold tabular-nums" style={{ color: 'var(--wf-text)' }}>
                    {state.savingsGoals.length}
                  </strong>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}>
                  <span className="text-[10px] block" style={{ color: 'var(--wf-text-tertiary)' }}>Catégories</span>
                  <strong className="text-sm font-bold tabular-nums" style={{ color: 'var(--wf-text)' }}>
                    {state.categories.length}
                  </strong>
                </div>
              </div>
            </div>

            {/* Exporter & Importer */}
            <div className="liquid-card p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--wf-text-tertiary)' }}>
                Export & Sauvegarde
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportJSON}
                  className="p-3 rounded-xl text-left transition-all flex items-center gap-2.5 touch-target hover:opacity-90"
                  style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
                >
                  <FileCode size={18} style={{ color: 'var(--wf-primary)' }} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate" style={{ color: 'var(--wf-text)' }}>Export Cloud JSON</span>
                    <span className="text-[10px]" style={{ color: 'var(--wf-text-tertiary)' }}>Sauvegarde complète</span>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="p-3 rounded-xl text-left transition-all flex items-center gap-2.5 touch-target hover:opacity-90"
                  style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
                >
                  <FileSpreadsheet size={18} style={{ color: 'var(--wf-success)' }} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate" style={{ color: 'var(--wf-text)' }}>Export CSV</span>
                    <span className="text-[10px]" style={{ color: 'var(--wf-text-tertiary)' }}>Excel / Tableur</span>
                  </div>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 btn-ghost touch-target"
              >
                <Upload size={14} style={{ color: 'var(--wf-primary)' }} />
                <span>Importer un fichier JSON</span>
              </button>
            </div>
          </div>

          {/* SECTION 4 : SESSION & SUPPRESSION DU COMPTE */}
          <div className="space-y-2.5">
            <h2 className="wf-title-section text-sm flex items-center gap-2">
              <LogOut size={16} style={{ color: 'var(--wf-danger)' }} />
              <span>Session & Compte</span>
            </h2>

            <div className="liquid-card p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b" style={{ borderColor: 'var(--wf-border)' }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--wf-text)' }}>
                    Déconnexion
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--wf-text-tertiary)' }}>
                    Fermer la session sur cet appareil
                  </p>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestConfirm) {
                        onRequestConfirm({
                          title: 'Déconnexion',
                          message: 'Voulez-vous vous déconnecter de votre session actuelle ?',
                          confirmLabel: 'Se déconnecter',
                          variant: 'warning',
                          onConfirm: onLogout,
                        });
                      } else {
                        onLogout();
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 touch-target"
                    style={{
                      background: 'var(--wf-surface-soft)',
                      color: 'var(--wf-text)',
                      border: '1px solid var(--wf-border)',
                    }}
                  >
                    <LogOut size={13} />
                    <span>Se déconnecter</span>
                  </button>
                )}
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--wf-danger)' }}>
                    Supprimer mon compte
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--wf-text-tertiary)' }}>
                    Effacer définitivement toutes mes données du serveur
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDeleteAccountAction}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 touch-target"
                  style={{
                    background: 'var(--wf-danger-soft)',
                    color: 'var(--wf-danger)',
                    border: '1px solid rgba(211,47,47,0.2)',
                  }}
                >
                  <Trash2 size={13} />
                  <span>Supprimer compte</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
