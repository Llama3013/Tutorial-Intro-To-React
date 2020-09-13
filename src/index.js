import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderBoard() {
    //This is array is to store the rows of squares
    let board = [];
    let col, row;
    for (row = 0; row < 3; row++) {
      //This array is to store a row of squares
      let squares = [];
      for (col = 0; col < 3; col++) {
        //This stores a square component into the array squares
        squares.push(this.renderSquare(3 * row + col));
      }
      //This stores a row of squares into the board array
      board.push(<div className="board-row">{squares}</div>);
    }
    return board;
  }

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  /*removed hardcoded rows and squares and now just runs render function
    inside a <div>*/
  render() {
    return <div>{this.renderBoard()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          col: Number,
          row: Number,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      isReversed: false,
    };
  }

  handleClick(i) {
    const position = calculatePosition(i);
    const col = position.col;
    const row = position.row;
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const histLength = history.length;
    const current = history[histLength - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          col: col,
          row: row,
        },
      ]),
      stepNumber: histLength,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    //This calculates the new position of the button if the state is reversed
    const newStep = this.state.isReversed
      ? this.state.history.length - step - 1
      : step;
    this.setState({
      stepNumber: newStep,
      xIsNext: newStep % 2 === 0,
    });
  }

  /*This simply changes the state of isReversed to the opposite it currently
    is and forces a rerender since the state is being changed*/
  reverse() {
    this.setState((state) => {
      return { isReversed: !state.isReversed };
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const isReversed = this.state.isReversed;
    //This checks if the history array needs to be reversed for ascending list
    const historyMap = isReversed ? history.slice(0).reverse() : history;

    const moves = historyMap.map((step, move) => {
      /*This element bold saves a ternary operator to check if the current
        game state is the same as the current step*/
      const bold =
        current === step ? { fontWeight: "bold" } : { fontWeight: "normal" };
      const reversedMove = isReversed ? this.state.history.length - move - 1 : move;
      const desc = reversedMove
        ? "Go to move #" +
          reversedMove +
          " at row: " +
          step.row +
          " col: " +
          step.col
        : "Go to game start";
      //Added style to the button to take on the bold element
      return (
        <li key={move}>
          <button style={bold} onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next Player: " + (this.state.xIsNext ? "X" : "O");
    }

    /*Added reverse button and modified the list of moves to change the order
      when reverse is toggled*/
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          {isReversed ? <ol reversed>{moves}</ol> : <ol>{moves}</ol>}
          <button onClick={() => this.reverse()}>
            {isReversed ? "Ascending" : "Descending"}
          </button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

/**
 * This function is used to calculate the position of the move made by the
 * user. This is down by looping through the columns and the rows until it
 * finds the position of the move. It returns an object of col: in the range
 * of 1-3 and row: in the range of 1-3.
 * @param {*} i
 */
function calculatePosition(i) {
  let col, row;
  let newI = 0;
  for (col = 1; col <= 3; col++) {
    for (row = 1; row <= 3; row++, newI++) {
      if (newI === i) {
        return {
          col: col,
          row: row,
        };
      }
    }
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
