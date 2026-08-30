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
} from 'lucide-react';
import { AppState, UserProfile } from '../types';
import { exportToJSON, exportToCSV, parseImportJSON, generateDemoState } from '../utils/storage';

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

  const currentUser = userProfile || state.userProfile;

  const handleExportJSON = () => {
    exportToJSON(state);
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
              'Attention : Cette action va remplacer vos données actuelles par le fichier importé. Voulez-vous continuer ?',
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

  const handleLoadDemo = () => {
    const action = () => {
      const demoState = generateDemoState();
      if (onRestoreState) onRestoreState(demoState);
      setImportStatus({
        message: 'Données de test chargées avec succès !',
        success: true,
      });
      setTimeout(() => setImportStatus(null), 3000);
    };

    if (onRequestConfirm) {
      onRequestConfirm({
        title: 'Charger les données de test',
        message: 'Voulez-vous charger un jeu complet de test ? Cela remplacera les données locales actuelles.',
        confirmLabel: 'Charger',
        variant: 'primary',
        onConfirm: action,
      });
    } else {
      action();
    }
  };

  const handleReset = () => {
    const action = () => {
      if (onResetData) onResetData();
      setImportStatus({
        message: 'Stockage local réinitialisé.',
        success: true,
      });
      setTimeout(() => setImportStatus(null), 3000);
    };

    if (onRequestConfirm) {
      onRequestConfirm({
        title: 'Réinitialiser les données',
        message: 'Êtes-vous sûr de vouloir supprimer toutes vos transactions, budgets et objectifs ?',
        confirmLabel: 'Tout effacer',
        variant: 'danger',
        onConfirm: action,
      });
    } else {
      action();
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (!currentUser) return;

    if (oldPin !== currentUser.mdp) {
      setPinError("L'ancien code PIN est incorrect.");
      return;
    }

    if (!newPin || !/^\d+$/.test(newPin)) {
      setPinError('Le code doit comporter uniquement des chiffres.');
      return;
    }

    if (newPin.length < 4) {
      setPinError('Le code doit comporter au moins 4 chiffres.');
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinError('Les deux nouveaux codes ne correspondent pas.');
      return;
    }

    if (onUpdateUser) {
      onUpdateUser({
        ...currentUser,
        mdp: newPin,
      });
      setPinSuccess('Code PIN mis à jour avec succès !');
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
      setIsEditingPin(false);
      setTimeout(() => setPinSuccess(null), 4000);
    }
  };

  return (
    <div className="wf-page animate-slideUp space-y-5">
      {/* Header */}
      <div>
        <h1 className="wf-title-page">Paramètres</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--wf-text-secondary)' }}>
          Gestion du profil, sécurité et sauvegarde des données
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

      {pinSuccess && (
        <div
          className="p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-fadeIn"
          style={{
            background: 'var(--wf-success-soft)',
            color: 'var(--wf-success)',
            borderColor: 'rgba(46,125,50,0.2)',
          }}
        >
          <Check size={16} />
          <span>{pinSuccess}</span>
        </div>
      )}

      {/* Responsive 2-column layout on tablet & desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* Colonne gauche : Compte & Sécurité */}
        <div className="space-y-5">
          {/* SECTION 1 : COMPTE & PROFIL */}
          <div className="space-y-2.5">
            <h2 className="wf-title-section text-sm flex items-center gap-2">
              <User size={16} style={{ color: 'var(--wf-primary)' }} />
              <span>Compte & Profil</span>
            </h2>

            {currentUser ? (
              <div className="liquid-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-sm flex-shrink-0"
                    style={{ background: 'var(--wf-primary)' }}
                  >
                    {((currentUser.prenom?.[0] || '') + (currentUser.nom?.[0] || '')).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate" style={{ color: 'var(--wf-text)' }}>
                      {currentUser.prenom} {currentUser.nom}
                    </h3>
                    <div className="flex flex-col text-xs mt-0.5 space-y-0.5" style={{ color: 'var(--wf-text-secondary)' }}>
                      {currentUser.email && (
                        <span className="flex items-center gap-1.5 truncate text-[11px]">
                          <Mail size={12} style={{ color: 'var(--wf-text-tertiary)' }} />
                          {currentUser.email}
                        </span>
                      )}
                      {currentUser.numero && (
                        <span className="flex items-center gap-1.5 truncate text-[11px]">
                          <Phone size={12} style={{ color: 'var(--wf-text-tertiary)' }} />
                          {currentUser.numero}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="pt-2.5 border-t flex items-center justify-between text-[11px]"
                  style={{ borderColor: 'var(--wf-border)', color: 'var(--wf-text-tertiary)' }}
                >
                  <span>Inscrit le {new Date(currentUser.registeredAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ) : (
              <div className="liquid-card p-4 text-center text-xs" style={{ color: 'var(--wf-text-tertiary)' }}>
                Aucun profil utilisateur enregistré.
              </div>
            )}
          </div>

          {/* SECTION 2 : SÉCURITÉ */}
          <div className="space-y-2.5">
            <h2 className="wf-title-section text-sm flex items-center gap-2">
              <ShieldCheck size={16} style={{ color: 'var(--wf-primary)' }} />
              <span>Sécurité</span>
            </h2>

            <div className="liquid-card p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--wf-text)' }}>
                    Verrouillage de session
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--wf-text-tertiary)' }}>
                    Code PIN numérique à 4+ chiffres
                  </p>
                </div>

                {onLockSession && (
                  <button
                    type="button"
                    onClick={onLockSession}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 touch-target"
                    style={{
                      background: 'var(--wf-surface-soft)',
                      color: 'var(--wf-text)',
                      border: '1px solid var(--wf-border)',
                    }}
                  >
                    <Lock size={13} />
                    <span>Verrouiller</span>
                  </button>
                )}
              </div>

              {/* Modifier le code PIN */}
              {currentUser && (
                <div className="pt-2.5 border-t" style={{ borderColor: 'var(--wf-border)' }}>
                  {!isEditingPin ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--wf-text-secondary)' }}>
                        <KeyRound size={14} style={{ color: 'var(--wf-text-tertiary)' }} />
                        <span>Code d'accès : <strong className="font-mono text-xs tracking-wider">••••••</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingPin(true)}
                        className="text-xs font-bold flex items-center gap-1 transition-colors touch-target"
                        style={{ color: 'var(--wf-primary)' }}
                      >
                        <Edit2 size={12} />
                        <span>Modifier</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveNewPin} className="p-3 rounded-xl space-y-2.5 mt-1" style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--wf-text)' }}>
                          <KeyRound size={13} style={{ color: 'var(--wf-primary)' }} />
                          <span>Nouveau code PIN</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPin(false);
                            setPinError(null);
                          }}
                          style={{ color: 'var(--wf-text-tertiary)' }}
                        >
                          <X size={15} />
                        </button>
                      </div>

                      {pinError && (
                        <div
                          className="p-2 rounded-lg text-xs font-semibold border"
                          style={{
                            background: 'var(--wf-danger-soft)',
                            color: 'var(--wf-danger)',
                            borderColor: 'rgba(211,47,47,0.2)',
                          }}
                        >
                          {pinError}
                        </div>
                      )}

                      <div>
                        <label className="wf-label text-[11px]">Ancien code</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={oldPin}
                          onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="Code actuel"
                          className="wf-input font-mono font-bold text-center text-xs py-2"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="wf-label text-[11px]">Nouveau code</label>
                          <input
                            type={showNewPin ? 'text' : 'password'}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="Nouveau"
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
                            placeholder="Confirmer"
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
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite : Données, Export, Session */}
        <div className="space-y-5">
          {/* SECTION 3 : DONNÉES & SAUVEGARDE */}
          <div className="space-y-2.5">
            <h2 className="wf-title-section text-sm flex items-center gap-2">
              <Database size={16} style={{ color: 'var(--wf-primary)' }} />
              <span>Données & Sauvegarde</span>
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
                Export / Import
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportJSON}
                  className="p-3 rounded-xl text-left transition-all flex items-center gap-2.5 touch-target"
                  style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
                >
                  <FileCode size={18} style={{ color: 'var(--wf-primary)' }} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate" style={{ color: 'var(--wf-text)' }}>JSON</span>
                    <span className="text-[10px]" style={{ color: 'var(--wf-text-tertiary)' }}>Sauvegarde</span>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="p-3 rounded-xl text-left transition-all flex items-center gap-2.5 touch-target"
                  style={{ background: 'var(--wf-surface-soft)', border: '1px solid var(--wf-border)' }}
                >
                  <FileSpreadsheet size={18} style={{ color: 'var(--wf-success)' }} className="flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate" style={{ color: 'var(--wf-text)' }}>CSV</span>
                    <span className="text-[10px]" style={{ color: 'var(--wf-text-tertiary)' }}>Excel/Sheets</span>
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

            {/* Maintenance */}
            <div className="liquid-card p-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--wf-text-tertiary)' }}>
                Maintenance
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleLoadDemo}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 btn-ghost touch-target"
                >
                  <Sparkles size={14} style={{ color: 'var(--wf-primary)' }} />
                  <span>Données démo</span>
                </button>

                <button
                  onClick={handleReset}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-target"
                  style={{
                    background: 'var(--wf-danger-soft)',
                    color: 'var(--wf-danger)',
                    border: '1px solid rgba(211,47,47,0.2)',
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Effacer données</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4 : SESSION & DÉCONNEXION */}
          {(onLogout || onResetAccount) && (
            <div className="space-y-2.5">
              <h2 className="wf-title-section text-sm flex items-center gap-2">
                <LogOut size={16} style={{ color: 'var(--wf-danger)' }} />
                <span>Session</span>
              </h2>

              <div className="liquid-card p-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--wf-text)' }}>
                    Déconnexion
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--wf-text-tertiary)' }}>
                    Quitter la session active
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
                      background: 'var(--wf-danger-soft)',
                      color: 'var(--wf-danger)',
                      border: '1px solid rgba(211,47,47,0.2)',
                    }}
                  >
                    <LogOut size={13} />
                    <span>Se déconnecter</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
