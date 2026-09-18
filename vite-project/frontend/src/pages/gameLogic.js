const GRID_SIZE = 3;
const CELL_SIZE = 100;

export const getSizeValue = (size) => {
  const sizeMap = { small: 1, medium: 2, large: 3 };
  return sizeMap[size];
};

export const getStartingPosition = (index) => ({
  x: (index % 2) * 120 + 10,
  y: Math.floor(index / 2) * 120 + 10,
});

export const getSizeForPiece = (index) => {
  if (index < 2) return 'small';
  if (index < 4) return 'medium';
  return 'large';
};

export const getTopPieceAtPosition = (pieceList, x, y) =>
  pieceList
    .filter((p) => p.placed && p.boardPosition && p.boardPosition.x === x && p.boardPosition.y === y)
    .sort((a, b) => getSizeValue(b.size) - getSizeValue(a.size))[0];

export const isValidPlacement = (piece, x, y, pieceList) => {
  const topPiece = getTopPieceAtPosition(
    pieceList.filter((other) => other.id !== piece.id),
    x,
    y
  );
  return !topPiece || getSizeValue(piece.size) > getSizeValue(topPiece.size);
};

export const WIN_LINES = [
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
  [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
  [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
  [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
  [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
];

export const checkWinner = (pieceList) => {
  for (const line of WIN_LINES) {
    const firstPiece = getTopPieceAtPosition(pieceList, line[0].x, line[0].y);
    if (!firstPiece) continue;
    const firstOwner = firstPiece.player;
    const allMatch = line.every(
      (cell) => getTopPieceAtPosition(pieceList, cell.x, cell.y)?.player === firstOwner
    );
    if (allMatch) return firstOwner;
  }
  return null;
};

export const getAiMove = (pieces) => {
  const availablePieces = pieces.filter((p) => p.player === 'player2' && !p.placed);
  if (!availablePieces.length) return null;

  const gridCoords = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
    x: index % GRID_SIZE,
    y: Math.floor(index / GRID_SIZE),
  }));

  const simulatePlacement = (piece, x, y, currentPieces) => {
    return currentPieces.map((p) =>
      p.id === piece.id
        ? { ...p, x: x * CELL_SIZE, y: y * CELL_SIZE, placed: true, boardPosition: { x, y } }
        : p
    );
  };

  const getSmallestLegalPiece = (x, y, currentPieces, player) => {
    const pList = currentPieces.filter(p => p.player === player && !p.placed);
    const topPiece = getTopPieceAtPosition(currentPieces, x, y);
    const topSize = topPiece ? getSizeValue(topPiece.size) : 0;
    return pList
      .filter((p) => getSizeValue(p.size) > topSize)
      .sort((a, b) => getSizeValue(a.size) - getSizeValue(b.size))[0];
  };

  const evaluateBoard = (currentPieces, player) => {
    let score = 0;
    for (const line of WIN_LINES) {
      const linePieces = line.map((coord) => getTopPieceAtPosition(currentPieces, coord.x, coord.y));
      const owner = linePieces[0]?.player;
      if (!owner) continue;
      const count = linePieces.filter(p => p?.player === owner).length;
      const weight = count === 3 ? 100 : count === 2 ? 10 : count === 1 ? 1 : 0;
      if (owner === player) score += weight;
      else score -= weight * 1.5;
    }
    return score;
  };

  // 1. Immediate Winning Move
  for (const cell of gridCoords) {
    const piece = getSmallestLegalPiece(cell.x, cell.y, pieces, 'player2');
    if (piece) {
      const simulated = simulatePlacement(piece, cell.x, cell.y, pieces);
      if (checkWinner(simulated) === 'player2') return { piece, cell };
    }
  }

  // 2. Immediate Blocking Move
  for (const cell of gridCoords) {
    const piece = getSmallestLegalPiece(cell.x, cell.y, pieces, 'player2');
    if (piece) {
      const simulated = simulatePlacement(piece, cell.x, cell.y, pieces);
      if (checkWinner(simulated) === 'player1') return { piece, cell };
    }
  }

  // 3. Look-ahead / Heuristic Search
  const potentialMoves = availablePieces.flatMap((piece) =>
    gridCoords
      .filter((cell) => isValidPlacement(piece, cell.x, cell.y, pieces))
      .map((cell) => {
        const simulatedAI = simulatePlacement(piece, cell.x, cell.y, pieces);
        let playerBestResponseScore = -Infinity;
        for (const pCell of gridCoords) {
          const pPiece = getSmallestLegalPiece(pCell.x, pCell.y, simulatedAI, 'player1');
          if (pPiece) {
            const simulatedBoth = simulatePlacement(pPiece, pCell.x, pCell.y, simulatedAI);
            const score = evaluateBoard(simulatedBoth, 'player1');
            if (score > playerBestResponseScore) playerBestResponseScore = score;
          }
        }
        return {
          piece,
          cell,
          score: evaluateBoard(simulatedAI, 'player2') - (playerBestResponseScore || 0)
        };
      })
  );

  return potentialMoves.length ? potentialMoves.sort((a, b) => b.score - a.score)[0] : null;
};
