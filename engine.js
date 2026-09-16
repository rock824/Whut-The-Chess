export const FILES = "abcdefgh";

export const PIECE_SYMBOLS = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"
};

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

export function squareToIndex(square) {
  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]);
  return (8 - rank) * 8 + file;
}

export function indexToSquare(index) {
  return `${FILES[index % 8]}${8 - Math.floor(index / 8)}`;
}

export function colorOf(piece) {
  if (!piece) return null;
  return piece === piece.toUpperCase() ? "w" : "b";
}

export function typeOf(piece) {
  return piece ? piece.toLowerCase() : null;
}

export class ChessGame {
  constructor(fen = START) {
    this.history = [];
    this.loadFEN(fen);
  }

  loadFEN(fen) {
    const [placement, turn = "w", castling = "-", ep = "-", half = "0", full = "1"] = fen.split(" ");
    this.board = [];
    placement.split("/").forEach(row => {
      for (const char of row) {
        if (/\d/.test(char)) this.board.push(...Array(Number(char)).fill(null));
        else this.board.push(char);
      }
    });
    this.turn = turn;
    this.castling = castling === "-" ? "" : castling;
    this.ep = ep === "-" ? null : squareToIndex(ep);
    this.halfmove = Number(half);
    this.fullmove = Number(full);
    this.lastMove = null;
    this.history = [];
    return this;
  }

  clone() {
    const game = Object.create(ChessGame.prototype);
    game.board = [...this.board];
    game.turn = this.turn;
    game.castling = this.castling;
    game.ep = this.ep;
    game.halfmove = this.halfmove;
    game.fullmove = this.fullmove;
    game.lastMove = this.lastMove ? { ...this.lastMove } : null;
    game.history = [];
    return game;
  }

  snapshot() {
    return {
      board: [...this.board], turn: this.turn, castling: this.castling,
      ep: this.ep, halfmove: this.halfmove, fullmove: this.fullmove,
      lastMove: this.lastMove ? { ...this.lastMove } : null
    };
  }

  restore(state) {
    Object.assign(this, state);
    this.board = [...state.board];
    this.lastMove = state.lastMove ? { ...state.lastMove } : null;
  }

  undo() {
    if (!this.history.length) return false;
    this.restore(this.history.pop());
    return true;
  }

  moves(from = null) {
    const all = [];
    for (let i = 0; i < 64; i += 1) {
      const piece = this.board[i];
      if (!piece || colorOf(piece) !== this.turn || (from !== null && i !== from)) continue;
      for (const move of this.pseudoMoves(i)) {
        const next = this.clone();
        next.applyUnchecked(move);
        if (!next.inCheck(this.turn)) all.push(move);
      }
    }
    return all;
  }

  pseudoMoves(from) {
    const piece = this.board[from];
    if (!piece) return [];
    const color = colorOf(piece);
    const type = typeOf(piece);
    const row = Math.floor(from / 8);
    const col = from % 8;
    const result = [];
    const add = (r, c, extra = {}) => {
      if (r < 0 || r > 7 || c < 0 || c > 7) return false;
      const to = r * 8 + c;
      const target = this.board[to];
      if (!target || colorOf(target) !== color) result.push({ from, to, piece, captured: target, ...extra });
      return !target;
    };
    const slide = dirs => {
      dirs.forEach(([dr, dc]) => {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
          if (!add(r, c)) break;
          r += dr;
          c += dc;
        }
      });
    };

