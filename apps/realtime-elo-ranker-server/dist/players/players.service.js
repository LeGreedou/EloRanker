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
exports.PlayersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const player_entity_1 = require("./entities/player.entity");
const ranking_service_1 = require("../ranking/ranking.service");
let PlayersService = class PlayersService {
    constructor(repo, rankingService) {
        this.repo = repo;
        this.rankingService = rankingService;
    }
    async create(dto) {
        const existing = await this.repo.findOneBy({ id: dto.id });
        if (existing)
            throw new common_1.ConflictException('Player already exists');
        const all = await this.repo.find();
        let initialRank = 1200;
        if (all.length > 0) {
            initialRank = Math.round(all.reduce((acc, p) => acc + p.rank, 0) / all.length);
        }
        const player = await this.repo.save(this.repo.create({ id: dto.id, rank: initialRank }));
        this.rankingService.publishRankingUpdate(player);
        this.rankingService.updateCache(player);
        return player;
    }
    async findAll() { return this.repo.find(); }
    async findOne(id) { return this.repo.findOneBy({ id }); }
    async updateRank(id, newRank) {
        const player = await this.repo.findOneBy({ id });
        if (!player)
            throw new Error('Player not found');
        player.rank = newRank;
        const updated = await this.repo.save(player);
        this.rankingService.updateCache(updated);
        return updated;
    }
};
exports.PlayersService = PlayersService;
exports.PlayersService = PlayersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(player_entity_1.Player)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => ranking_service_1.RankingService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ranking_service_1.RankingService])
], PlayersService);
//# sourceMappingURL=players.service.js.map