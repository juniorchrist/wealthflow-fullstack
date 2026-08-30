import { AppState, ExpenseOptimizationItem, InvestmentProduct, AllocationProfile } from '../types';
import { getCategoryBreakdown } from './analytics';

export const INVESTMENT_PRODUCTS: InvestmentProduct[] = [
  {
    id: 'fcp-monetaire',
    name: 'FCP / SICAV Monétaire & Obligataire',
    type: 'funds',
    riskLevel: 'faible',
    expectedReturnMin: 5.5,
    expectedReturnMax: 7.2,
    minimumDeposit: 25000,
    liquidity: 'Disponible sous 48h à 72h sans pénalité',
    description:
      'Placement collectif géré par une SGI agréée UEMOA. Idéal pour faire fructifier son épargne mensuelle sans bloquer son argent.',
    suitability: 'Recommandé pour votre trésorerie et vos projets à 1 - 3 ans.',
    providerExamples: 'SGI UEMOA (CGF Bourse, Société Générale Capital, EDC Asset Management, BOA Capital)',
  },
  {
    id: 'oat-tresor',
    name: 'Bons & Obligations du Trésor Public (OAT / TPCI)',
    type: 'bonds',
    riskLevel: 'faible',
    expectedReturnMin: 6.0,
    expectedReturnMax: 7.3,
    minimumDeposit: 50000,
    liquidity: 'Coupons semestriels ou annuels réguliers, rachat sur marché secondaire',
    description:
      'Titres émis par les États de l’UEMOA (Côte d’Ivoire, Sénégal, Bénin, etc.) garantis par le Trésor Public. Exonération d’impôts.',
    suitability: 'Excellent pour sécuriser des rentes garanties à moyen terme (3 à 7 ans).',
    providerExamples: 'Trésor Public UEMOA via SGI ou banques locales dépositaires',
  },
  {
    id: 'dat-precaution',
    name: 'Épargne Rémunérée & Dépôt à Terme (DAT)',
    type: 'security',
    riskLevel: 'faible',
    expectedReturnMin: 3.5,
    expectedReturnMax: 5.0,
    minimumDeposit: 10000,
    liquidity: 'Bloqué de 3 à 12 mois avec taux garanti',
    description:
      'Compte sur livret ou compte bloqué en banque locale ou microfinance agréée pour constituer votre matelas de secours.',
    suitability: 'Priorité n°1 : Matelas de sécurité couvrant 3 mois de dépenses fixes.',
    providerExamples: 'Banques locales (NSIA, Ecobank, BOA, Société Générale, Coris, Advans)',
  },
  {
    id: 'brvm-actions',
    name: 'Actions à Fort Dividende (BRVM)',
    type: 'stocks',
    riskLevel: 'dynamique',
    expectedReturnMin: 7.5,
    expectedReturnMax: 12.5,
    minimumDeposit: 50000,
    liquidity: 'Cotation continue du lundi au vendredi sur la BRVM',
    description:
      'Achat de parts dans les champions économiques régionaux (Sonatel, SGBCI, BOA CI, Ecobank, SMB, TotalEnergies CI).',
    suitability: 'Recommandé pour faire croître son capital sur 5 à 10+ ans avec réinvestissement des dividendes.',
    providerExamples: 'Compte-titres auprès d’une SGI agréée BRVM (Abidjan, Dakar, Lomé, Cotonou)',
  },
  {
    id: 'foncier-micro-projet',
    name: 'Micro-Investissement Productif & Foncier Sécurisé',
    type: 'real_estate',
    riskLevel: 'modéré',
    expectedReturnMin: 8.0,
    expectedReturnMax: 15.0,
    minimumDeposit: 100000,
    liquidity: 'Moyen à long terme',
    description:
      'Achat progressif de parcelles périurbaines titrées (ACD), parts de projets agricoles modernes ou tontine productive structurée.',
    suitability: 'Recommandé une fois l’épargne de sécurité et les FCP bien installés.',
    providerExamples: 'Coopératives agréées, programmes certifiés, notaires et promoteurs agréés',
  },
];

/**
 * Analyze expense categories to compute realistic annual reduction potential
 */
