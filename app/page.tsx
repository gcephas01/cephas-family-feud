"use client";

import { useEffect, useState } from "react";

type Answer = {
  text: string;
  points: number;
};

type Round = {
  question: string;
  answers: Answer[];
};

const starterRounds: Round[] = [
  {
    question: "Name something students do when the teacher leaves the room.",
    answers: [
      { text: "TALK", points: 38 },
      { text: "GET ON THEIR PHONE", points: 24 },
      { text: "MOVE AROUND", points: 18 },
      { text: "KEEP WORKING", points: 12 },
      { text: "SLEEP", points: 8 },
    ],
  },
];

function blankRound(): Round {
  return {
    question: "",
    answers: [
      { text: "", points: 0 },
      { text: "", points: 0 },
      { text: "", points: 0 },
    ],
  };
}

export default function Home() {
  const [mode, setMode] = useState<"home" | "setup" | "game">("home");

const [gameTitle, setGameTitle] = useState("My Family Feud Game");
const [rounds, setRounds] = useState<Round[]>(starterRounds);
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [strikes, setStrikes] = useState(0);
  const [teamOneScore, setTeamOneScore] = useState(0);
  const [teamTwoScore, setTeamTwoScore] = useState(0);
  const [showStrike, setShowStrike] = useState(false);

  useEffect(() => {
  const savedGame = localStorage.getItem("cephas-family-feud-game");

  if (savedGame) {
    try {
      const parsed = JSON.parse(savedGame);

      if (parsed.rounds && Array.isArray(parsed.rounds)) {
        setRounds(parsed.rounds);
        setGameTitle(parsed.title || "My Family Feud Game");
      } else if (Array.isArray(parsed)) {
        // Supports games saved before we added titles
        setRounds(parsed);
      }
    } catch {
      console.log("No valid saved Family Feud game found.");
    }
  }
}, []);

  const round = rounds[roundIndex];

  const roundBank =
    round?.answers.reduce(
      (total, answer, index) =>
        revealed.includes(index) ? total + answer.points : total,
      0
    ) ?? 0;

  function saveGame() {
    localStorage.setItem("cephas-family-feud-game", JSON.stringify(rounds));
    alert("Game saved on this computer.");
  }

  function exportGame() {
  const gameData = {
    version: 1,
    game: "family-feud",
    title: gameTitle,
    rounds,
  };

  const fileData = JSON.stringify(gameData, null, 2);

  const blob = new Blob([fileData], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const safeTitle =
    gameTitle
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "") || "Family-Feud";

  const link = document.createElement("a");

  link.href = url;
  link.download = `${safeTitle}.feud.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
function importGame(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result as string);

      if (
        imported.game !== "family-feud" ||
        !Array.isArray(imported.rounds)
      ) {
        alert("That is not a valid MCGSN Family Feud game.");
        return;
      }

      setGameTitle(imported.title || "Imported Family Feud Game");
      setRounds(imported.rounds);

      localStorage.setItem(
        "cephas-family-feud-game",
        JSON.stringify(imported)
      );

      alert(
        `"${imported.title || "Family Feud Game"}" is ready to play!`
      );
    } catch {
      alert("That game file could not be read.");
    }

    // Allows importing the same file again later
    event.target.value = "";
  };

  reader.readAsText(file);
}

  function startGame() {
    const usableRounds = rounds.filter(
      (item) =>
        item.question.trim() !== "" &&
        item.answers.some((answer) => answer.text.trim() !== "")
    );

    if (usableRounds.length === 0) {
      alert("Add at least one question and answer before starting.");
      return;
    }

    const cleanedRounds = usableRounds.map((item) => ({
      ...item,
      answers: item.answers.filter((answer) => answer.text.trim() !== ""),
    }));

    setRounds(cleanedRounds);
    localStorage.setItem(
  "cephas-family-feud-game",
  JSON.stringify({
    version: 1,
    game: "family-feud",
    title: gameTitle,
    rounds: cleanedRounds,
  })
);

    setRoundIndex(0);
    setRevealed([]);
    setStrikes(0);
    setTeamOneScore(0);
    setTeamTwoScore(0);
    setMode("game");
  }

  function createNewGame() {
  setGameTitle("My Family Feud Game");
  setRounds([blankRound()]);
  setMode("setup");
}

  function updateQuestion(roundNumber: number, value: string) {
    setRounds((current) =>
      current.map((item, index) =>
        index === roundNumber ? { ...item, question: value } : item
      )
    );
  }

  function updateAnswer(
    roundNumber: number,
    answerNumber: number,
    field: "text" | "points",
    value: string
  ) {
    setRounds((current) =>
      current.map((item, rIndex) => {
        if (rIndex !== roundNumber) return item;

        return {
          ...item,
          answers: item.answers.map((answer, aIndex) => {
            if (aIndex !== answerNumber) return answer;

            if (field === "points") {
              return {
                ...answer,
                points: Number(value) || 0,
              };
            }

            return {
              ...answer,
              text: value,
            };
          }),
        };
      })
    );
  }

  function addAnswer(roundNumber: number) {
    setRounds((current) =>
      current.map((item, index) =>
        index === roundNumber
          ? {
              ...item,
              answers: [...item.answers, { text: "", points: 0 }],
            }
          : item
      )
    );
  }

  function removeAnswer(roundNumber: number, answerNumber: number) {
    setRounds((current) =>
      current.map((item, index) =>
        index === roundNumber
          ? {
              ...item,
              answers: item.answers.filter(
                (_, index) => index !== answerNumber
              ),
            }
          : item
      )
    );
  }

  function addRound() {
    setRounds((current) => [...current, blankRound()]);
  }

  function removeRound(roundNumber: number) {
    if (rounds.length === 1) return;

    setRounds((current) =>
      current.filter((_, index) => index !== roundNumber)
    );
  }
function getAudioContext() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;

  if (!AudioContextClass) return null;

  return new AudioContextClass();
}

function playRevealSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  [659.25, 783.99, 987.77].forEach((frequency, index) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, now + index * 0.06);
    gain.gain.exponentialRampToValueAtTime(
      0.22,
      now + index * 0.06 + 0.01
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + index * 0.06 + 0.28
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now + index * 0.06);
    oscillator.stop(now + index * 0.06 + 0.3);
  });
}

function playStrikeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sawtooth";

  oscillator.frequency.setValueAtTime(150, now);
  oscillator.frequency.exponentialRampToValueAtTime(70, now + 0.65);

  gain.gain.setValueAtTime(0.28, now);
  gain.gain.setValueAtTime(0.28, now + 0.45);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.72);
}

function playWinSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const notes = [
    { frequency: 523.25, delay: 0 },
    { frequency: 659.25, delay: 0.1 },
    { frequency: 783.99, delay: 0.2 },
    { frequency: 1046.5, delay: 0.32 },
  ];

  notes.forEach(({ frequency, delay }) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(
      0.2,
      now + delay + 0.015
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + delay + 0.35
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now + delay);
    oscillator.stop(now + delay + 0.37);
  });
}
  function revealAnswer(index: number) {
  if (revealed.includes(index)) return;

  playRevealSound();
  setRevealed((current) => [...current, index]);
}

  function revealAll() {
    setRevealed(round.answers.map((_, index) => index));
  }

  function addStrike() {
    playStrikeSound();
    if (strikes < 3) {
      setStrikes((current) => current + 1);
    }

    setShowStrike(true);

    window.setTimeout(() => {
      setShowStrike(false);
    }, 900);
  }

  function clearStrikes() {
    setStrikes(0);
  }

  function awardRound(team: 1 | 2) {
  if (roundBank === 0) return;

  playWinSound();

  if (team === 1) {
    setTeamOneScore((score) => score + roundBank);
  } else {
    setTeamTwoScore((score) => score + roundBank);
  }
}

  function nextRound() {
    if (roundIndex < rounds.length - 1) {
      setRoundIndex((current) => current + 1);
      setRevealed([]);
      setStrikes(0);
    }
  }

  function previousRound() {
    if (roundIndex > 0) {
      setRoundIndex((current) => current - 1);
      setRevealed([]);
      setStrikes(0);
    }
  }

  function endGame() {
    setRoundIndex(0);
    setRevealed([]);
    setStrikes(0);
    setTeamOneScore(0);
    setTeamTwoScore(0);
    setShowStrike(false);
    setMode("home");
  }

  /* ---------------- HOME ---------------- */

  if (mode === "home") {
    return (
      <main className="startScreen">
        <div className="lightBurst" />

        <div className="startContent">
          <p className="networkLabel">
            MR. CEPHAS&apos; GAME SHOW NETWORK PRESENTS
          </p>

          <div className="feudLogoLarge">
            <span>FAMILY</span>
            <strong>FEUD</strong>
          </div>

          <p className="startTagline">CLASSROOM EDITION</p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <button
              className="startButton"
              onClick={() => setMode("setup")}
            >
              EDIT SAVED GAME
            </button>

            <button
              className="startButton"
              onClick={createNewGame}
            >
              NEW GAME
            </button>

<label
  className="startButton"
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  }}
>
  IMPORT GAME

  <input
    type="file"
    accept=".json,.feud.json"
    onChange={importGame}
    style={{ display: "none" }}
  />
</label>

            <button
              className="startButton"
              onClick={startGame}
            >
              PLAY GAME
            </button>
          </div>

          <p className="roundCount">
            {rounds.length} {rounds.length === 1 ? "ROUND" : "ROUNDS"} READY
          </p>
        </div>
      </main>
    );
  }

  /* ---------------- SETUP ---------------- */

  if (mode === "setup") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #061849 0%, #02091e 75%, #01040d 100%)",
          padding: "35px",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <p className="networkLabel">
            MR. CEPHAS&apos; FAMILY FEUD
          </p>

          <h1
            style={{
              fontSize: "42px",
              marginBottom: "8px",
            }}
          >
            Game Setup
          </h1>

          <p
            style={{
              color: "#9fb1d1",
              marginBottom: "35px",
            }}
          >
            Build your rounds, save the game, then take it to the board.
          </p>
<div
  style={{
    marginBottom: "30px",
  }}
>
  <label
    style={{
      display: "block",
      fontSize: "11px",
      fontWeight: 900,
      letterSpacing: "2px",
      marginBottom: "7px",
      color: "#a9b9da",
    }}
  >
    GAME TITLE
  </label>

  <input
    value={gameTitle}
    onChange={(event) => setGameTitle(event.target.value)}
    placeholder="Example: Sociology Norm Breakers"
    style={{
      width: "100%",
      padding: "15px",
      border: "2px solid #dbae3d",
      borderRadius: "8px",
      background: "#071f4d",
      color: "white",
      fontSize: "17px",
      fontWeight: 700,
    }}
  />
</div>

          {rounds.map((item, roundNumber) => (
            <section
              key={roundNumber}
              style={{
                marginBottom: "28px",
                padding: "25px",
                border: "2px solid #dbae3d",
                borderRadius: "14px",
                background: "#031536",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#ffd554",
                  }}
                >
                  Round {roundNumber + 1}
                </h2>

                {rounds.length > 1 && (
                  <button
                    onClick={() => removeRound(roundNumber)}
                    style={{
                      border: "1px solid #ff6575",
                      borderRadius: "7px",
                      background: "#7e1020",
                      color: "white",
                      padding: "8px 12px",
                      cursor: "pointer",
                    }}
                  >
                    REMOVE ROUND
                  </button>
                )}
              </div>

              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 900,
                  letterSpacing: "2px",
                  marginBottom: "7px",
                  color: "#a9b9da",
                }}
              >
                QUESTION
              </label>

              <input
                value={item.question}
                onChange={(event) =>
                  updateQuestion(roundNumber, event.target.value)
                }
                placeholder="Enter the survey question..."
                style={{
                  width: "100%",
                  padding: "15px",
                  marginBottom: "20px",
                  border: "2px solid #397bc2",
                  borderRadius: "8px",
                  background: "#071f4d",
                  color: "white",
                  fontSize: "17px",
                }}
              />

              {item.answers.map((answer, answerNumber) => (
                <div
                  key={answerNumber}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "50px 1fr 110px 45px",
                    gap: "10px",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <strong
                    style={{
                      textAlign: "center",
                      color: "#ffd554",
                    }}
                  >
                    {answerNumber + 1}
                  </strong>

                  <input
                    value={answer.text}
                    onChange={(event) =>
                      updateAnswer(
                        roundNumber,
                        answerNumber,
                        "text",
                        event.target.value
                      )
                    }
                    placeholder="Answer"
                    style={{
                      padding: "12px",
                      border: "1px solid #397bc2",
                      borderRadius: "7px",
                      background: "#071f4d",
                      color: "white",
                    }}
                  />

                  <input
                    type="number"
                    min="0"
                    value={answer.points}
                    onChange={(event) =>
                      updateAnswer(
                        roundNumber,
                        answerNumber,
                        "points",
                        event.target.value
                      )
                    }
                    placeholder="Points"
                    style={{
                      padding: "12px",
                      border: "1px solid #397bc2",
                      borderRadius: "7px",
                      background: "#071f4d",
                      color: "white",
                    }}
                  />

                  <button
                    onClick={() =>
                      removeAnswer(roundNumber, answerNumber)
                    }
                    disabled={item.answers.length === 1}
                    style={{
                      height: "42px",
                      border: "1px solid rgba(255,255,255,.2)",
                      borderRadius: "7px",
                      background: "rgba(255,255,255,.08)",
                      color: "white",
                      cursor:
                        item.answers.length === 1
                          ? "default"
                          : "pointer",
                      opacity:
                        item.answers.length === 1 ? 0.25 : 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                onClick={() => addAnswer(roundNumber)}
                style={{
                  marginTop: "10px",
                  padding: "10px 15px",
                  border: "1px solid #dbae3d",
                  borderRadius: "7px",
                  background: "rgba(219,174,61,.1)",
                  color: "#ffd554",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                + ADD ANSWER
              </button>
            </section>
          ))}

          <button
            onClick={addRound}
            style={{
              width: "100%",
              padding: "17px",
              marginBottom: "30px",
              border: "2px dashed #397bc2",
              borderRadius: "10px",
              background: "rgba(57,123,194,.08)",
              color: "#9ecaff",
              fontWeight: 900,
              letterSpacing: "1px",
              cursor: "pointer",
            }}
          >
            + ADD ROUND
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              className="controlButton"
              onClick={() => setMode("home")}
            >
              ← HOME
            </button>

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <button
  className="controlButton"
  onClick={saveGame}
>
  SAVE GAME
</button>

<button
  className="controlButton"
  onClick={exportGame}
>
  EXPORT GAME
</button>

<button
  className="startButton"
  onClick={startGame}
>
  SAVE & PLAY
</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ---------------- GAME ---------------- */

  return (
    <main className="gameScreen">
      <div className="stageLights" />

      {showStrike && (
        <div className="strikeOverlay">
          <div className="giantX">X</div>
        </div>
      )}

      <header className="gameHeader">
        <div className="miniLogo">
          <span>FAMILY</span>
          <strong>FEUD</strong>
        </div>

        <div className="roundIndicator">
          ROUND {roundIndex + 1} <span>/</span> {rounds.length}
        </div>

        <div className="strikeTracker">
          {[0, 1, 2].map((strike) => (
            <span
              key={strike}
              className={strike < strikes ? "activeStrike" : ""}
            >
              X
            </span>
          ))}
        </div>
      </header>

      <section className="questionPanel">
        <p>{round.question}</p>
      </section>

      <section className="mainGameArea">
        <aside className="teamPanel">
          <p>TEAM 1</p>
          <strong>{teamOneScore}</strong>

          <button
            className="awardButton"
            onClick={() => awardRound(1)}
          >
            + {roundBank}
          </button>
        </aside>

        <section className="boardWrap">
          <div className="answerBoard">
            {round.answers.map((answer, index) => {
              const isRevealed = revealed.includes(index);

              return (
                <button
                  key={index}
                  className={`answerSlot ${
                    isRevealed ? "revealed" : ""
                  }`}
                  onClick={() => revealAnswer(index)}
                >
                  {isRevealed ? (
                    <>
                      <span className="answerText">
                        {answer.text}
                      </span>

                      <span className="answerPoints">
                        {answer.points}
                      </span>
                    </>
                  ) : (
                    <span className="answerNumber">
                      {index + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bankPanel">
            <span>ROUND BANK</span>
            <strong>{roundBank}</strong>
          </div>
        </section>

        <aside className="teamPanel">
          <p>TEAM 2</p>
          <strong>{teamTwoScore}</strong>

          <button
            className="awardButton"
            onClick={() => awardRound(2)}
          >
            + {roundBank}
          </button>
        </aside>
      </section>

      <section className="controlBar">
        <button
          className="controlButton"
          onClick={previousRound}
          disabled={roundIndex === 0}
        >
          ← PREVIOUS
        </button>

        <button
          className="controlButton"
          onClick={revealAll}
        >
          REVEAL ALL
        </button>

        <button
          className="strikeButton"
          onClick={addStrike}
        >
          X
          <span>STRIKE</span>
        </button>

        <button
          className="controlButton"
          onClick={clearStrikes}
        >
          CLEAR X&apos;S
        </button>

        {roundIndex < rounds.length - 1 ? (
          <button
            className="controlButton next"
            onClick={nextRound}
          >
            NEXT ROUND →
          </button>
        ) : (
          <button
            className="controlButton next"
            onClick={endGame}
          >
            END GAME
          </button>
        )}
      </section>
    </main>
  );
}