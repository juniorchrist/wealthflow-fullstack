import { prisma } from '../lib/prisma';

const DEFAULT_TERMS = `# Conditions Générales d'Utilisation (CGU) - WealthFlow

Bienvenue sur WealthFlow. En utilisant notre application de gestion financière, vous acceptez les présentes conditions :

1. **Objet du service** : WealthFlow fournit des outils d'analyse budgétaire, de suivi des dépenses et d'optimisation de l'épargne personnelle.
2. **Responsabilité de l'utilisateur** : Vous êtes seul responsable de la confidentialité de vos identifiants et code PIN de verrouillage.
3. **Usage autorisé** : Toute tentative d'accès frauduleux, d'automatisation non autorisée ou de perturbation des serveurs entraînera la résiliation immédiate et le bannissement du compte.
4. **Données financières** : Vos données vous appartiennent. WealthFlow ne vend ni ne cède vos informations à des tiers.
5. **Modification des conditions** : L'administration se réserve le droit d'ajuster les présentes règles pour garantir la sécurité et la conformité de la plateforme.`;

const DEFAULT_PRIVACY = `# Politique de Confidentialité - WealthFlow

La protection de votre vie privée et de vos données financières est notre priorité absolue :

1. **Données collectées** : Nom, prénom, adresse email, numéro de téléphone (optionnel), devises et transactions financières enregistrées manuellement ou importées.
2. **Sécurité et Chiffrement** : Vos mots de passe et codes PIN sont hachés de manière irréversible avec bcrypt. Les connexions sont sécurisées par chiffrement TLS/HTTPS.
3. **Utilisation des données** : Vos transactions et budgets servent exclusivement à générer vos graphiques, alertes et scores de santé financière.
4. **Suppression et Portabilité** : Vous disposez d'un droit total d'exportation (format JSON) et de suppression de vos données sur simple demande ou depuis votre compte.
5. **Contact DPO / Support** : Pour toute question relative à vos données, contactez notre support via le Centre d'aide.`;

export const getOrCreateSystemSettings = async () => {
  let settings = await prisma.systemSetting.findUnique({
    where: { id: 'system_config' },
  });

  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: {
        id: 'system_config',
        maintenanceMode: false,
        maintenanceMessage: 'WealthFlow est temporairement en maintenance pour une mise à niveau technique. Nous serons de retour très rapidement !',
        termsOfService: DEFAULT_TERMS,
        privacyPolicy: DEFAULT_PRIVACY,
        supportEmail: 'support@wealthflow.app',
        supportPhone: '+225 07 00 00 00 00',
      },
    });
  }

  return settings;
};

export const updateSystemSettings = async (data: {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  termsOfService?: string;
  privacyPolicy?: string;
  supportEmail?: string;
  supportPhone?: string;
}) => {
  // S'assurer que le record existe
  await getOrCreateSystemSettings();

  const updated = await prisma.systemSetting.update({
    where: { id: 'system_config' },
    data: {
      ...(typeof data.maintenanceMode === 'boolean' ? { maintenanceMode: data.maintenanceMode } : {}),
      ...(data.maintenanceMessage !== undefined ? { maintenanceMessage: data.maintenanceMessage } : {}),
      ...(data.termsOfService !== undefined ? { termsOfService: data.termsOfService } : {}),
      ...(data.privacyPolicy !== undefined ? { privacyPolicy: data.privacyPolicy } : {}),
      ...(data.supportEmail !== undefined ? { supportEmail: data.supportEmail } : {}),
      ...(data.supportPhone !== undefined ? { supportPhone: data.supportPhone } : {}),
    },
  });

  return updated;
};
