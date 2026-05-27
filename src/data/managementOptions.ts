export type ImpactKey =
  | 'farmerIncome'
  | 'taxpayerCostPressure'
  | 'localCommunity'
  | 'supplyChain'
  | 'carbon'
  | 'biodiversity'
  | 'floodResilience'

export type ImpactDefinition = {
  label: string
  chartLabel: string
  positivePhrase: string
  negativePhrase: string
}

export type ManagementOption = {
  id: string
  name: string
  shortName: string
  description: string
  defaultAllocation: number
  impacts: Record<ImpactKey, number>
}

export const illustrativePrototypeNotice =
  'Illustrative prototype values only. Scores are for discussion and are not evidence-based final values.'

export const impactScaleLabel =
  'Illustrative score scale: -5 significant pressure to +5 strong positive.'

export const impactKeys: ImpactKey[] = [
  'farmerIncome',
  'taxpayerCostPressure',
  'supplyChain',
  'carbon',
  'biodiversity',
  'floodResilience',
  'localCommunity',
]

export const impactDefinitions: Record<ImpactKey, ImpactDefinition> = {
  farmerIncome: {
    label: 'Farmer income',
    chartLabel: 'Farmer income',
    positivePhrase: 'farmer income',
    negativePhrase: 'income pressure for farmers',
  },
  taxpayerCostPressure: {
    label: 'Taxpayer cost pressure',
    chartLabel: 'Taxpayer pressure',
    positivePhrase: 'lower public funding pressure',
    negativePhrase: 'higher public funding needs',
  },
  localCommunity: {
    label: 'Local community',
    chartLabel: 'Local community',
    positivePhrase: 'local community outcomes',
    negativePhrase: 'local community disruption',
  },
  supplyChain: {
    label: 'Supply chain',
    chartLabel: 'Supply chain',
    positivePhrase: 'supply chain continuity',
    negativePhrase: 'supply chain pressure',
  },
  carbon: {
    label: 'Carbon',
    chartLabel: 'Carbon',
    positivePhrase: 'carbon outcomes',
    negativePhrase: 'carbon emissions',
  },
  biodiversity: {
    label: 'Biodiversity',
    chartLabel: 'Biodiversity',
    positivePhrase: 'biodiversity',
    negativePhrase: 'biodiversity pressure',
  },
  floodResilience: {
    label: 'Flood resilience',
    chartLabel: 'Flood resilience',
    positivePhrase: 'flood resilience',
    negativePhrase: 'flood risk pressure',
  },
}

export const managementOptions: ManagementOption[] = [
  {
    id: 'conventional',
    name: 'Conventional drainage-based farming',
    shortName: 'Conventional farming',
    description:
      'Maintains existing productive farming systems on drained lowland peat.',
    defaultAllocation: 30,
    impacts: {
      farmerIncome: 4,
      taxpayerCostPressure: 1,
      localCommunity: 1,
      supplyChain: 4,
      carbon: -5,
      biodiversity: -3,
      floodResilience: -3,
    },
  },
  {
    id: 'improved',
    name: 'Improved peat farming',
    shortName: 'Improved farming',
    description:
      'Keeps farming in place but changes water, soil and crop management to reduce harm.',
    defaultAllocation: 20,
    impacts: {
      farmerIncome: 3,
      taxpayerCostPressure: -1,
      localCommunity: 1,
      supplyChain: 3,
      carbon: -2,
      biodiversity: 0,
      floodResilience: -1,
    },
  },
  {
    id: 'partial-rewetting',
    name: 'Partial rewetting',
    shortName: 'Partial rewetting',
    description:
      'Raises water levels on some land while maintaining some agricultural use.',
    defaultAllocation: 20,
    impacts: {
      farmerIncome: 0,
      taxpayerCostPressure: -3,
      localCommunity: 2,
      supplyChain: 0,
      carbon: 3,
      biodiversity: 3,
      floodResilience: 3,
    },
  },
  {
    id: 'restoration',
    name: 'Full restoration / wetland creation',
    shortName: 'Restoration',
    description:
      'Rewets peatland primarily for carbon, water and nature outcomes.',
    defaultAllocation: 20,
    impacts: {
      farmerIncome: -4,
      taxpayerCostPressure: -4,
      localCommunity: 2,
      supplyChain: -3,
      carbon: 5,
      biodiversity: 5,
      floodResilience: 4,
    },
  },
  {
    id: 'paludiculture',
    name: 'Paludiculture / wet farming',
    shortName: 'Paludiculture',
    description:
      'Uses wet-compatible crops or biomass systems to combine production with wetter peat.',
    defaultAllocation: 10,
    impacts: {
      farmerIncome: 1,
      taxpayerCostPressure: -2,
      localCommunity: 1,
      supplyChain: 1,
      carbon: 3,
      biodiversity: 2,
      floodResilience: 2,
    },
  },
]
