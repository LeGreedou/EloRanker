"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const match_entity_1 = require("./entities/match.entity");
const players_service_1 = require("../players/players.service");
const elo_calculator_1 = require("../domain/elo-calculator");
const ranking_service_1 = require("../ranking/ranking.service");
let MatchesService = class MatchesService {
    constructor(matchRepository, playersService, rankingService) {
        this.matchRepository = matchRepository;
        this.playersService = playersService;
        this.rankingService = rankingService;
    }
    async create(createMatchDto) {
        const winner = await this.playersService.findOne(createMatchDto.winner);
        const loser = await this.playersService.findOne(createMatchDto.loser);
        if (!winner || !loser) {
            throw new common_1.UnprocessableEntityException('One or both players do not exist');
        }
        const { newWinnerRank, newLoserRank } = elo_calculator_1.EloCalculator.computeMatchResult(winner.rank, loser.rank, createMatchDto.draw);
        const updatedWinner = await this.playersService.updateRank(winner.id, newWinnerRank);
        const updatedLoser = await this.playersService.updateRank(loser.id, newLoserRank);
        const match = this.matchRepository.create({
            winnerId: winner.id,
            loserId: loser.id,
            isDraw: createMatchDto.draw,
        });
        await this.matchRepository.save(match);
        this.rankingService.publishRankingUpdate(updatedWinner);
        this.rankingService.publishRankingUpdate(updatedLoser);
        return {
            winner: updatedWinner,
            loser: updatedLoser,
        };
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        players_service_1.PlayersService,
        ranking_service_1.RankingService])
], MatchesService);
//# sourceMappingURL=matches.service.js.map