    if (type === "p") {
      const dir = color === "w" ? -1 : 1;
      const startRow = color === "w" ? 6 : 1;
      const promotionRow = color === "w" ? 0 : 7;
      const one = (row + dir) * 8 + col;
      if (row + dir >= 0 && row + dir < 8 && !this.board[one]) {
        result.push({ from, to: one, piece, captured: null, promotion: row + dir === promotionRow ? (color === "w" ? "Q" : "q") : null });
        const two = (row + dir * 2) * 8 + col;
        if (row === startRow && !this.board[two]) result.push({ from, to: two, piece, captured: null, doublePawn: true });
      }
      [-1, 1].forEach(dc => {
        const r = row + dir;
        const c = col + dc;
        if (r < 0 || r > 7 || c < 0 || c > 7) return;
        const to = r * 8 + c;
        const target = this.board[to];
        if (target && colorOf(target) !== color) {
          result.push({ from, to, piece, captured: target, promotion: r === promotionRow ? (color === "w" ? "Q" : "q") : null });
        } else if (to === this.ep) {
          result.push({ from, to, piece, captured: color === "w" ? "p" : "P", enPassant: true });
        }
      });
    } else if (type === "n") {
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => add(row + dr, col + dc));
    } else if (type === "b") {
      slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
    } else if (type === "r") {
      slide([[-1,0],[1,0],[0,-1],[0,1]]);
    } else if (type === "q") {
      slide([[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]);
    } else if (type === "k") {
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => add(row + dr, col + dc));
      const enemy = color === "w" ? "b" : "w";
      if (!this.inCheck(color)) {
        const kingSide = color === "w" ? "K" : "k";
        const queenSide = color === "w" ? "Q" : "q";
        if (this.castling.includes(kingSide) && !this.board[from + 1] && !this.board[from + 2] &&
            !this.isAttacked(from + 1, enemy) && !this.isAttacked(from + 2, enemy)) {
          result.push({ from, to: from + 2, piece, captured: null, castle: "king" });
        }
        if (this.castling.includes(queenSide) && !this.board[from - 1] && !this.board[from - 2] && !this.board[from - 3] &&
            !this.isAttacked(from - 1, enemy) && !this.isAttacked(from - 2, enemy)) {
          result.push({ from, to: from - 2, piece, captured: null, castle: "queen" });
        }
      }
    }
    return result;
  }

  isAttacked(index, byColor) {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const at = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8 ? this.board[r * 8 + c] : null;
    const pawn = byColor === "w" ? "P" : "p";
    const pawnRow = row + (byColor === "w" ? 1 : -1);
    if (at(pawnRow, col - 1) === pawn || at(pawnRow, col + 1) === pawn) return true;
    const knight = byColor === "w" ? "N" : "n";
    if ([[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].some(([dr,dc]) => at(row + dr, col + dc) === knight)) return true;
    const king = byColor === "w" ? "K" : "k";
    if ([[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].some(([dr,dc]) => at(row + dr, col + dc) === king)) return true;
    const scan = (dirs, valid) => dirs.some(([dr, dc]) => {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const piece = at(r, c);
        if (piece) return colorOf(piece) === byColor && valid.includes(typeOf(piece));
        r += dr; c += dc;
      }
      return false;
    });
    return scan([[-1,-1],[-1,1],[1,-1],[1,1]], ["b", "q"]) || scan([[-1,0],[1,0],[0,-1],[0,1]], ["r", "q"]);
  }

  inCheck(color = this.turn) {
    const king = color === "w" ? "K" : "k";
    const index = this.board.indexOf(king);
    return index >= 0 && this.isAttacked(index, color === "w" ? "b" : "w");
  }

  applyUnchecked(move) {
    const piece = this.board[move.from];
    const color = colorOf(piece);
    this.board[move.from] = null;
    if (move.enPassant) this.board[move.to + (color === "w" ? 8 : -8)] = null;
    this.board[move.to] = move.promotion || piece;
    if (move.castle === "king") {
      this.board[move.to - 1] = this.board[move.to + 1];
      this.board[move.to + 1] = null;
    } else if (move.castle === "queen") {
      this.board[move.to + 1] = this.board[move.to - 2];
      this.board[move.to - 2] = null;
    }
    if (piece === "K") this.castling = this.castling.replace(/[KQ]/g, "");
    if (piece === "k") this.castling = this.castling.replace(/[kq]/g, "");
    if (move.from === 56 || move.to === 56) this.castling = this.castling.replace("Q", "");
    if (move.from === 63 || move.to === 63) this.castling = this.castling.replace("K", "");
    if (move.from === 0 || move.to === 0) this.castling = this.castling.replace("q", "");
    if (move.from === 7 || move.to === 7) this.castling = this.castling.replace("k", "");
    this.ep = move.doublePawn ? (move.from + move.to) / 2 : null;
    this.halfmove = typeOf(piece) === "p" || move.captured ? 0 : this.halfmove + 1;
    if (color === "b") this.fullmove += 1;
    this.lastMove = { ...move };
    this.turn = color === "w" ? "b" : "w";
  }

  move(from, to, promotion = null) {
    const fromIndex = typeof from === "string" ? squareToIndex(from) : from;
    const toIndex = typeof to === "string" ? squareToIndex(to) : to;
    const legal = this.moves(fromIndex).find(m => m.to === toIndex);
    if (!legal) return null;
    if (promotion) legal.promotion = this.turn === "w" ? promotion.toUpperCase() : promotion.toLowerCase();
    this.history.push(this.snapshot());
    this.applyUnchecked(legal);
    return legal;
  }

  status() {
    const legal = this.moves();
    if (!legal.length && this.inCheck()) return { over: true, type: "checkmate", winner: this.turn === "w" ? "b" : "w" };
    if (!legal.length) return { over: true, type: "stalemate", winner: null };
    if (this.halfmove >= 100) return { over: true, type: "draw", winner: null };
    return { over: false, type: this.inCheck() ? "check" : "playing", winner: null };
  }
}

