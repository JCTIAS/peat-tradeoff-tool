import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Bird,
  ChartColumn,
  Cloud,
  Droplets,
  Factory,
  HandCoins,
  HouseHeart,
  Landmark,
  RotateCcw,
  Sprout,
  Tractor,
  UsersRound,
  Waves,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'
import {
  impactDefinitions,
  impactKeys,
  impactScaleLabel,
  illustrativePrototypeNotice,
  managementOptions,
  type ImpactKey,
} from './data/managementOptions'

type AllocationMap = Record<string, number>
type ImpactScores = Record<ImpactKey, number>
type ScoreTone = 'positive' | 'pressure' | 'mixed'
type LandscapeCue = {
  key: ImpactKey
  score: number
  tone: ScoreTone
  Icon: LucideIcon
}

const impactIcons: Record<ImpactKey, LucideIcon> = {
  farmerIncome: Tractor,
  taxpayerCostPressure: Landmark,
  localCommunity: UsersRound,
  supplyChain: Factory,
  carbon: Cloud,
  biodiversity: Sprout,
  floodResilience: Waves,
}

const landscapeIcons: Record<ImpactKey, LucideIcon> = {
  farmerIncome: HandCoins,
  taxpayerCostPressure: Landmark,
  localCommunity: HouseHeart,
  supplyChain: Factory,
  carbon: Cloud,
  biodiversity: Bird,
  floodResilience: Droplets,
}

const initialAllocations = managementOptions.reduce<AllocationMap>(
  (allocations, option) => {
    allocations[option.id] = option.defaultAllocation
    return allocations
  },
  {},
)

function scoreToLabel(score: number) {
  if (score >= 3) return 'Strong positive'
  if (score >= 1) return 'Some positive'
  if (score > -1) return 'Mixed / limited change'
  if (score > -3) return 'Some pressure'
  return 'Significant pressure'
}

function formatScore(score: number) {
  const rounded = score.toFixed(1)
  return score > 0 ? `+${rounded}` : rounded
}

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function getScoreTone(score: number): ScoreTone {
  if (score >= 1) return 'positive'
  if (score <= -1) return 'pressure'
  return 'mixed'
}

function getInitialScores(): ImpactScores {
  return impactKeys.reduce((scores, key) => {
    scores[key] = 0
    return scores
  }, {} as ImpactScores)
}

function calculateScores(allocations: AllocationMap): ImpactScores {
  const scores = getInitialScores()

  managementOptions.forEach((option) => {
    const allocation = allocations[option.id] ?? 0

    impactKeys.forEach((key) => {
      scores[key] += (allocation * option.impacts[key]) / 100
    })
  })

  return scores
}

function getLandscapeCues(scores: ImpactScores): LandscapeCue[] {
  const cues = impactKeys.map((key) => ({
    key,
    score: scores[key],
    tone: getScoreTone(scores[key]),
    Icon: landscapeIcons[key],
  }))

  const positives = cues
    .filter((cue) => cue.tone === 'positive')
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
  const pressures = cues
    .filter((cue) => cue.tone === 'pressure')
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)

  return [...positives, ...pressures]
}

function getCueText(cue: LandscapeCue) {
  const definition = impactDefinitions[cue.key]
  return cue.tone === 'positive'
    ? `Supports ${definition.positivePhrase}`
    : `Creates ${definition.negativePhrase}`
}

function rebalanceAllocations(
  currentAllocations: AllocationMap,
  changedId: string,
  nextValue: number,
) {
  const nextAllocations = { ...currentAllocations }
  const boundedValue = Math.max(0, Math.min(100, Math.round(nextValue)))
  const previousValue = nextAllocations[changedId] ?? 0
  const delta = boundedValue - previousValue
  const otherIds = managementOptions
    .map((option) => option.id)
    .filter((id) => id !== changedId)

  nextAllocations[changedId] = boundedValue

  if (delta > 0) {
    let remaining = delta
    const donors = [...otherIds].sort(
      (a, b) => nextAllocations[b] - nextAllocations[a],
    )

    while (remaining > 0) {
      let movedThisRound = false

      donors.forEach((id) => {
        if (remaining === 0 || nextAllocations[id] === 0) return
        nextAllocations[id] -= 1
        remaining -= 1
        movedThisRound = true
      })

      if (!movedThisRound) break
    }
  }

  if (delta < 0) {
    let remaining = Math.abs(delta)
    const receivers = [...otherIds].sort(
      (a, b) => nextAllocations[a] - nextAllocations[b],
    )

    while (remaining > 0) {
      receivers.forEach((id) => {
        if (remaining === 0) return
        nextAllocations[id] += 1
        remaining -= 1
      })
    }
  }

  return nextAllocations
}

