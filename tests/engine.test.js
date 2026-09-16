import assert from "node:assert/strict";
import { ChessGame, squareToIndex, indexToSquare, moveCode, bestMove } from "../engine.js";

const game = new ChessGame();
assert.equal(game.moves().length, 20, "starting position has 20 legal moves");
assert.equal(indexToSquare(squareToIndex("e4")), "e4", "square conversion round-trips");
assert.ok(game.move("e2", "e4"), "e-pawn can move two squares");
assert.ok(game.move("e7", "e5"), "black can answer e5");
assert.ok(game.move("g1", "f3"), "knight develops legally");
assert.equal(game.move("f3", "f5"), null, "illegal knight move is rejected");

const castle = new ChessGame("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
assert.ok(castle.move("e1", "g1")?.castle, "white can castle kingside");
assert.equal(castle.board[squareToIndex("f1")], "R", "rook moves during castling");

const ep = new ChessGame();
ep.move("e2", "e4"); ep.move("a7", "a6"); ep.move("e4", "e5"); ep.move("d7", "d5");
assert.ok(ep.move("e5", "d6")?.enPassant, "en passant is legal immediately");
assert.equal(ep.board[squareToIndex("d5")], null, "captured pawn is removed en passant");

const promotion = new ChessGame("7k/P7/8/8/8/8/8/7K w - - 0 1");
promotion.move("a7", "a8");
assert.equal(promotion.board[squareToIndex("a8")], "Q", "pawn promotes to a queen");

const puzzlePositions = [
  ["7k/6pp/8/8/8/8/6PP/5RK1 w - - 0 1", "f1f8", "checkmate"],
  ["6k1/5ppp/8/8/8/8/6PP/3Q2K1 w - - 0 1", "d1d8", "checkmate"],
  ["7k/5K2/8/8/8/3B4/8/6R1 w - - 0 1", "g1g8", "checkmate"]
];
for (const [fen, code, expected] of puzzlePositions) {
  const position = new ChessGame(fen);
  const move = position.moves().find(candidate => moveCode(candidate) === code);
  assert.ok(move, `${code} is legal`);
  position.move(move.from, move.to);
  assert.equal(position.status().type, expected, `${code} produces ${expected}`);
}

const fork = new ChessGame("8/8/3q1k2/8/8/2N5/8/4K3 w - - 0 1");
assert.ok(fork.moves().some(move => moveCode(move) === "c3e4"), "knight fork move is legal");
fork.move("c3", "e4");
assert.ok(fork.inCheck("b"), "knight fork checks the king");
assert.equal(fork.board[squareToIndex("d6")], "q", "queen remains available to capture next");

const mateInOne = new ChessGame("7k/6pp/8/8/8/8/6PP/5RK1 w - - 0 1");
assert.equal(moveCode(bestMove(mateInOne, 2)), "f1f8", "coach finds forced mate");

console.log("All chess engine tests passed.");
