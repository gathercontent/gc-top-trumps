import React from 'react';
import finalScoreStyles from './FinalScore.module.css';
import cardStyles from '../Card/card.module.css';
import {ScorePoint} from "../ScorePoint";
import {ReactComponent as LogoSvg} from '../../static/Logo.svg';
import asideStyles from "../ScoreAside/scoreAside.module.css";
import {FormatTime} from "../../src/utils/helpers";
import {Clock, Round, Wins} from "../Icons";
import {Button} from "../Button";

export function FinalScore({won, totalRounds, totalWins, timeElapsed, playAgainHandler}) {

   const time = FormatTime(timeElapsed)
   const score = 20000 - ((timeElapsed * 10) + (totalRounds * totalWins))

   return (
      <div className={finalScoreStyles.finalScoreCard}>
         <div className={cardStyles.card}>
            <div className={finalScoreStyles.logo}>
               <LogoSvg/>
            </div>
            <h1 className={finalScoreStyles.result}>{won ? 'You won!' : 'You lost!'}</h1>
            <div className={finalScoreStyles.scorePoints}>
               <div className={finalScoreStyles.scorePointRow}>
                  <ScorePoint  scorePointClassName="turnNumber"><Round /></ScorePoint>
                  <span className={finalScoreStyles.scoreTitle}>Total rounds</span>
                  <span className={finalScoreStyles.scoreValue}>{totalRounds}</span>
               </div>

               <div className={finalScoreStyles.scorePointRow}>
                  <ScorePoint scorePointClassName="wins"><Wins /></ScorePoint>
                  <span className={finalScoreStyles.scoreTitle}>Rounds won</span>
                  <span className={finalScoreStyles.scoreValue}>{totalWins}</span>
               </div>

               <div className={finalScoreStyles.scorePointRow}>
                  <ScorePoint scorePointClassName="time"><Clock /></ScorePoint>
                  <span className={finalScoreStyles.scoreTitle}>Time taken</span>

                  <span className={finalScoreStyles.scoreValue}>
                     <span className={asideStyles.stat}>{time.minutes}:{time.seconds}</span>
                     <span className={asideStyles.icon}></span>
                  </span>
               </div>
            </div>

            <p className={finalScoreStyles.finalScore}>Final Score</p>
            <div className={finalScoreStyles.finalScoreResult}>
               <h3 className={finalScoreStyles.behind}>{score}</h3>
               <h3 className={finalScoreStyles.infront}>{score}</h3>
            </div>
         </div>
         <Button className={finalScoreStyles.button} onClick={playAgainHandler}>Play Again</Button>
      </div>
   );
}
