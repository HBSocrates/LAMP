import { useEffect, useState } from 'react'
import '../styles/App.css'
import '../styles/RussianJiangi.css'
import RussianDoll from '../assets/matryoshka-doll.svg'
import RussianDoll2 from '../assets/matryoshka-doll2.svg'

function RussianJiangi() {
  const GRID_SIZE = 3
  const CELL_SIZE = 100
  const PIECES_PER_PLAYER = 6
  const TOTAL_PIECES = PIECES_PER_PLAYER * 2
  const START_PLAYER = 'player1'
  const WIN_LINES = [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
    [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
  ]

  const getSizeForPiece = (index) => {
    if (index < 2) return 'small'
    if (index < 4) return 'medium'
    return 'large'
  }

  const getStartingPosition = (index) => ({
    x: (index % 3) * 120 + 10,
    y: Math.floor(index / 3) * 120 + 10,
  })

  const [pieces, setPieces] = useState(
    Array.from({ length: TOTAL_PIECES }, (_, i) => {
      const playerIndex = i % PIECES_PER_PLAYER
      return {
        id: i,
        player: i < PIECES_PER_PLAYER ? 'player1' : 'player2',
        x: getStartingPosition(i).x,
        y: getStartingPosition(i).y,
        placed: false,
        boardPosition: null,
        size: getSizeForPiece(playerIndex),
      }
    })
  )

  const [currentPlayer, setCurrentPlayer] = useState(START_PLAYER)
  const [draggingPiece, setDraggingPiece] = useState(null)
  const [dragStartData, setDragStartData] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [winner, setWinner] = useState(null)
  const [gameMode, setGameMode] = useState('ai')
  const [onlineStatus, setOnlineStatus] = useState('lobby')
  const [gameId, setGameId] = useState(null)
  const [playerRole, setPlayerRole] = useState(null)
  const [joinGameId, setJoinGameId] = useState('')
  const username = localStorage.getItem('username')

  const getAsset = (player) => (player === 'player1' ? RussianDoll : RussianDoll2)

  const handleMouseMove = (e) => {
    if (draggingPiece === null) return

    const boardElement = document.getElementById('puzzle-board')
    if (!boardElement) return

    const boardRect = boardElement.getBoundingClientRect()
    const x = e.clientX - boardRect.left - offset.x
    const y = e.clientY - boardRect.top - offset.y

    setPieces((prevPieces) =>
      prevPieces.map((p) =>
        p.id === draggingPiece ? { ...p, x, y } : p
      )
    )
  }

  const syncGameState = async () => {
    if (!gameId) return
    try {
      const response = await fetch(`/api/game/state/${gameId}`)
      if (!response.ok) return
      const data = await response.json()

      // Sync pieces
      setPieces(data.state_pieces)

      // Sync current player
      setCurrentPlayer(data.current_player)

      // Sync winner
      if (data.winner) {
        setWinner(data.winner)
      }

      // Update online status if player 2 joined
      if (onlineStatus === 'waiting' && data.status === 'active') {
        setOnlineStatus('active')
      }
    } catch (err) {
      console.error('Error syncing game state:', err)
    }
  }

  useEffect(() => {
    let interval
    if (gameMode === 'online' && gameId) {
      interval = setInterval(syncGameState, 1500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameMode, gameId, onlineStatus])

  const snapToGrid = (x, y) => {
    const snappedX = Math.round(x / CELL_SIZE) * CELL_SIZE
    const snappedY = Math.round(y / CELL_SIZE) * CELL_SIZE
    return { snappedX, snappedY }
  }

  const isWithinBoard = (x, y) => {
    return (
      x >= 0 &&
      x < GRID_SIZE * CELL_SIZE &&
      y >= 0 &&
      y < GRID_SIZE * CELL_SIZE
    )
  }

  const getSizeValue = (size) => {
    const sizeMap = { small: 1, medium: 2, large: 3 }
    return sizeMap[size]
  }

  const getTopPieceAtPosition = (pieceList, x, y) =>
    pieceList
      .filter(
        (p) =>
          p.placed &&
          p.boardPosition &&
          p.boardPosition.x === x &&
          p.boardPosition.y === y
      )
      .sort((a, b) => getSizeValue(b.size) - getSizeValue(a.size))[0]

  const isValidPlacement = (piece, x, y, pieceList) => {
    const topPiece = getTopPieceAtPosition(
      pieceList.filter((other) => other.id !== piece.id),
      x,
      y
    )
    return !topPiece || getSizeValue(piece.size) > getSizeValue(topPiece.size)
  }

  const checkWinner = (pieceList) => {
    for (const line of WIN_LINES) {
      const firstPiece = getTopPieceAtPosition(pieceList, line[0].x, line[0].y)
      if (!firstPiece) continue
      const firstOwner = firstPiece.player
      const allMatch = line.every(
        (cell) => getTopPieceAtPosition(pieceList, cell.x, cell.y)?.player === firstOwner
      )
      if (allMatch) return firstOwner
    }
    return null
  }

  const getAiMove = () => {
    const availablePieces = pieces.filter(
      (p) => p.player === 'player2' && !p.placed
    )
    if (!availablePieces.length) return null

    const gridCoords = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
      x: index % GRID_SIZE,
      y: Math.floor(index / GRID_SIZE),
    }))

    const simulatePlacement = (piece, x, y, currentPieces) => {
      return currentPieces.map((p) =>
        p.id === piece.id
          ? {
              ...p,
              x: x * CELL_SIZE,
              y: y * CELL_SIZE,
              placed: true,
              boardPosition: { x, y },
            }
          : p
      )
    }

    const getSmallestLegalPiece = (x, y, currentPieces, player) => {
      const pList = currentPieces.filter(p => p.player === player && !p.placed)
      const topPiece = getTopPieceAtPosition(currentPieces, x, y)
      const topSize = topPiece ? getSizeValue(topPiece.size) : 0

      return pList
        .filter((p) => getSizeValue(p.size) > topSize)
        .sort((a, b) => getSizeValue(a.size) - getSizeValue(b.size))[0]
    }

    const evaluateBoard = (currentPieces, player) => {
      let score = 0
      const opponent = player === 'player1' ? 'player2' : 'player1'

      for (const line of WIN_LINES) {
        const linePieces = line.map((coord) => getTopPieceAtPosition(currentPieces, coord.x, coord.y))
        const owner = linePieces[0]?.player
        if (!owner) continue

        const count = linePieces.filter(p => p?.player === owner).length
        const weight = count === 3 ? 100 : count === 2 ? 10 : count === 1 ? 1 : 0

        if (owner === player) score += weight
        else score -= weight * 1.5 // Prioritize blocking opponent
      }
      return score
    }

    // 1. Immediate Winning Move
    for (const cell of gridCoords) {
      const piece = getSmallestLegalPiece(cell.x, cell.y, pieces, 'player2')
      if (piece) {
        const simulated = simulatePlacement(piece, cell.x, cell.y, pieces)
        if (checkWinner(simulated) === 'player2') return { piece, cell }
      }
    }

    // 2. Immediate Blocking Move
    for (const cell of gridCoords) {
      const piece = getSmallestLegalPiece(cell.x, cell.y, pieces, 'player2')
      if (piece) {
        const simulated = simulatePlacement(piece, cell.x, cell.y, pieces)
        if (checkWinner(simulated) === 'player1') return { piece, cell }
      }
    }

    // 3. Look-ahead / Heuristic Search
    const potentialMoves = availablePieces.flatMap((piece) =>
      gridCoords
        .filter((cell) => isValidPlacement(piece, cell.x, cell.y, pieces))
        .map((cell) => {
          const simulatedAI = simulatePlacement(piece, cell.x, cell.y, pieces)

          // Simulate player's best response
          let playerBestResponseScore = -Infinity
          for (const pCell of gridCoords) {
            const pPiece = getSmallestLegalPiece(pCell.x, pCell.y, simulatedAI, 'player1')
            if (pPiece) {
              const simulatedBoth = simulatePlacement(pPiece, pCell.x, pCell.y, simulatedAI)
              const score = evaluateBoard(simulatedBoth, 'player1')
              if (score > playerBestResponseScore) playerBestResponseScore = score
            }
          }

          return {
            piece,
            cell,
            score: evaluateBoard(simulatedAI, 'player2') - (playerBestResponseScore || 0)
          }
        })
    )

    if (potentialMoves.length) {
      return potentialMoves.sort((a, b) => b.score - a.score)[0]
    }

    return null
  }

  const executeAiMove = (piece, cell) => {
    const updatedPieces = pieces.map((p) =>
      p.id === piece.id
        ? {
            ...p,
            x: cell.x * CELL_SIZE,
            y: cell.y * CELL_SIZE,
            placed: true,
            boardPosition: { x: cell.x, y: cell.y },
          }
        : p
    )
    const newWinner = checkWinner(updatedPieces)
    setPieces(updatedPieces)
    if (newWinner) {
      setWinner(newWinner)
    } else {
      setCurrentPlayer('player1')
    }
  }

  useEffect(() => {
    if (winner || gameMode !== 'ai' || currentPlayer !== 'player2') return

    const aiMove = getAiMove()
    if (!aiMove) {
      setCurrentPlayer('player1')
      return
    }

    const timer = setTimeout(() => {
      executeAiMove(aiMove.piece, aiMove.cell)
    }, 400)

    return () => clearTimeout(timer)
  }, [currentPlayer, winner, pieces, gameMode])

  const handleMouseDown = (e, pieceId) => {
    const piece = pieces.find((p) => p.id === pieceId)
    if (!piece || winner || piece.player !== currentPlayer) return
    if (gameMode === 'ai' && piece.player === 'player2') return
    if (gameMode === 'online' && playerRole !== currentPlayer) return

    const rect = e.currentTarget.getBoundingClientRect()
    setDraggingPiece(pieceId)
    setDragStartData({
      x: piece.x,
      y: piece.y,
      boardPosition: piece.boardPosition,
      placed: piece.placed,
    })
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseUp = async () => {
    if (draggingPiece === null) return

    const draggedPiece = pieces.find((p) => p.id === draggingPiece)
    const updatedPieces = pieces.map((p) => {
      if (p.id !== draggingPiece) return p

      const { snappedX, snappedY } = snapToGrid(p.x, p.y)
      const start = getStartingPosition(p.id)
      const originalBoardPosition = dragStartData?.boardPosition
      const originalPlaced = dragStartData?.placed

      if (isWithinBoard(snappedX, snappedY)) {
        const topPiece = getTopPieceAtPosition(
          pieces.filter((other) => other.id !== draggingPiece),
          snappedX / CELL_SIZE,
          snappedY / CELL_SIZE
        )
        const currentPieceSize = getSizeValue(p.size)

        if (!topPiece || currentPieceSize > getSizeValue(topPiece.size)) {
          // In online mode, we will submit the move to the server
          if (gameMode === 'online') {
            return p // Keep current position until server response (or optimistic update)
          }

          return {
            ...p,
            x: snappedX,
            y: snappedY,
            placed: true,
            boardPosition: { x: snappedX / CELL_SIZE, y: snappedY / CELL_SIZE },
          }
        }
      }

      if (originalPlaced) {
        return {
          ...p,
          x: dragStartData.x,
          y: dragStartData.y,
          placed: true,
          boardPosition: originalBoardPosition,
        }
      }

      return {
        ...p,
        x: start.x,
        y: start.y,
        placed: false,
        boardPosition: null,
      }
    })

    if (gameMode !== 'online') {
      setPieces(updatedPieces)
      const newWinner = checkWinner(updatedPieces)
      if (newWinner) {
        setWinner(newWinner)
      } else {
        const placedPiece = updatedPieces.find((p) => p.id === draggingPiece)
        const moveSucceeded = placedPiece?.placed &&
          (!dragStartData?.placed ||
            JSON.stringify(placedPiece.boardPosition) !== JSON.stringify(dragStartData.boardPosition))

        if (moveSucceeded) {
          setCurrentPlayer((prev) => (prev === 'player1' ? 'player2' : 'player1'))
        }
      }
    } else {
      // Online Multiplayer Move Submission
      const { snappedX, snappedY } = snapToGrid(pieces.find(p => p.id === draggingPiece).x, pieces.find(p => p.id === draggingPiece).y)
      if (isWithinBoard(snappedX, snappedY)) {
        try {
          const response = await fetch('/api/game/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              game_id: gameId,
              username: username,
              piece_id: draggingPiece,
              x: snappedX / CELL_SIZE,
              y: snappedY / CELL_SIZE,
            }),
          })

          if (!response.ok) {
            const data = await response.json()
            alert(data.message || 'Move rejected')
            // Snap back on error
            setPieces(updatedPieces)
          } else {
            // Move succeeded, syncGameState polling will pick it up, or update local state
            const data = await response.json()
            setPieces(data.state_pieces)
            setCurrentPlayer(data.current_player)
            if (data.winner) setWinner(data.winner)
          }
        } catch (err) {
          console.error('Move failed:', err)
          setPieces(updatedPieces)
        }
      } else {
        setPieces(updatedPieces)
      }
    }

    setDraggingPiece(null)
    setDragStartData(null)
  }

  const createGame = async () => {
    if (!username) {
      alert('Please log in first to create a game')
      return
    }
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username }),
      })
      const data = await response.json()
      if (response.ok) {
        setGameId(data.game_id)
        setPlayerRole('player1')
        setOnlineStatus('waiting')
      } else {
        alert(data.message || 'Failed to create game')
      }
    } catch (err) {
      console.error('Create game error:', err)
      alert('An error occurred while creating the game')
    }
  }

  const joinGame = async () => {
    if (!username) {
      alert('Please log in first to join a game')
      return
    }
    if (!joinGameId) {
      alert('Please enter a game ID')
      return
    }
    try {
      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          game_id: joinGameId,
          username,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setGameId(data.game_id)
        setPlayerRole('player2')
        setOnlineStatus('active')
      } else {
        alert(data.message || 'Failed to join game')
      }
    } catch (err) {
      console.error('Join game error:', err)
      alert('An error occurred while joining the game')
    }
  }

  const resetPuzzle = () => {
    setGameId(null)
    setPlayerRole(null)
    setOnlineStatus('lobby')
    setPieces(
      Array.from({ length: TOTAL_PIECES }, (_, i) => {
        const playerIndex = i % PIECES_PER_PLAYER
        return {
          id: i,
          player: i < PIECES_PER_PLAYER ? 'player1' : 'player2',
          x: getStartingPosition(i).x,
          y: getStartingPosition(i).y,
          placed: false,
          boardPosition: null,
          size: getSizeForPiece(playerIndex),
        }
      })
    )
    setCurrentPlayer(START_PLAYER)
    setWinner(null)
  }

  const placedCount = pieces.filter((p) => p.placed).length
  const remainingByPlayer = {
    player1: pieces.filter((p) => p.player === 'player1' && !p.placed).length,
    player2: pieces.filter((p) => p.player === 'player2' && !p.placed).length,
  }
  const placedBySize = {
    small: pieces.filter((p) => p.placed && p.size === 'small').length,
    medium: pieces.filter((p) => p.placed && p.size === 'medium').length,
    large: pieces.filter((p) => p.placed && p.size === 'large').length,
  }
  const currentPlayerLabel = currentPlayer === 'player1' ? 'RussianDoll' : 'RussianDoll2'

  return (
    <div className="russian-jiangi-container" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <h1>Russian Jiangi</h1>
      <div className="game-header">
        <div className="mode-select">
          <button
            className={gameMode === 'ai' ? 'active' : ''}
            onClick={() => {
              setGameMode('ai')
              resetPuzzle()
            }}
          >
            Play vs AI
          </button>
          <button
            className={gameMode === 'twoPlayer' ? 'active' : ''}
            onClick={() => {
              setGameMode('twoPlayer')
              resetPuzzle()
            }}
          >
            Two Player
          </button>
          <button
            className={gameMode === 'online' ? 'active' : ''}
            onClick={() => {
              setGameMode('online')
              resetPuzzle()
            }}
          >
            Online
          </button>
        </div>
        <p className="puzzle-status">
          Turn: <strong>{currentPlayerLabel}</strong>
        </p>
      </div>

      {gameMode === 'online' && onlineStatus === 'lobby' && (
        <div className="online-lobby">
          <h3>Online Multiplayer Lobby</h3>
          <div className="lobby-actions">
            <div className="lobby-box">
              <h4>Create Game</h4>
              <button onClick={createGame}>Create New Game</button>
            </div>
            <div className="lobby-box">
              <h4>Join Game</h4>
              <input
                type="text"
                placeholder="Enter Game ID"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value)}
              />
              <button onClick={joinGame}>Join Game</button>
            </div>
          </div>
          {!username && <p className="lobby-warning">Please log in to play online!</p>}
        </div>
      )}

      {gameMode === 'online' && onlineStatus === 'waiting' && (
        <div className="online-waiting">
          <h3>Waiting for Opponent...</h3>
          <p>Your Game ID: <strong>{gameId}</strong></p>
          <p>Share this ID with your friend to start!</p>
          <button onClick={() => setOnlineStatus('lobby')}>Cancel</button>
        </div>
      )}

      <div className="puzzle-wrapper">
        {/* Puzzle Board */}
        <div
          id="puzzle-board"
          className="puzzle-board"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div key={`cell-${i}`} className="grid-cell" />
          ))}

          {/* Pieces on board */}
          {pieces
            .filter((p) => p.placed)
            .sort((a, b) => getSizeValue(a.size) - getSizeValue(b.size))
            .map((piece) => {
              const canDragPlaced =
                piece.player === currentPlayer &&
                !(gameMode === 'ai' && piece.player === 'player2')
              return (
                <div
                  key={`piece-${piece.id}`}
                  className={`puzzle-piece placed ${piece.size}`}
                  style={{
                    left: piece.x,
                    top: piece.y,
                    zIndex: getSizeValue(piece.size),
                    cursor: canDragPlaced ? 'grab' : 'default',
                    opacity: canDragPlaced ? 1 : 0.9,
                  }}
                  draggable={false}
                  onMouseDown={canDragPlaced ? (e) => handleMouseDown(e, piece.id) : undefined}
                >
                  <img src={getAsset(piece.player)} alt={`${piece.player} piece`} />
                </div>
              )
            })}
        </div>

        {/* Available Pieces */}
        <div className="pieces-container">
          <h3>Available Pieces</h3>
          <p className="stacking-hint">💡 Larger pieces can be placed over smaller pieces!</p>
          <div className="pieces-grid">
            {pieces.map(
              (piece) =>
                !piece.placed && (
                  <div
                    key={`piece-${piece.id}`}
                    className={`puzzle-piece draggable ${piece.size} ${piece.player}`}
                    onMouseDown={(e) => handleMouseDown(e, piece.id)}
                    data-size={piece.size}
                    style={{
                      left: piece.x,
                      top: piece.y,
                      cursor: piece.player === currentPlayer ? (draggingPiece === piece.id ? 'grabbing' : 'grab') : 'not-allowed',
                      opacity: piece.player === currentPlayer ? 1 : 0.45,
                    }}
                  >
                    <img src={getAsset(piece.player)} alt={`${piece.player} piece`} />
                  </div>
                )
            )}
          </div>
        </div>
      </div>

      <button className="reset-button" onClick={resetPuzzle}>
        Reset Game
      </button>

      {winner && (
        <div className="completion-message">
          🏆 {winner === 'player1' ? 'Player 1' : 'Player 2'} wins!
        </div>
      )}

      {!winner && placedCount === TOTAL_PIECES && (
        <div className="completion-message">It's a draw! No winner this time.</div>
      )}
    </div>
  )
}

export default RussianJiangi