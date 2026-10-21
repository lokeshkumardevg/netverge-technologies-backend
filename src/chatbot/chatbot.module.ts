import {
  Body, Controller, Get, HttpException, HttpStatus, Injectable, Logger, Module, Post, Req,
} from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import type { Request } from 'express';
import { COMPANY, CONTACT, DOCUMENT_NAME, FALLBACK, GREETING, KNOWLEDGE, STARTER_IDS, KnowledgeEntry } from './knowledge';
import { getEntry, search } from './engine';

// ───────────────────────── DTO ─────────────────────────
class AskDto {
  /** Free text typed by the visitor */
  @IsOptional() @IsString() @MaxLength(500, { message: 'Please keep your question under 500 characters.' })
  question?: string;

  /** Id of a suggestion chip the visitor tapped (exact, deterministic answer) */
  @IsOptional() @IsString() @MaxLength(80)
  entryId?: string;
}

// ───────────────────────── tiny in-memory rate limiter (no extra dependency) ─────────────────────────
@Injectable()
export class ChatRateLimiter {
  private hits = new Map<string, { count: number; reset: number }>();
  private readonly limit = 40;          // requests
  private readonly windowMs = 60_000;   // per minute, per IP

  check(key: string): { allowed: boolean; retryAfter: number } {
    const now = Date.now();
    if (this.hits.size > 5000) this.hits.forEach((v, k) => v.reset < now && this.hits.delete(k));
    const cur = this.hits.get(key);
    if (!cur || cur.reset < now) {
      this.hits.set(key, { count: 1, reset: now + this.windowMs });
      return { allowed: true, retryAfter: 0 };
    }
    cur.count++;
    return { allowed: cur.count <= this.limit, retryAfter: Math.ceil((cur.reset - now) / 1000) };
  }
}

// ───────────────────────── service ─────────────────────────
export interface Suggestion { id: string; label: string; icon: string }

@Injectable()
export class ChatbotService {
  private readonly log = new Logger('Chatbot');

  private toSuggestion(e: KnowledgeEntry): Suggestion {
    return { id: e.id, label: e.chip, icon: e.icon };
  }

  private starters(): Suggestion[] {
    return STARTER_IDS.map(getEntry).filter(Boolean).map((e) => this.toSuggestion(e!));
  }

  private unique(list: (KnowledgeEntry | undefined)[], excludeId?: string, max = 4): Suggestion[] {
    const seen = new Set<string>(excludeId ? [excludeId] : []);
    const out: Suggestion[] = [];
    for (const e of list) {
      if (!e || seen.has(e.id)) continue;
      seen.add(e.id);
      out.push(this.toSuggestion(e));
      if (out.length >= max) break;
    }
    return out;
  }

  init() {
    return {
      ok: true,
      bot: { name: 'NetVerge Assistant', source: DOCUMENT_NAME, company: COMPANY },
      greeting: GREETING,
      suggestions: this.starters(),
      contact: CONTACT,
    };
  }

  ask(dto: AskDto) {
    const question = (dto.question || '').replace(/\s+/g, ' ').trim();
    const base = { ok: true, timestamp: new Date().toISOString() };

    // 1) Chip tapped -> exact entry
    if (dto.entryId) {
      const e = getEntry(dto.entryId);
      if (e) return this.answerFrom(base, e, 1, []);
    }
    if (!question) {
      throw new HttpException({ ok: false, code: 'EMPTY', message: 'Please type a question.' }, HttpStatus.BAD_REQUEST);
    }

    // 2) Free text -> retrieval
    const r = search(question);
    switch (r.intent) {
      case 'greeting':
        return { ...base, matched: false, kind: 'greeting', answer: GREETING, source: null, suggestions: this.starters() };
      case 'thanks':
        return { ...base, matched: false, kind: 'thanks', answer: "You're welcome! 😊 Feel free to ask anything else about NetVerge.", source: null, suggestions: this.starters().slice(0, 4) };
      case 'bye':
        return { ...base, matched: false, kind: 'bye', answer: 'Thank you for visiting NetVerge Technologies. Have a great day! 👋', source: null, suggestions: [] };
      case 'answer':
        if (r.entry) return this.answerFrom(base, r.entry, r.confidence, r.alternates);
      // falls through
      default:
        this.log.debug(`No match for: "${question.slice(0, 120)}"`);
        return { ...base, matched: false, kind: 'fallback', answer: FALLBACK, source: null, suggestions: this.starters().slice(0, 5) };
    }
  }

  private answerFrom(base: object, e: KnowledgeEntry, confidence: number, alternates: KnowledgeEntry[]) {
    const related = [...alternates, ...e.related.map(getEntry)];
    return {
      ...base,
      matched: true,
      kind: 'answer',
      entryId: e.id,
      title: e.title,
      confidence: Number(confidence.toFixed(2)),
      answer: e.answer,
      source: { document: DOCUMENT_NAME, page: e.page },
      suggestions: this.unique(related, e.id, 4),
    };
  }

  stats() {
    return { entries: KNOWLEDGE.length };
  }
}

// ───────────────────────── controller (public endpoints) ─────────────────────────
@Controller('chatbot')
export class ChatbotController {
  private readonly log = new Logger('ChatbotController');
  constructor(private svc: ChatbotService, private limiter: ChatRateLimiter) {}

  private ip(req: Request): string {
    const xf = req.headers['x-forwarded-for'];
    const first = (Array.isArray(xf) ? xf[0] : xf || '').split(',')[0].trim();
    return first || req.ip || req.socket?.remoteAddress || 'unknown';
  }

  /** GET /api/chatbot/init  -> greeting + starter questions (shown the moment the chat opens) */
  @Get('init')
  init() {
    try {
      return this.svc.init();
    } catch (e) {
      this.log.error('init failed', (e as Error)?.stack);
      throw new HttpException({ ok: false, code: 'INIT_FAILED', message: 'Chat is temporarily unavailable. Please try again.' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /** POST /api/chatbot/ask  body: { question?: string, entryId?: string } */
  @Post('ask')
  ask(@Body() dto: AskDto, @Req() req: Request) {
    const rl = this.limiter.check(this.ip(req));
    if (!rl.allowed) {
      throw new HttpException(
        { ok: false, code: 'RATE_LIMITED', message: `You're sending messages too quickly. Please wait ${rl.retryAfter}s and try again.`, retryAfter: rl.retryAfter },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    try {
      return this.svc.ask(dto || {});
    } catch (e) {
      if (e instanceof HttpException) throw e;
      this.log.error('ask failed', (e as Error)?.stack);
      throw new HttpException(
        { ok: false, code: 'INTERNAL', message: 'Sorry, something went wrong while finding your answer. Please try again.' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, ChatRateLimiter],
})
export class ChatbotModule {}