export function moveCode(move) {
  return `${indexToSquare(move.from)}${indexToSquare(move.to)}`;
}

export function evaluate(game) {
  let score = 0;
  game.board.forEach((piece, index) => {
    if (!piece) return;
    const value = VALUES[typeOf(piece)];
    const row = Math.floor(index / 8), col = index % 8;
    const center = (3.5 - Math.abs(3.5 - row)) + (3.5 - Math.abs(3.5 - col));
    const activity = typeOf(piece) === "p" ? center * 4 : (typeOf(piece) === "n" || typeOf(piece) === "b" ? center * 3 : 0);
    score += (colorOf(piece) === "w" ? 1 : -1) * (value + activity);
  });
  return score;
}

export function bestMove(game, depth = 2) {
  const rootColor = game.turn;
  const search = (position, remaining, alpha, beta) => {
    const status = position.status();
    if (status.over) {
      if (status.type === "checkmate") return status.winner === "w" ? 999999 : -999999;
      return 0;
    }
    if (remaining === 0) return evaluate(position);
    const legal = position.moves().sort((a, b) => (b.captured ? VALUES[typeOf(b.captured)] : 0) - (a.captured ? VALUES[typeOf(a.captured)] : 0));
    if (position.turn === "w") {
      let value = -Infinity;
      for (const move of legal) {
        const next = position.clone(); next.applyUnchecked(move);
        value = Math.max(value, search(next, remaining - 1, alpha, beta));
        alpha = Math.max(alpha, value); if (alpha >= beta) break;
      }
      return value;
    }
    let value = Infinity;
    for (const move of legal) {
      const next = position.clone(); next.applyUnchecked(move);
      value = Math.min(value, search(next, remaining - 1, alpha, beta));
      beta = Math.min(beta, value); if (alpha >= beta) break;
    }
    return value;
  };
  const legal = game.moves();
  if (!legal.length) return null;
  const scored = legal.map(move => {
    const next = game.clone(); next.applyUnchecked(move);
    return { move, score: search(next, Math.max(0, depth - 1), -Infinity, Infinity) };
  });
  scored.sort((a, b) => rootColor === "w" ? b.score - a.score : a.score - b.score);
  return scored[0].move;
}

export { START };
