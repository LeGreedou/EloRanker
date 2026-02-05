export declare class EloCalculator {
    private static readonly K_FACTOR;
    private static readonly DIVIDER;
    static calculateWinProbability(ratingPlayer: number, ratingOpponent: number): number;
    static calculateNewRating(currentRating: number, actualScore: number, expectedScore: number): number;
    static computeMatchResult(winnerRank: number, loserRank: number, isDraw: boolean): {
        newWinnerRank: number;
        newLoserRank: number;
    };
}
