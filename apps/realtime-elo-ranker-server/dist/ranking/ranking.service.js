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
exports.RankingService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const players_service_1 = require("../players/players.service");
const rxjs_1 = require("rxjs");
let RankingService = class RankingService {
    constructor(eventEmitter, playersService) {
        this.eventEmitter = eventEmitter;
        this.playersService = playersService;
        this.rankingCache = new Map();
    }
    async onModuleInit() {
        await this.refreshCache();
    }
    async refreshCache() {
        const players = await this.playersService.findAll();
        this.rankingCache.clear();
        players.forEach(p => this.rankingCache.set(p.id, p));
    }
    updateCache(player) {
        this.rankingCache.set(player.id, player);
    }
    getRanking() {
        return Array.from(this.rankingCache.values()).sort((a, b) => b.rank - a.rank);
    }
    publishRankingUpdate(player) {
        this.eventEmitter.emit('ranking.update', player);
    }
    getRankingEvents() {
        return (0, rxjs_1.fromEvent)(this.eventEmitter, 'ranking.update').pipe((0, rxjs_1.map)((payload) => ({
            data: {
                type: 'RankingUpdate',
                player: payload,
            },
        })));
    }
};
exports.RankingService = RankingService;
exports.RankingService = RankingService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => players_service_1.PlayersService))),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2,
        players_service_1.PlayersService])
], RankingService);
//# sourceMappingURL=ranking.service.js.map