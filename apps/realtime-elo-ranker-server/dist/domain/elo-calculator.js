"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EloCalculator = void 0;
class EloCalculator {
    static calculateWinProbability(ratingPlayer, ratingOpponent) {
        return 1 / (1 + Math.pow(10, (ratingOpponent - ratingPlayer) / this.DIVIDER));
    }
    static calculateNewRating(currentRating, actualScore, expectedScore) {
        const newRating = currentRating + this.K_FACTOR * (actualScore - expectedScore);
        return Math.round(newRating);
    }
    static computeMatchResult(winnerRank, loserRank, isDraw) {
        const winnerExpected = this.calculateWinProbability(winnerRank, loserRank);
        const loserExpected = this.calculateWinProbability(loserRank, winnerRank);
        const winnerScore = isDraw ? 0.5 : 1;
        const loserScore = isDraw ? 0.5 : 0;
        const newWinnerRank = this.calculateNewRating(winnerRank, winnerScore, winnerExpected);
        const newLoserRank = this.calculateNewRating(loserRank, loserScore, loserExpected);
        return { newWinnerRank, newLoserRank };
    }
}
exports.EloCalculator = EloCalculator;
EloCalculator.K_FACTOR = 32;
EloCalculator.DIVIDER = 400;
//# sourceMappingURL=elo-calculator.js.map