export function generateExpenseOptimizations(state: AppState, currentMonthKey: string): ExpenseOptimizationItem[] {
  const breakdown = getCategoryBreakdown(state, currentMonthKey);
  const items: ExpenseOptimizationItem[] = [];

  const categoryStrategies: Record<
    string,
    { percentage: number; tip: string; impactLevel: 'high' | 'medium' | 'low' }
  > = {
    alimentation: {
      percentage: 15,
      tip: 'Planifiez vos menus hebdomadaires et achetez les denrées non périssables en gros pour éliminer le gaspillage.',
      impactLevel: 'high',
    },
    nourriture: {
      percentage: 15,
      tip: 'Réduisez de moitié les livraisons de repas en préparant vos déjeuners à l’avance.',
      impactLevel: 'high',
    },
    transport: {
      percentage: 20,
      tip: 'Optimisez les trajets urbains (VTC vs covoiturage/transports) et regroupez vos déplacements non urgents.',
      impactLevel: 'medium',
    },
    loisirs: {
      percentage: 25,
      tip: 'Fixez une enveloppe fixe en début de mois pour les sorties et prévoyez des activités gratuites ou partagées.',
      impactLevel: 'high',
    },
    sorties: {
      percentage: 25,
      tip: 'Privilégiez les réceptions à domicile entre amis et réglez les extras uniquement en espèces.',
      impactLevel: 'high',
    },
    abonnements: {
      percentage: 30,
      tip: 'Auditez vos forfaits internet, streaming et options mobiles rarement utilisés pour mutualiser les comptes.',
      impactLevel: 'medium',
    },
    shopping: {
      percentage: 30,
      tip: 'Appliquez la règle des 48h avant tout achat non essentiel pour éliminer les impulsions.',
      impactLevel: 'high',
    },
    factures: {
      percentage: 10,
      tip: 'Traquez la consommation électrique (climatiseurs programmés, ampoules LED) pour modérer la facture.',
      impactLevel: 'medium',
    },
    divers: {
      percentage: 20,
      tip: 'Qualifiez systématiquement les petites dépenses du quotidien qui grignotent la trésorerie.',
      impactLevel: 'low',
    },
  };

  // If there are real transactions
  if (breakdown.length > 0) {
    breakdown.forEach((cat) => {
      if (cat.amount <= 0) return;
      const lowerName = cat.name.toLowerCase();
      let matchedStrategy = Object.entries(categoryStrategies).find(([key]) => lowerName.includes(key))?.[1];

      if (!matchedStrategy) {
        matchedStrategy = {
          percentage: 15,
          tip: `Définissez un plafond mensuel strict sur ${cat.name} pour libérer du capital d'investissement.`,
          impactLevel: cat.amount > 50000 ? 'high' : 'medium',
        };
      }

      const monthlySavings = Math.round((cat.amount * matchedStrategy.percentage) / 100);
      const annualSavings = monthlySavings * 12;

      items.push({
        id: `opt-${cat.categoryId}`,
        categoryName: cat.name,
        currentMonthlySpend: cat.amount,
        reductionPercentage: matchedStrategy.percentage,
        monthlySavings,
        annualSavings,
        tip: matchedStrategy.tip,
        impactLevel: matchedStrategy.impactLevel,
      });
    });
  }

  // If no transactions yet or very few, generate realistic actionable standard levers
  if (items.length === 0) {
    items.push(
      {
        id: 'opt-def-1',
        categoryName: 'Alimentation & Restaurants',
        currentMonthlySpend: 120000,
        reductionPercentage: 15,
        monthlySavings: 18000,
        annualSavings: 216000,
        tip: 'Planifier les courses hebdomadaires et réduire les repas commandés à l’extérieur permet d’économiser 18 000 FCFA/mois.',
        impactLevel: 'high',
      },
      {
        id: 'opt-def-2',
        categoryName: 'Sorties & Loisirs',
        currentMonthlySpend: 80000,
        reductionPercentage: 25,
        monthlySavings: 20000,
        annualSavings: 240000,
        tip: 'Limiter les sorties imprévues et plafonner le budget week-end libère 20 000 FCFA/mois pour vos placements.',
        impactLevel: 'high',
      },
      {
        id: 'opt-def-3',
        categoryName: 'Abonnements & Forfaits Data',
        currentMonthlySpend: 35000,
        reductionPercentage: 30,
        monthlySavings: 10500,
        annualSavings: 126000,
        tip: 'Regrouper les forfaits mobiles et annuler les abonnements doublons dégage plus de 120 000 FCFA/an.',
        impactLevel: 'medium',
      },
      {
        id: 'opt-def-4',
        categoryName: 'Achats Impulsifs / Shopping',
        currentMonthlySpend: 50000,
        reductionPercentage: 30,
        monthlySavings: 15000,
        annualSavings: 180000,
        tip: 'Attendre 48h avant de valider un achat vestimentaire ou gadget supprime les dépenses inutiles.',
        impactLevel: 'medium',
      }
    );
  }

  // Sort by highest annual savings
  return items.sort((a, b) => b.annualSavings - a.annualSavings);
}