function getNarrative(scores: ImpactScores) {
  const rankedImpacts = impactKeys.map((key) => ({
    key,
    score: scores[key],
    ...impactDefinitions[key],
  }))

  const positives = rankedImpacts
    .filter((impact) => impact.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
  const negatives = rankedImpacts
    .filter((impact) => impact.score < 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)

  if (positives.length > 0 && negatives.length > 0) {
    return `Your scenario prioritises ${formatList(
      positives.map((impact) => impact.positivePhrase),
    )}, but creates ${formatList(
      negatives.map((impact) => impact.negativePhrase),
    )}.`
  }

  if (positives.length > 0) {
    return `Your scenario most strongly supports ${formatList(
      positives.map((impact) => impact.positivePhrase),
    )}, with limited pressure in the other prototype scores.`
  }

  if (negatives.length > 0) {
    return `Your scenario mainly shows ${formatList(
      negatives.map((impact) => impact.negativePhrase),
    )}, with limited positive change in the other prototype scores.`
  }

  return 'Your scenario sits close to the middle of the illustrative scores, with no clear strongest trade-off.'
}

function App() {
  const [allocations, setAllocations] =
    useState<AllocationMap>(initialAllocations)

  const scores = useMemo(() => calculateScores(allocations), [allocations])
  const totalAllocation = managementOptions.reduce(
    (total, option) => total + (allocations[option.id] ?? 0),
    0,
  )
  const dominantOption = managementOptions.reduce((current, option) => {
    return (allocations[option.id] ?? 0) > (allocations[current.id] ?? 0)
      ? option
      : current
  }, managementOptions[0])
  const narrative = getNarrative(scores)
  const landscapeCues = getLandscapeCues(scores)
  const chartData = impactKeys.map((key) => ({
    key,
    name: impactDefinitions[key].chartLabel,
    score: Number(scores[key].toFixed(2)),
  }))

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Public dialogue prototype</p>
          <h1>Lowland Peat Trade-Off Explorer</h1>
          <p className="intro">
            Compare simple land management mixes and discuss who benefits, who
            carries pressure, and what support might be needed during change.
          </p>
        </div>
        <aside className="prototype-note" aria-label="Prototype notice">
          <strong>For demonstration purposes only</strong>
          <p>{illustrativePrototypeNotice}</p>
        </aside>
      </header>

      <section className="scenario-grid" aria-label="Scenario builder">
        <section className="management-column" aria-labelledby="choices-title">
          <div className="column-heading">
            <div>
              <p className="eyebrow">Land units</p>
              <h2 id="choices-title">Management choices</h2>
            </div>
            <p className="total" aria-live="polite">
              {totalAllocation} / 100 units
            </p>
          </div>

          <div className="choice-list">
            {managementOptions.map((option) => {
              const allocation = allocations[option.id] ?? 0

              return (
                <article className="choice-card" key={option.id}>
                  <div className="choice-card__header">
                    <label htmlFor={`allocation-${option.id}`}>
                      {option.shortName}
                    </label>
                    <output htmlFor={`allocation-${option.id}`}>
                      {allocation} units
                    </output>
                  </div>
                  <input
                    aria-label={`${option.shortName} allocation in land units`}
                    id={`allocation-${option.id}`}
                    max="100"
                    min="0"
                    onChange={(event) =>
                      setAllocations((current) =>
                        rebalanceAllocations(
                          current,
                          option.id,
                          Number(event.target.value),
                        ),
                      )
                    }
                    step="1"
                    type="range"
                    value={allocation}
                  />
                  <p>{option.description}</p>
                </article>
              )
            })}
          </div>

          <button
            className="reset-button"
            onClick={() => setAllocations(initialAllocations)}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={18} />
            Reset
          </button>
        </section>

        <section className="story-column" aria-labelledby="landscape-title">
          <div className="column-heading">
            <div>
              <p className="eyebrow">Scenario story</p>
              <h2 id="landscape-title">Illustrated landscape</h2>
            </div>
          </div>

          <div
            aria-label={`Landscape illustration emphasising ${dominantOption.shortName}.`}
            className={`landscape-strip landscape-strip--${dominantOption.id}`}
            role="img"
          >
            <div className="landscape-sky">
              <span className="sun" />
              <span className="cloud cloud--one" />
              <span className="cloud cloud--two" />
            </div>
            <div className="landscape-ground">
              <span className="tile tile--one" />
              <span className="tile tile--two" />
              <span className="tile tile--three" />
              <span className="farmstead" />
              <span className="community-homes" />
              <span className="reed-bed reed-bed--one" />
              <span className="reed-bed reed-bed--two" />
              <span className="water-line" />
            </div>
          </div>

          <p className="dominant-choice">
            Largest allocation: <strong>{dominantOption.shortName}</strong>
          </p>
          <p className="dynamic-narrative" aria-live="polite">
            {narrative}
          </p>
          <section className="key-outcomes" aria-labelledby="key-outcomes-title">
            <h3 id="key-outcomes-title">Key outcomes</h3>
            <div className="landscape-cues" aria-label="Current key outcomes">
              {landscapeCues.map((cue) => {
                const Icon = cue.Icon

                return (
                  <article className={`cue-card cue-card--${cue.tone}`} key={cue.key}>
                    <span className="cue-card__icon">
                      <Icon aria-hidden="true" size={18} />
                    </span>
                    <p>
                      <span>{getCueText(cue)}</span>
                      <strong>{formatScore(cue.score)}</strong>
                    </p>
                  </article>
                )
              })}
            </div>
          </section>
          <p className="scale-note">{impactScaleLabel}</p>
        </section>

        <section className="impact-column" aria-labelledby="impacts-title">
          <div className="column-heading">
            <div>
              <p className="eyebrow">Weighted outcomes</p>
              <h2 id="impacts-title">Stakeholder and impact cards</h2>
            </div>
          </div>

          <div className="impact-list">
            {impactKeys.map((key) => {
              const Icon = impactIcons[key]
              const score = scores[key]
              const tone = getScoreTone(score)

              return (
                <article className={`impact-card impact-card--${tone}`} key={key}>
                  <div className="impact-card__title">
                    <span className="impact-card__icon">
                      <Icon aria-hidden="true" size={19} />
                    </span>
                    <h3>{impactDefinitions[key].label}</h3>
                  </div>
                  <p className="impact-card__score">
                    <span>{formatScore(score)}</span>
                    <small>illustrative score</small>
                  </p>
                  <p className="impact-card__label">{scoreToLabel(score)}</p>
                </article>
              )
            })}
          </div>
        </section>
      </section>

      <section className="bottom-section" aria-labelledby="chart-title">
        <div className="chart-column">
          <div className="section-heading">
            <ChartColumn aria-hidden="true" size={20} />
            <div>
              <p className="eyebrow">Seven-score comparison</p>
              <h2 id="chart-title">Illustrative impact scores</h2>
            </div>
          </div>

          <div className="chart-frame">
            <ResponsiveContainer height="100%" minWidth={0} width="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ bottom: 8, left: 8, right: 20, top: 8 }}
              >
                <CartesianGrid horizontal={false} stroke="#d8e0da" />
                <XAxis
                  domain={[-5, 5]}
                  tick={{ fill: '#43534a', fontSize: 12 }}
                  ticks={[-5, -3, -1, 0, 1, 3, 5]}
                  type="number"
                />
                <YAxis
                  dataKey="name"
                  tick={{ fill: '#243127', fontSize: 12 }}
                  type="category"
                  width={128}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(40, 67, 54, 0.08)' }}
                  formatter={(value) => [
                    Number(value).toFixed(2),
                    'Illustrative score',
                  ]}
                />
                <ReferenceLine stroke="#63756b" strokeDasharray="3 3" x={0} />
                <Bar dataKey="score" radius={[0, 5, 5, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      fill={entry.score >= 0 ? '#2f7d57' : '#b2553d'}
                      key={entry.key}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <section
          className="reflection-column"
          aria-labelledby="reflection-title"
        >
          <p className="eyebrow">For discussion</p>
          <h2 id="reflection-title">Reflection questions</h2>
          <ul className="reflection-list">
            <li>Who benefits most from this mix, and who carries the risk?</li>
            <li>What support would make the transition feel fair locally?</li>
            <li>Which outcome would participants protect first if trade-offs sharpen?</li>
          </ul>
        </section>
      </section>
    </main>
  )
}

export default App
