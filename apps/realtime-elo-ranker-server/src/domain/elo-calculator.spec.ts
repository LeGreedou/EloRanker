import { EloCalculator } from './elo-calculator';

describe('EloCalculator', () => {
  it('should calculate win probability', () => {
    // 1200 vs 800 donne environ 0.91 (91%) de chance de victoire
    expect(EloCalculator.calculateWinProbability(1200, 800)).toBeCloseTo(0.91, 2);
  });

  it('should calculate new rating', () => {
    // Test unitaire de la formule pure (Exemple du README)
    // 1200 + 32 * (1 - 0.76) = 1207.68 -> arrondi à 1208
    expect(EloCalculator.calculateNewRating(1200, 1, 0.76)).toBe(1208);
  });

  it('should compute match result (1200 vs 800)', () => {
    // Scénario réel : 1200 bat 800.
    // L'écart est grand (400 points), donc le favori gagne peu de points.
    // Gain calculé : ~2.9 points, arrondi à 3.
    // Winner: 1200 + 3 = 1203
    // Loser: 800 - 3 = 797
    const result = EloCalculator.computeMatchResult(1200, 800, false);
    expect(result.newWinnerRank).toBe(1203);
    expect(result.newLoserRank).toBe(797);
  });
});