import { describe, it, expect } from 'vitest'
import { getMultiplierLabel, getMultiplierColor, getMultiplierBarWidth, buildMultiplierData } from '../lib/multiplier'

const T = { high: 0.70, low: 0.40 }

describe('getMultiplierLabel', () => {
  it('HIGH VOL at and above 0.70', () => {
    expect(getMultiplierLabel(1.00, T)).toBe('HIGH VOL')
    expect(getMultiplierLabel(0.71, T)).toBe('HIGH VOL')
    expect(getMultiplierLabel(0.70, T)).toBe('HIGH VOL')
  })
  it('MODERATE between thresholds', () => {
    expect(getMultiplierLabel(0.69, T)).toBe('MODERATE')
    expect(getMultiplierLabel(0.55, T)).toBe('MODERATE')
    expect(getMultiplierLabel(0.40, T)).toBe('MODERATE')
  })
  it('LOW VOL below 0.40', () => {
    expect(getMultiplierLabel(0.39, T)).toBe('LOW VOL')
    expect(getMultiplierLabel(0.00, T)).toBe('LOW VOL')
  })
})

describe('getMultiplierColor', () => {
  it('green for high', () => expect(getMultiplierColor(0.82, T)).toBe('green'))
  it('amber for moderate', () => expect(getMultiplierColor(0.55, T)).toBe('amber'))
  it('red for low', () => expect(getMultiplierColor(0.20, T)).toBe('red'))
})

describe('getMultiplierBarWidth', () => {
  it('converts to integer percent', () => {
    expect(getMultiplierBarWidth(0.82)).toBe(82)
    expect(getMultiplierBarWidth(1.00)).toBe(100)
    expect(getMultiplierBarWidth(0.00)).toBe(0)
  })
  it('clamps out-of-range values', () => {
    expect(getMultiplierBarWidth(1.5)).toBe(100)
    expect(getMultiplierBarWidth(-0.1)).toBe(0)
  })
})

describe('buildMultiplierData', () => {
  it('returns complete object', () => {
    const r = buildMultiplierData(0.82, T)
    expect(r.score).toBe(0.82)
    expect(r.label).toBe('HIGH VOL')
    expect(r.color).toBe('green')
    expect(r.barWidthPercent).toBe(82)
  })
})