/**
 * Generate 3 tailored allocation profiles based on the user's monthly savings capacity
 */
export function generateAllocationProfiles(monthlyCapacity: number): AllocationProfile[] {
  const baseCapacity = Math.max(25000, monthlyCapacity);

  return [
    {
      id: 'prudent',
      name: 'Profil Sérénité (Prudent)',
      description: 'Priorité absolue à la sécurité du capital et à la disponibilité des liquidités.',
      horizon: 'Court & Moyen terme (6 mois - 2 ans)',
      expectedAnnualReturn: 5.8,
      slices: [
        {
          title: 'Sécurité & Matelas de Secours (DAT / Épargne)',
          percentage: 45,
          color: '#10B981', // emerald
          description: 'Liquidité immédiate disponible pour les urgences.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.45),
        },
        {
          title: 'FCP Monétaire & Obligataire',
          percentage: 40,
          color: '#3B82F6', // blue
          description: 'Rendement net stable de 5.5% à 7% par an.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.4),
        },
        {
          title: 'Bons du Trésor Public (OAT / TPCI)',
          percentage: 15,
          color: '#EB5738', // orange
          description: 'Titres souverains garantis par l’État.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.15),
        },
      ],
    },
    {
      id: 'equilibre',
      name: 'Profil Équilibré (Recommandé)',
      description: 'Le parfait compromis entre rendement attractif et maîtrise rigoureuse du risque.',
      horizon: 'Moyen & Long terme (2 - 5 ans)',
      expectedAnnualReturn: 7.8,
      slices: [
        {
          title: 'FCP Monétaires & Obligataires',
          percentage: 40,
          color: '#3B82F6',
          description: 'Socle solide de performance régulière.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.4),
        },
        {
          title: 'Obligations d’État & Trésor (TPCI)',
          percentage: 30,
          color: '#EB5738',
          description: 'Rente garantie à taux fixe annuel.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.3),
        },
        {
          title: 'Actions & Dividendes BRVM',
          percentage: 20,
          color: '#8B5CF6', // purple
          description: 'Grandes entreprises cotées à forts dividendes.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.2),
        },
        {
          title: 'Matelas de Réserve (DAT)',
          percentage: 10,
          color: '#10B981',
          description: 'Fonds de roulement disponible.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.1),
        },
      ],
    },
    {
      id: 'dynamique',
      name: 'Profil Croissance (Dynamique)',
      description: 'Maximisation de la création de richesse à long terme par l’effet des intérêts composés.',
      horizon: 'Long terme (5 - 10+ ans)',
      expectedAnnualReturn: 10.2,
      slices: [
        {
          title: 'Actions BRVM & Dividendes Réinvestis',
          percentage: 45,
          color: '#8B5CF6',
          description: 'Potentiel de valorisation et dividendes élevés.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.45),
        },
        {
          title: 'FCP Diversifiés & Obligations',
          percentage: 30,
          color: '#3B82F6',
          description: 'Gestion active multi-actifs en zone UEMOA.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.3),
        },
        {
          title: 'Investissement Productif & Foncier',
          percentage: 15,
          color: '#F59E0B', // amber
          description: 'Création d’actifs tangibles pérennes.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.15),
        },
        {
          title: 'Réserve Stratégique',
          percentage: 10,
          color: '#10B981',
          description: 'Trésorerie pour saisir les opportunités de marché.',
          suggestedMonthlyAmount: Math.round(baseCapacity * 0.1),
        },
      ],
    },
  ];
}

/**
 * Calculate Compound Growth Simulation given a monthly deposit and annual rate
 */
export function calculateInvestmentProjection(
  monthlyDeposit: number,
  annualRatePct: number,
  years: number
): {
  totalDeposited: number;
  totalGains: number;
  finalBalance: number;
  yearlyMilestones: { year: number; deposited: number; balance: number; gains: number }[];
} {
  const r = annualRatePct / 100 / 12;
  const totalMonths = years * 12;
  let balance = 0;
  let deposited = 0;
  const milestones: { year: number; deposited: number; balance: number; gains: number }[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    balance = (balance + monthlyDeposit) * (1 + r);
    deposited += monthlyDeposit;

    if (m % 12 === 0) {
      const yr = m / 12;
      milestones.push({
        year: yr,
        deposited: Math.round(deposited),
        balance: Math.round(balance),
        gains: Math.round(balance - deposited),
      });
    }
  }

  return {
    totalDeposited: Math.round(deposited),
    totalGains: Math.round(balance - deposited),
    finalBalance: Math.round(balance),
    yearlyMilestones: milestones,
  };
}
