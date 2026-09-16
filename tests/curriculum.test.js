import assert from "node:assert/strict";
import { ChessGame, moveCode } from "../engine.js";

const progressivePuzzles = [
  ["k7/pp6/8/8/8/8/PP6/2R3K1 w - - 0 1", "c1c8", "checkmate"],
  ["1k6/ppp5/8/8/8/8/PP6/4Q1K1 w - - 0 1", "e1e8", "checkmate"],
  ["7k/6pp/8/8/8/8/6PP/5QK1 w - - 0 1", "f1f8", "checkmate"],
  ["8/8/2q3k1/8/8/3N4/8/4K3 w - - 0 1", "d3e5", "check"]
];

for (const [fen, code, result] of progressivePuzzles) {
  const game = new ChessGame(fen);
  const move = game.moves().find(candidate => moveCode(candidate) === code);
  assert.ok(move, `${code} must be legal`);
  game.move(move.from, move.to);
  assert.equal(game.status().type, result, `${code} must produce ${result}`);
}

const strategyLines = [
  ["4k3/pp6/8/3N4/8/8/PP6/4K3 w - - 0 1", ["d5c7", "e8d7"]],
  ["6k1/8/8/8/8/8/4R3/4K3 w - - 0 1", ["e2e8", "g8f7"]],
  ["6k1/8/8/3P4/8/8/8/6K1 w - - 0 1", ["d5d6", "g8f7", "d6d7"]],
  ["4k3/4n3/8/8/8/8/8/4R1K1 w - - 0 1", ["e1e7", "e8f8"]],
  ["8/4k3/8/8/4K3/8/8/8 w - - 0 1", ["e4e5", "e7d7"]],
  ["8/8/8/8/P7/8/7k/K7 w - - 0 1", ["a4a5", "h2g3", "a5a6"]],
  ["7k/8/8/8/8/8/4Q3/6K1 w - - 0 1", ["e2e8", "h8g7", "e8e7"]],
  ["7k/P7/8/8/8/8/8/7K w - - 0 1", ["a7a8"]]
];

for (const [fen, line] of strategyLines) {
  const game = new ChessGame(fen);
  for (const code of line) {
    const move = game.moves().find(candidate => moveCode(candidate) === code);
    assert.ok(move, `${code} in strategy line must be legal`);
    game.move(move.from, move.to);
  }
}

console.log("All progressive curriculum tests passed.");
