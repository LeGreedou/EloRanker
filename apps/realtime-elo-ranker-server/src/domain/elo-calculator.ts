export class EloCalculator {
  private static readonly K_FACTOR = 32;
  private static readonly DIVIDER = 400;

  static calculateWinProbability(ratingPlayer: number, ratingOpponent: number): number {
    return 1 / (1 + Math.pow(10, (ratingOpponent - ratingPlayer) / this.DIVIDER));
  }

  static calculateNewRating(currentRating: number, actualScore: number, expectedScore: number): number {
    const newRating = currentRating + this.K_FACTOR * (actualScore - expectedScore);
    return Math.round(newRating);
  }

  static computeMatchResult(
    winnerRank: number,
    loserRank: number,
    isDraw: boolean
  ): { newWinnerRank: number; newLoserRank: number } {
    const winnerExpected = this.calculateWinProbability(winnerRank, loserRank);
    const loserExpected = this.calculateWinProbability(loserRank, winnerRank);

    const winnerScore = isDraw ? 0.5 : 1;
    const loserScore = isDraw ? 0.5 : 0;

    const newWinnerRank = this.calculateNewRating(winnerRank, winnerScore, winnerExpected);
    const newLoserRank = this.calculateNewRating(loserRank, loserScore, loserExpected);

    return { newWinnerRank, newLoserRank };
  }
}
